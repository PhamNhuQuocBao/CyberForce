package docker

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"strings"

	"github.com/containerd/errdefs"
	"github.com/moby/moby/api/types/container"
	"github.com/moby/moby/api/types/network"
	"github.com/moby/moby/client"
)

const attackBoxImage = "cyberforce/kali-attackbox:1.0"

type AttackBox struct {
	Running bool `json:"running"`
}

type AttackBoxConnection struct {
	IP       string
	Password string
}

func attackBoxName(id string) string { return "cf-attackbox-" + id }

func attackBoxConfig(id, networkName, password string) (*container.Config, *container.HostConfig, *network.NetworkingConfig) {
	pids := int64(512)
	return &container.Config{
		Image: attackBoxImage, Env: []string{"VNC_PASSWORD=" + password},
		Labels: map[string]string{labelOwner: id},
	}, &container.HostConfig{
		NetworkMode: container.NetworkMode(networkName), ReadonlyRootfs: true,
		Tmpfs: map[string]string{
			"/tmp":       "rw,nosuid,nodev,size=536870912,uid=1000,gid=1000,mode=1777",
			"/home/kali": "rw,nosuid,nodev,size=1073741824,uid=1000,gid=1000,mode=0700",
			"/run":       "rw,nosuid,nodev,size=67108864,uid=1000,gid=1000,mode=0755",
		},
		CapDrop: []string{"ALL"}, SecurityOpt: []string{"no-new-privileges:true"},
		Resources: container.Resources{Memory: 3 * 1024 * 1024 * 1024, MemorySwap: 3 * 1024 * 1024 * 1024, NanoCPUs: 2_000_000_000, PidsLimit: &pids},
	}, &network.NetworkingConfig{EndpointsConfig: map[string]*network.EndpointSettings{networkName: {}}}
}

func (s *Spawner) inspectAttackBox(ctx context.Context, id string) (AttackBoxConnection, error) {
	result, err := s.cli.ContainerInspect(ctx, attackBoxName(id), client.ContainerInspectOptions{})
	if err != nil {
		return AttackBoxConnection{}, err
	}
	info := result.Container
	if info.Config == nil || info.Config.Labels[labelOwner] != id {
		return AttackBoxConnection{}, errors.New("attackbox owner mismatch")
	}
	if info.State == nil || !info.State.Running {
		return AttackBoxConnection{}, errors.New("attackbox is not running")
	}
	_, netName := names(id)
	endpoint := info.NetworkSettings.Networks[netName]
	if endpoint == nil || !endpoint.IPAddress.IsValid() {
		return AttackBoxConnection{}, errors.New("attackbox IP unavailable")
	}
	password := ""
	for _, entry := range info.Config.Env {
		if strings.HasPrefix(entry, "VNC_PASSWORD=") {
			password = strings.TrimPrefix(entry, "VNC_PASSWORD=")
			break
		}
	}
	if len(password) != 8 {
		return AttackBoxConnection{}, errors.New("attackbox password unavailable")
	}
	return AttackBoxConnection{IP: endpoint.IPAddress.String(), Password: password}, nil
}

func (s *Spawner) guacd(ctx context.Context, requireRunning bool) (string, error) {
	result, err := s.cli.ContainerInspect(ctx, s.guacdName, client.ContainerInspectOptions{})
	if err != nil {
		return "", err
	}
	info := result.Container
	if info.Config == nil || info.Config.Labels["com.docker.compose.service"] != "guacd" ||
		(requireRunning && (info.State == nil || !info.State.Running)) {
		return "", errors.New("guacd unavailable")
	}
	return info.ID, nil
}

func (s *Spawner) connectGuacd(ctx context.Context, id string) error {
	guacdID, err := s.guacd(ctx, true)
	if err != nil {
		return err
	}
	_, networkName := names(id)
	netResult, err := s.cli.NetworkInspect(ctx, networkName, client.NetworkInspectOptions{})
	if err != nil {
		return err
	}
	if netResult.Network.Labels[labelOwner] != id {
		return errors.New("lab network owner mismatch")
	}
	if _, connected := netResult.Network.Containers[guacdID]; connected {
		return nil
	}
	_, err = s.cli.NetworkConnect(ctx, netResult.Network.ID, client.NetworkConnectOptions{Container: guacdID})
	return err
}

