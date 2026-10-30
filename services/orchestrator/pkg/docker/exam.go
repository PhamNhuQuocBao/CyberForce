package docker

import (
	"context"
	"errors"
	"fmt"
	"net/netip"
	"strings"

	"github.com/containerd/errdefs"
	"github.com/moby/moby/api/types/network"
	"github.com/moby/moby/client"
)

const examOwner = "cyberforce.exam.session"

type ExamTarget struct {
	Name  string `json:"name"`
	Image string `json:"image"`
}
type ExamMachine struct {
	Name        string `json:"name"`
	ContainerID string `json:"containerId"`
	TargetIP    string `json:"targetIp"`
}
type ExamRange struct {
	SessionID string        `json:"sessionId"`
	Targets   []ExamMachine `json:"targets"`
}

func examNames(id string) string                { return "cf-exam-net-" + id }
func examContainer(id string, index int) string { return fmt.Sprintf("cf-exam-%s-%d", id, index) }

func (s *Spawner) SpawnExam(ctx context.Context, id string, targets []ExamTarget) (ExamRange, error) {
	if !instanceIDPattern.MatchString(id) || len(targets) < 2 || len(targets) > 4 {
		return ExamRange{}, errors.New("invalid exam session or target count")
	}
	seen := map[string]bool{}
	for _, target := range targets {
		if !imagePattern.MatchString(target.Image) || len(target.Name) == 0 || len(target.Name) > 80 || seen[target.Name] {
			return ExamRange{}, errors.New("invalid exam target")
		}
		seen[target.Name] = true
	}
	if existing, err := s.InspectExam(ctx, id); err == nil {
		matched := len(existing.Targets) == len(targets)
		if matched {
			for i, target := range targets {
				if existing.Targets[i].Name != target.Name {
					matched = false
					break
				}
			}
		}
		if matched {
			return existing, nil
		}
		return ExamRange{}, errors.New("exam target count mismatch")
	} else if !errdefs.IsNotFound(err) {
		return ExamRange{}, err
	}
	networkName := examNames(id)
	var networkID string
	for attempt := uint32(0); attempt < 32; attempt++ {
		prefix := netip.MustParsePrefix(subnet(id, attempt))
		result, err := s.cli.NetworkCreate(ctx, networkName, client.NetworkCreateOptions{Driver: "bridge", Internal: true, Labels: map[string]string{examOwner: id}, IPAM: &network.IPAM{Config: []network.IPAMConfig{{Subnet: prefix}}}})
		if err == nil {
			networkID = result.ID
			break
		}
		if !errdefs.IsConflict(err) && !strings.Contains(strings.ToLower(err.Error()), "pool overlaps") {
			return ExamRange{}, err
		}
	}
	if networkID == "" {
		return ExamRange{}, errors.New("no exam subnet available")
	}
	success := false
	defer func() {
		if !success {
			_ = s.StopExam(context.Background(), id)
		}
	}()
	for i, target := range targets {
		config, host, networking := config(target.Image, id, networkName)
		config.Labels = map[string]string{examOwner: id, "cyberforce.exam.target": target.Name}
		created, err := s.cli.ContainerCreate(ctx, client.ContainerCreateOptions{Config: config, HostConfig: host, NetworkingConfig: networking, Name: examContainer(id, i)})
		if err != nil {
			return ExamRange{}, err
		}
		if _, err = s.cli.ContainerStart(ctx, created.ID, client.ContainerStartOptions{}); err != nil {
			return ExamRange{}, err
		}
	}
	result, err := s.InspectExam(ctx, id)
	if err != nil {
		return ExamRange{}, err
	}
	for i := range result.Targets {
		result.Targets[i].Name = targets[i].Name
	}
	success = true
	return result, nil
}

