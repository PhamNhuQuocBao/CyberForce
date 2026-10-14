package docker

import (
	"net/netip"
	"testing"
)

func TestSandboxPolicy(t *testing.T) {
	id := "11111111-1111-4111-8111-111111111111"
	for i := uint32(0); i < 32; i++ {
		prefix := netip.MustParsePrefix(subnet(id, i))
		if prefix.Bits() != 29 || !netip.MustParsePrefix("100.64.0.0/10").Contains(prefix.Addr()) {
			t.Fatalf("subnet outside lab range: %s", prefix)
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
