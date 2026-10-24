package docker

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/containerd/errdefs"
	"github.com/moby/moby/client"
)

func (s *Spawner) vpnGateway(ctx context.Context) (string, error) {
	result, err := s.cli.ContainerInspect(ctx, s.vpnGatewayName, client.ContainerInspectOptions{})
	if err != nil {
		return "", err
	}
	info := result.Container
	if info.Config == nil || info.Config.Labels["com.docker.compose.service"] != "vpn-gateway" ||
		info.State == nil || !info.State.Running {
		return "", errors.New("VPN gateway unavailable")
	}
	return info.ID, nil
}

func (s *Spawner) ConnectVpn(ctx context.Context, id string) error {
	if !instanceIDPattern.MatchString(id) {
		return errors.New("invalid instance ID")
	}
	if _, err := s.inspect(ctx, id); err != nil {
		return err
	}
	_, networkName := names(id)
	netResult, err := s.cli.NetworkInspect(ctx, networkName, client.NetworkInspectOptions{})
	if err != nil {
		return err
	}
	if netResult.Network.Labels[labelOwner] != id || !netResult.Network.Internal {
		return errors.New("VPN lab network owner or isolation mismatch")
	}
	gatewayID, err := s.vpnGateway(ctx)
	if err != nil {
		return err
	}
	if _, connected := netResult.Network.Containers[gatewayID]; connected {
		return nil
	}
	_, err = s.cli.NetworkConnect(ctx, netResult.Network.ID, client.NetworkConnectOptions{Container: gatewayID})
	return err
}

func (s *Spawner) revokeVpn(ctx context.Context, id string) error {
	if s.vpnGatewayURL == "" || len(s.vpnGatewayToken) < 32 {
		return errors.New("VPN gateway control unavailable")
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, strings.TrimRight(s.vpnGatewayURL, "/")+"/v1/access/"+id, nil)
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+s.vpnGatewayToken)
	httpClient := &http.Client{Timeout: 5 * time.Second}
	response, err := httpClient.Do(req)
	if err != nil {
		return err
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusNoContent {
		return fmt.Errorf("VPN revoke returned %d", response.StatusCode)
	}
	return nil
}

func (s *Spawner) DisconnectVpn(ctx context.Context, id string) error {
	if !instanceIDPattern.MatchString(id) {
		return errors.New("invalid instance ID")
	}
	_, networkName := names(id)
	netResult, err := s.cli.NetworkInspect(ctx, networkName, client.NetworkInspectOptions{})
	if errdefs.IsNotFound(err) {
		return nil
	}
	if err != nil {
		return err
	}
	if netResult.Network.Labels[labelOwner] != id {
		return errors.New("lab network owner mismatch")
	}
	gatewayID, err := s.vpnGateway(ctx)
	if errdefs.IsNotFound(err) {
		return nil
	}
	if err != nil {
		return err
	}
	if _, connected := netResult.Network.Containers[gatewayID]; !connected {
		return nil
	}
	if err := s.revokeVpn(ctx, id); err != nil {
		return err
	}
	_, err = s.cli.NetworkDisconnect(ctx, netResult.Network.ID, client.NetworkDisconnectOptions{Container: gatewayID, Force: true})
	if errdefs.IsNotFound(err) {
		return nil
	}
	return err
}
