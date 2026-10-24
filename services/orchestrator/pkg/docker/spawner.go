package docker

import (
	"archive/tar"
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/binary"
	"errors"
	"fmt"
	"net/netip"
	"os"
	"regexp"
	"strings"

	"github.com/containerd/errdefs"
	"github.com/moby/moby/api/types/container"
	"github.com/moby/moby/api/types/network"
	"github.com/moby/moby/client"
)

const (
	labelOwner = "cyberforce.lab.instance"
	maxSubnets = (1 << 19) - 512 // Reserve 100.127.240.0/20 for VPN peers.
)

var instanceIDPattern = regexp.MustCompile(`^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`)
var imagePattern = regexp.MustCompile(`^cyberforce/[a-z0-9][a-z0-9._/-]*:[a-zA-Z0-9][a-zA-Z0-9._-]*$`)
var dynamicFlagPattern = regexp.MustCompile(`^flag\{[0-9a-f]{24}\}$`)

type Instance struct {
	ID          string `json:"instanceId"`
	ContainerID string `json:"containerId"`
	TargetIP    string `json:"targetIp"`
}

type Spawner struct {
	cli             *client.Client
	guacdName       string
	vpnGatewayName  string
	vpnGatewayURL   string
	vpnGatewayToken string
}

func NewSpawner() (*Spawner, error) {
	cli, err := client.NewClientWithOpts(client.WithHost("unix:///var/run/docker.sock"), client.WithAPIVersionNegotiation())
	if err != nil {
		return nil, err
	}
	guacdName := os.Getenv("GUACD_CONTAINER_NAME")
	if guacdName == "" {
		guacdName = "cyberforce-guacd"
	}
	vpnGatewayName := os.Getenv("VPN_GATEWAY_CONTAINER_NAME")
	if vpnGatewayName == "" {
		vpnGatewayName = "cyberforce-vpn-gateway"
	}
	return &Spawner{cli: cli, guacdName: guacdName, vpnGatewayName: vpnGatewayName,
		vpnGatewayURL: os.Getenv("VPN_GATEWAY_URL"), vpnGatewayToken: os.Getenv("VPN_GATEWAY_TOKEN")}, nil
}

func (s *Spawner) Close() error { return s.cli.Close() }

func names(id string) (string, string) {
	return "cf-lab-" + id, "cf-lab-net-" + id
}

func terminalName(id string) string { return "cf-terminal-" + id }

func subnet(id string, attempt uint32) string {
	sum := sha256.Sum256([]byte(id))
	n := (binary.BigEndian.Uint32(sum[:4]) + attempt) % maxSubnets
	return fmt.Sprintf("100.%d.%d.%d/29", 64+(n>>13), (n>>5)&255, (n&31)*8)
}

func config(image, id, networkName string) (*container.Config, *container.HostConfig, *network.NetworkingConfig) {
	pids := int64(512)
	labels := map[string]string{labelOwner: id}
	return &container.Config{Image: image, Labels: labels},
		&container.HostConfig{
			NetworkMode: container.NetworkMode(networkName),
			CapDrop:     []string{"ALL"},
			SecurityOpt: []string{"no-new-privileges:true"},
			Resources:   container.Resources{Memory: 2 * 1024 * 1024 * 1024, MemorySwap: 2 * 1024 * 1024 * 1024, NanoCPUs: 2_000_000_000, PidsLimit: &pids},
		},
		&network.NetworkingConfig{EndpointsConfig: map[string]*network.EndpointSettings{networkName: {}}}
}

func (s *Spawner) inspect(ctx context.Context, id string) (Instance, error) {
	containerName, networkName := names(id)
	result, err := s.cli.ContainerInspect(ctx, containerName, client.ContainerInspectOptions{})
	if err != nil {
		return Instance{}, err
	}
	info := result.Container
	if info.Config == nil || info.Config.Labels[labelOwner] != id {
		return Instance{}, errors.New("container owner mismatch")
	}
	if info.State == nil || !info.State.Running {
		return Instance{}, errors.New("lab container is not running")
	}
	if info.NetworkSettings == nil {
		return Instance{}, errors.New("lab network unavailable")
	}
	endpoint := info.NetworkSettings.Networks[networkName]
	if endpoint == nil || !endpoint.IPAddress.IsValid() {
		return Instance{}, errors.New("lab IP unavailable")
	}
	return Instance{ID: id, ContainerID: info.ID, TargetIP: endpoint.IPAddress.String()}, nil
}