func (s *Spawner) InspectExam(ctx context.Context, id string) (ExamRange, error) {
	if !instanceIDPattern.MatchString(id) {
		return ExamRange{}, errors.New("invalid exam session")
	}
	networkName := examNames(id)
	netResult, err := s.cli.NetworkInspect(ctx, networkName, client.NetworkInspectOptions{})
	if err != nil {
		return ExamRange{}, err
	}
	if netResult.Network.Labels[examOwner] != id || !netResult.Network.Internal {
		return ExamRange{}, errors.New("exam network owner mismatch")
	}
	result := ExamRange{SessionID: id, Targets: []ExamMachine{}}
	for i := 0; i < 4; i++ {
		inspected, err := s.cli.ContainerInspect(ctx, examContainer(id, i), client.ContainerInspectOptions{})
		if errdefs.IsNotFound(err) {
			break
		}
		if err != nil {
			return ExamRange{}, err
		}
		info := inspected.Container
		if info.Config == nil || info.Config.Labels[examOwner] != id || info.State == nil || !info.State.Running || info.NetworkSettings == nil {
			return ExamRange{}, errors.New("exam target unavailable")
		}
		endpoint := info.NetworkSettings.Networks[networkName]
		if endpoint == nil || !endpoint.IPAddress.IsValid() {
			return ExamRange{}, errors.New("exam target IP unavailable")
		}
		result.Targets = append(result.Targets, ExamMachine{Name: info.Config.Labels["cyberforce.exam.target"], ContainerID: info.ID, TargetIP: endpoint.IPAddress.String()})
	}
	if len(result.Targets) == 0 {
		return ExamRange{}, errors.New("exam targets unavailable")
	}
	return result, nil
}

func (s *Spawner) StopExam(ctx context.Context, id string) error {
	if !instanceIDPattern.MatchString(id) {
		return errors.New("invalid exam session")
	}
	networkName := examNames(id)
	if err := s.DisconnectExamVpn(ctx, id); err != nil {
		return err
	}
	netResult, err := s.cli.NetworkInspect(ctx, networkName, client.NetworkInspectOptions{})
	if errdefs.IsNotFound(err) {
		return nil
	}
	if err != nil {
		return err
	}
	if netResult.Network.Labels[examOwner] != id {
		return errors.New("exam network owner mismatch")
	}
	for i := 0; i < 4; i++ {
		inspected, err := s.cli.ContainerInspect(ctx, examContainer(id, i), client.ContainerInspectOptions{})
		if errdefs.IsNotFound(err) {
			continue
		}
		if err != nil {
			return err
		}
		if inspected.Container.Config == nil || inspected.Container.Config.Labels[examOwner] != id {
			return errors.New("exam container owner mismatch")
		}
		if _, err = s.cli.ContainerRemove(ctx, inspected.Container.ID, client.ContainerRemoveOptions{Force: true}); err != nil && !errdefs.IsNotFound(err) {
			return err
		}
	}
	_, err = s.cli.NetworkRemove(ctx, netResult.Network.ID, client.NetworkRemoveOptions{})
	if errdefs.IsNotFound(err) {
		return nil
	}
	return err
}

func (s *Spawner) ConnectExamVpn(ctx context.Context, id string) error {
	if _, err := s.InspectExam(ctx, id); err != nil {
		return err
	}
	result, err := s.cli.NetworkInspect(ctx, examNames(id), client.NetworkInspectOptions{})
	if err != nil {
		return err
	}
	gatewayID, err := s.vpnGateway(ctx)
	if err != nil {
		return err
	}
	if _, connected := result.Network.Containers[gatewayID]; connected {
		return nil
	}
	_, err = s.cli.NetworkConnect(ctx, result.Network.ID, client.NetworkConnectOptions{Container: gatewayID})
	return err
}

func (s *Spawner) DisconnectExamVpn(ctx context.Context, id string) error {
	if !instanceIDPattern.MatchString(id) {
		return errors.New("invalid exam session")
	}
	result, err := s.cli.NetworkInspect(ctx, examNames(id), client.NetworkInspectOptions{})
	if errdefs.IsNotFound(err) {
		return nil
	}
	if err != nil {
		return err
	}
	if result.Network.Labels[examOwner] != id {
		return errors.New("exam network owner mismatch")
	}
	gatewayID, err := s.vpnGateway(ctx)
	if errdefs.IsNotFound(err) {
		return nil
	}
	if err != nil {
		return err
	}
	if _, connected := result.Network.Containers[gatewayID]; !connected {
		return nil
	}
	if err := s.revokeVpn(ctx, id); err != nil {
		return err
	}
	_, err = s.cli.NetworkDisconnect(ctx, result.Network.ID, client.NetworkDisconnectOptions{Container: gatewayID, Force: true})
	return err
}