func (s *Spawner) StartAttackBox(ctx context.Context, id string) (AttackBox, error) {
	if !instanceIDPattern.MatchString(id) {
		return AttackBox{}, errors.New("invalid instance ID")
	}
	if _, err := s.inspect(ctx, id); err != nil {
		return AttackBox{}, err
	}
	if _, err := s.inspectAttackBox(ctx, id); err == nil {
		return AttackBox{Running: true}, s.connectGuacd(ctx, id)
	} else if !errdefs.IsNotFound(err) {
		return AttackBox{}, err
	}
	secret := make([]byte, 6)
	if _, err := rand.Read(secret); err != nil {
		return AttackBox{}, err
	}
	password := base64.RawURLEncoding.EncodeToString(secret)
	_, networkName := names(id)
	config, host, networking := attackBoxConfig(id, networkName, password)
	created, err := s.cli.ContainerCreate(ctx, client.ContainerCreateOptions{Config: config, HostConfig: host, NetworkingConfig: networking, Name: attackBoxName(id)})
	if err != nil {
		return AttackBox{}, fmt.Errorf("create attackbox: %w", err)
	}
	cleanup := true
	defer func() {
		if cleanup {
			_, _ = s.cli.ContainerRemove(context.Background(), created.ID, client.ContainerRemoveOptions{Force: true})
		}
	}()
	if _, err := s.cli.ContainerStart(ctx, created.ID, client.ContainerStartOptions{}); err != nil {
		return AttackBox{}, fmt.Errorf("start attackbox: %w", err)
	}
	if err := s.connectGuacd(ctx, id); err != nil {
		return AttackBox{}, fmt.Errorf("connect guacd: %w", err)
	}
	cleanup = false
	return AttackBox{Running: true}, nil
}

func (s *Spawner) AttackBoxStatus(ctx context.Context, id string) (AttackBox, error) {
	if !instanceIDPattern.MatchString(id) {
		return AttackBox{}, errors.New("invalid instance ID")
	}
	if _, err := s.inspect(ctx, id); err != nil {
		return AttackBox{}, err
	}
	_, err := s.inspectAttackBox(ctx, id)
	if errdefs.IsNotFound(err) {
		return AttackBox{Running: false}, nil
	}
	return AttackBox{Running: err == nil}, err
}

func (s *Spawner) OpenAttackBox(ctx context.Context, id string) (AttackBoxConnection, error) {
	if !instanceIDPattern.MatchString(id) {
		return AttackBoxConnection{}, errors.New("invalid instance ID")
	}
	if _, err := s.inspect(ctx, id); err != nil {
		return AttackBoxConnection{}, err
	}
	return s.inspectAttackBox(ctx, id)
}

func (s *Spawner) StopAttackBox(ctx context.Context, id string) error {
	if !instanceIDPattern.MatchString(id) {
		return errors.New("invalid instance ID")
	}
	_, networkName := names(id)
	netResult, netErr := s.cli.NetworkInspect(ctx, networkName, client.NetworkInspectOptions{})
	if netErr != nil && !errdefs.IsNotFound(netErr) {
		return netErr
	}
	if netErr == nil {
		if netResult.Network.Labels[labelOwner] != id {
			return errors.New("lab network owner mismatch")
		}
		guacdID, err := s.guacd(ctx, false)
		if err == nil {
			if _, connected := netResult.Network.Containers[guacdID]; connected {
				if _, err := s.cli.NetworkDisconnect(ctx, netResult.Network.ID, client.NetworkDisconnectOptions{Container: guacdID, Force: true}); err != nil && !errdefs.IsNotFound(err) {
					return err
				}
			}
		} else if !errdefs.IsNotFound(err) {
			return err
		}
	}
	result, err := s.cli.ContainerInspect(ctx, attackBoxName(id), client.ContainerInspectOptions{})
	if errdefs.IsNotFound(err) {
		return nil
	}
	if err != nil {
		return err
	}
	if result.Container.Config == nil || result.Container.Config.Labels[labelOwner] != id {
		return errors.New("attackbox owner mismatch")
	}
	_, err = s.cli.ContainerRemove(ctx, result.Container.ID, client.ContainerRemoveOptions{Force: true})
	return err
}