func (s *Spawner) Spawn(ctx context.Context, id, image, dynamicFlag string) (Instance, error) {
	if !instanceIDPattern.MatchString(id) || !imagePattern.MatchString(image) || (dynamicFlag != "" && !dynamicFlagPattern.MatchString(dynamicFlag)) {
		return Instance{}, errors.New("invalid instance ID, image or dynamic flag")
	}
	containerName, networkName := names(id)
	if existing, err := s.inspect(ctx, id); err == nil {
		if err := s.ensureTerminal(ctx, id); err != nil {
			return Instance{}, err
		}
		return existing, nil
	} else if !errdefs.IsNotFound(err) {
		return Instance{}, err
	}

	var networkID string
	for attempt := uint32(0); attempt < 32; attempt++ {
		prefix := netip.MustParsePrefix(subnet(id, attempt))
		created, err := s.cli.NetworkCreate(ctx, networkName, client.NetworkCreateOptions{
			Driver: "bridge", Internal: true,
			Labels: map[string]string{labelOwner: id},
			IPAM:   &network.IPAM{Config: []network.IPAMConfig{{Subnet: prefix}}},
		})
		if err == nil {
			networkID = created.ID
			break
		}
		prior, inspectErr := s.cli.NetworkInspect(ctx, networkName, client.NetworkInspectOptions{})
		if inspectErr == nil {
			if prior.Network.Labels[labelOwner] != id || len(prior.Network.Containers) != 0 {
				return Instance{}, errors.New("lab network is already in use")
			}
			if _, removeErr := s.cli.NetworkRemove(ctx, prior.Network.ID, client.NetworkRemoveOptions{}); removeErr != nil {
				return Instance{}, fmt.Errorf("remove incomplete lab network: %w", removeErr)
			}
			continue
		}
		if !errdefs.IsConflict(err) && !strings.Contains(strings.ToLower(err.Error()), "pool overlaps") {
			return Instance{}, fmt.Errorf("create isolated network: %w", err)
		}
	}
	if networkID == "" {
		return Instance{}, errors.New("no isolated lab subnet available")
	}
	cleanupNetwork := true
	defer func() {
		if cleanupNetwork {
			_, _ = s.cli.NetworkRemove(context.Background(), networkID, client.NetworkRemoveOptions{})
		}
	}()

	containerConfig, hostConfig, networkingConfig := config(image, id, networkName)
	created, err := s.cli.ContainerCreate(ctx, client.ContainerCreateOptions{Config: containerConfig, HostConfig: hostConfig, NetworkingConfig: networkingConfig, Name: containerName})
	if err != nil {
		return Instance{}, fmt.Errorf("create lab container: %w", err)
	}
	cleanupContainer := true
	defer func() {
		if cleanupContainer {
			_, _ = s.cli.ContainerRemove(context.Background(), created.ID, client.ContainerRemoveOptions{Force: true})
		}
	}()
	if dynamicFlag != "" {
		archive, err := flagArchive(dynamicFlag)
		if err != nil {
			return Instance{}, err
		}
		if _, err := s.cli.CopyToContainer(ctx, created.ID, client.CopyToContainerOptions{
			DestinationPath: "/root", Content: archive,
		}); err != nil {
			return Instance{}, fmt.Errorf("inject dynamic flag: %w", err)
		}
	}
	if _, err := s.cli.ContainerStart(ctx, created.ID, client.ContainerStartOptions{}); err != nil {
		return Instance{}, fmt.Errorf("start lab container: %w", err)
	}
	instance, err := s.inspect(ctx, id)
	if err != nil {
		return Instance{}, err
	}
	if err := s.ensureTerminal(ctx, id); err != nil {
		return Instance{}, err
	}
	cleanupContainer, cleanupNetwork = false, false
	return instance, nil
}

func flagArchive(flag string) (*bytes.Reader, error) {
	var buffer bytes.Buffer
	writer := tar.NewWriter(&buffer)
	data := []byte(flag + "\n")
	if err := writer.WriteHeader(&tar.Header{Name: "flag.txt", Mode: 0400, Size: int64(len(data)), Uid: 0, Gid: 0}); err != nil {
		return nil, err
	}
	if _, err := writer.Write(data); err != nil {
		return nil, err
	}
	if err := writer.Close(); err != nil {
		return nil, err
	}
	return bytes.NewReader(buffer.Bytes()), nil
}

func (s *Spawner) Stop(ctx context.Context, id string) error {
	if !instanceIDPattern.MatchString(id) {
		return errors.New("invalid instance ID")
	}
	if err := s.DisconnectVpn(ctx, id); err != nil {
		return err
	}
	if err := s.StopAttackBox(ctx, id); err != nil {
		return err
	}
	containerName, networkName := names(id)
	terminal, terminalErr := s.cli.ContainerInspect(ctx, terminalName(id), client.ContainerInspectOptions{})
	if terminalErr != nil && !errdefs.IsNotFound(terminalErr) {
		return terminalErr
	}
	if terminalErr == nil {
		if terminal.Container.Config == nil || terminal.Container.Config.Labels[labelOwner] != id {
			return errors.New("terminal owner mismatch")
		}
		if _, err := s.cli.ContainerRemove(ctx, terminal.Container.ID, client.ContainerRemoveOptions{Force: true}); err != nil && !errdefs.IsNotFound(err) {
			return err
		}
	}
	result, err := s.cli.ContainerInspect(ctx, containerName, client.ContainerInspectOptions{})
	if err != nil && !errdefs.IsNotFound(err) {
		return err
	}
	if err == nil {
		info := result.Container
		if info.Config == nil || info.Config.Labels[labelOwner] != id {
			return errors.New("container owner mismatch")
		}
		if _, err := s.cli.ContainerRemove(ctx, info.ID, client.ContainerRemoveOptions{Force: true}); err != nil && !errdefs.IsNotFound(err) {
			return err
		}
	}
	netResult, err := s.cli.NetworkInspect(ctx, networkName, client.NetworkInspectOptions{})
	if err != nil && !errdefs.IsNotFound(err) {
		return err
	}
	if err == nil {
		netInfo := netResult.Network
		if netInfo.Labels[labelOwner] != id {
			return errors.New("network owner mismatch")
		}
		if _, err := s.cli.NetworkRemove(ctx, netInfo.ID, client.NetworkRemoveOptions{}); err != nil && !errdefs.IsNotFound(err) {
			return err
		}
	}
	return nil
}
