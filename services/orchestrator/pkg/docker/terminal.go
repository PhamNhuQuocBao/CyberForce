package docker

import (
	"bufio"
	"context"
	"errors"
	"fmt"
	"net"

	"github.com/containerd/errdefs"
	"github.com/moby/moby/api/types/container"
	"github.com/moby/moby/api/types/network"
	"github.com/moby/moby/client"
)

const terminalImage = "alpine:3.21"

func terminalConfig(id, networkName string) (*container.Config, *container.HostConfig, *network.NetworkingConfig) {
	pids := int64(128)
	return &container.Config{
			Image: terminalImage, User: "65534:65534", WorkingDir: "/tmp",
			Cmd: []string{"sleep", "infinity"}, Labels: map[string]string{labelOwner: id},
		}, &container.HostConfig{
			NetworkMode: container.NetworkMode(networkName), ReadonlyRootfs: true,
			Tmpfs:   map[string]string{"/tmp": "rw,nosuid,nodev,noexec,size=536870912,uid=65534,gid=65534,mode=0700"},
			CapDrop: []string{"ALL"}, SecurityOpt: []string{"no-new-privileges:true"},
			Resources: container.Resources{Memory: 512 * 1024 * 1024, MemorySwap: 512 * 1024 * 1024, NanoCPUs: 500_000_000, PidsLimit: &pids},
		}, &network.NetworkingConfig{EndpointsConfig: map[string]*network.EndpointSettings{networkName: {}}}
}

func (s *Spawner) ensureTerminal(ctx context.Context, id string) error {
	_, networkName := names(id)
	name := terminalName(id)
	result, err := s.cli.ContainerInspect(ctx, name, client.ContainerInspectOptions{})
	if err == nil {
		info := result.Container
		if info.Config == nil || info.Config.Labels[labelOwner] != id {
			return errors.New("terminal owner mismatch")
		}
		if info.State != nil && info.State.Running {
			return nil
		}
		if _, err := s.cli.ContainerRemove(ctx, info.ID, client.ContainerRemoveOptions{Force: true}); err != nil {
			return err
		}
	} else if !errdefs.IsNotFound(err) {
		return err
	}
	config, host, networking := terminalConfig(id, networkName)
	created, err := s.cli.ContainerCreate(ctx, client.ContainerCreateOptions{Config: config, HostConfig: host, NetworkingConfig: networking, Name: name})
	if err != nil {
		return fmt.Errorf("create terminal: %w", err)
	}
	if _, err := s.cli.ContainerStart(ctx, created.ID, client.ContainerStartOptions{}); err != nil {
		_, _ = s.cli.ContainerRemove(context.Background(), created.ID, client.ContainerRemoveOptions{Force: true})
		return fmt.Errorf("start terminal: %w", err)
	}
	return nil
}

type TerminalSession struct {
	Conn    net.Conn
	Reader  *bufio.Reader
	ExecID  string
	spawner *Spawner
}

func (s *Spawner) OpenTerminal(ctx context.Context, id string) (*TerminalSession, error) {
	if !instanceIDPattern.MatchString(id) {
		return nil, errors.New("invalid instance ID")
	}
	if _, err := s.inspect(ctx, id); err != nil {
		return nil, err
	}
	result, err := s.cli.ContainerInspect(ctx, terminalName(id), client.ContainerInspectOptions{})
	if err != nil {
		return nil, err
	}
	info := result.Container
	if info.Config == nil || info.Config.Labels[labelOwner] != id || info.State == nil || !info.State.Running {
		return nil, errors.New("terminal unavailable")
	}
	exec, err := s.cli.ExecCreate(ctx, info.ID, client.ExecCreateOptions{
		TTY: true, AttachStdin: true, AttachStdout: true, AttachStderr: true,
		User: "65534:65534", WorkingDir: "/tmp", Cmd: []string{"/bin/sh"},
		Env: []string{"TERM=xterm-256color", "HOME=/tmp"},
	})
	if err != nil {
		return nil, err
	}
	attached, err := s.cli.ExecAttach(ctx, exec.ID, client.ExecAttachOptions{TTY: true, ConsoleSize: client.ConsoleSize{Height: 24, Width: 80}})
	if err != nil {
		return nil, err
	}
	return &TerminalSession{Conn: attached.Conn, Reader: attached.Reader, ExecID: exec.ID, spawner: s}, nil
}

func (session *TerminalSession) Resize(ctx context.Context, rows, cols uint) error {
	if rows < 2 || rows > 200 || cols < 20 || cols > 500 {
		return errors.New("invalid terminal size")
	}
	_, err := session.spawner.cli.ExecResize(ctx, session.ExecID, client.ExecResizeOptions{Height: rows, Width: cols})
	return err
}
