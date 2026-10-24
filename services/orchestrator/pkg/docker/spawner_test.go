package docker

import (
	"archive/tar"
	"context"
	"crypto/rand"
	"fmt"
	"io"
	"net/netip"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/moby/moby/client"
)

func TestDynamicFlagArchive(t *testing.T) {
	flag := "flag{0123456789abcdef01234567}"
	archive, err := flagArchive(flag)
	if err != nil {
		t.Fatal(err)
	}
	reader := tar.NewReader(archive)
	header, err := reader.Next()
	if err != nil {
		t.Fatal(err)
	}
	if header.Name != "flag.txt" || header.Mode != 0400 || header.Uid != 0 || header.Gid != 0 {
		t.Fatal("flag archive has unsafe path or permissions")
	}
	content, err := io.ReadAll(reader)
	if err != nil || string(content) != flag+"\n" {
		t.Fatal("flag archive content differs from expected flag")
	}
	if _, err := reader.Next(); err != io.EOF {
		t.Fatal("flag archive contains unexpected files")
	}
}

func TestDynamicFlagDockerSmoke(t *testing.T) {
	image := os.Getenv("CF_DOCKER_SMOKE_IMAGE")
	if image == "" {
		t.Skip("set CF_DOCKER_SMOKE_IMAGE to test against a local target image")
	}
	spawner, err := NewSpawner()
	if err != nil {
		t.Fatal(err)
	}
	defer spawner.Close()
	var randomID [16]byte
	if _, err := rand.Read(randomID[:]); err != nil {
		t.Fatal(err)
	}
	id := fmt.Sprintf("%x-%x-%x-%x-%x", randomID[:4], randomID[4:6], randomID[6:8], randomID[8:10], randomID[10:])
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	flag := "flag{0123456789abcdef01234567}"
	instance, err := spawner.Spawn(ctx, id, image, flag)
	if err != nil {
		t.Fatal(err)
	}
	defer func() {
		if err := spawner.Stop(context.Background(), id); err != nil {
			t.Errorf("stop lab: %v", err)
		}
	}()
	file, err := spawner.cli.CopyFromContainer(ctx, instance.ContainerID, client.CopyFromContainerOptions{SourcePath: "/root/flag.txt"})
	if err != nil {
		t.Fatal(err)
	}
	defer file.Content.Close()
	reader := tar.NewReader(file.Content)
	header, err := reader.Next()
	if err != nil {
		t.Fatal(err)
	}
	content, err := io.ReadAll(reader)
	if err != nil || string(content) != flag+"\n" || header.Mode != 0400 {
		t.Fatal("target flag file has incorrect contents or permissions")
	}
	inspect, err := spawner.cli.ContainerInspect(ctx, instance.ContainerID, client.ContainerInspectOptions{})
	if err != nil {
		t.Fatal(err)
	}
	for _, value := range inspect.Container.Config.Env {
		if strings.Contains(value, flag) {
			t.Fatal("dynamic flag leaked into container environment")
		}
	}
}

func TestSandboxPolicy(t *testing.T) {
	id := "11111111-1111-4111-8111-111111111111"
	for i := uint32(0); i < 32; i++ {
		prefix := netip.MustParsePrefix(subnet(id, i))
		if prefix.Bits() != 29 || !netip.MustParsePrefix("100.64.0.0/10").Contains(prefix.Addr()) {
			t.Fatalf("subnet outside lab range: %s", prefix)
		}
		if netip.MustParsePrefix("100.127.240.0/20").Contains(prefix.Addr()) {
			t.Fatalf("lab subnet overlaps reserved VPN range: %s", prefix)
		}
	}
	containerConfig, hostConfig, networkingConfig := config("cyberforce/test:v1", id, "cf-lab-net-test")
	if containerConfig.Image != "cyberforce/test:v1" || hostConfig.Resources.NanoCPUs != 2_000_000_000 || hostConfig.Resources.Memory != 2*1024*1024*1024 || hostConfig.Resources.MemorySwap != hostConfig.Resources.Memory || *hostConfig.Resources.PidsLimit != 512 {
		t.Fatal("lab resource policy changed")
	}
	if len(hostConfig.CapDrop) != 1 || hostConfig.CapDrop[0] != "ALL" || hostConfig.Privileged || len(hostConfig.Binds) != 0 || len(hostConfig.PortBindings) != 0 {
		t.Fatal("lab privilege policy changed")
	}
	if _, ok := networkingConfig.EndpointsConfig["cf-lab-net-test"]; !ok {
		t.Fatal("lab is not attached to isolated network")
	}
}

func TestTerminalPolicy(t *testing.T) {
	id := "11111111-1111-4111-8111-111111111111"
	config, host, networking := terminalConfig(id, "cf-lab-net-"+id)
	if config.User != "65534:65534" || config.WorkingDir != "/tmp" || config.Image != terminalImage || config.Labels[labelOwner] != id {
		t.Fatal("terminal identity policy changed")
	}
	if !host.ReadonlyRootfs || host.Resources.Memory != 512*1024*1024 || host.Resources.MemorySwap != host.Resources.Memory || host.Resources.NanoCPUs != 500_000_000 || *host.Resources.PidsLimit != 128 {
		t.Fatal("terminal resource policy changed")
	}
	if len(host.CapDrop) != 1 || host.CapDrop[0] != "ALL" || host.Privileged || len(host.Binds) != 0 || len(host.PortBindings) != 0 || host.Tmpfs["/tmp"] == "" {
		t.Fatal("terminal privilege policy changed")
	}
	if len(networking.EndpointsConfig) != 1 || networking.EndpointsConfig["cf-lab-net-"+id] == nil {
		t.Fatal("terminal must use only the isolated lab network")
	}
}
