package docker

import (
	"archive/tar"
	"context"
	"errors"
	"io"
	"strings"

	"github.com/moby/moby/client"
)

type KothSnapshot struct {
	King    string `json:"king"`
	Healthy bool   `json:"healthy"`
}

func (s *Spawner) KothSnapshot(ctx context.Context, id string) (KothSnapshot, error) {
	if !instanceIDPattern.MatchString(id) {
		return KothSnapshot{}, errors.New("invalid instance ID")
	}
	instance, err := s.inspect(ctx, id)
	if err != nil {
		return KothSnapshot{}, err
	}
	ports, err := s.readTcpListeners(ctx, instance.ContainerID)
	if err != nil {
		return KothSnapshot{}, err
	}
	result := KothSnapshot{Healthy: hasRequiredPorts(ports)}
	archive, err := s.cli.CopyFromContainer(ctx, instance.ContainerID, client.CopyFromContainerOptions{SourcePath: "/root/king.txt"})
	if err != nil {
		return result, nil
	}
	defer archive.Content.Close()
	reader := tar.NewReader(archive.Content)
	if _, err = reader.Next(); err != nil {
		return result, nil
	}
	content, err := io.ReadAll(io.LimitReader(reader, 52))
	if err != nil {
		return result, nil
	}
	king := strings.TrimSuffix(strings.TrimSuffix(string(content), "\n"), "\r")
	if len(king) <= 50 && !strings.ContainsAny(king, "\n\r\x00") {
		result.King = king
	}
	return result, nil
}

func (s *Spawner) readTcpListeners(ctx context.Context, containerID string) (string, error) {
	created, err := s.cli.ExecCreate(ctx, containerID, client.ExecCreateOptions{
		TTY: true, AttachStdout: true, AttachStderr: true,
		Cmd: []string{"cat", "/proc/net/tcp", "/proc/net/tcp6"},
	})
	if err != nil {
		return "", err
	}
	attached, err := s.cli.ExecAttach(ctx, created.ID, client.ExecAttachOptions{TTY: true})
	if err != nil {
		return "", err
	}
	defer attached.Conn.Close()
	data, err := io.ReadAll(io.LimitReader(attached.Reader, 128*1024))
	return string(data), err
}

func hasRequiredPorts(table string) bool {
	var ssh, web bool
	for _, line := range strings.Split(table, "\n") {
		fields := strings.Fields(line)
		if len(fields) < 4 || fields[3] != "0A" {
			continue
		}
		parts := strings.Split(fields[1], ":")
		if len(parts) != 2 {
			continue
		}
		if parts[1] == "0016" {
			ssh = true
		}
		if parts[1] == "0050" {
			web = true
		}
	}
	return ssh && web
}
