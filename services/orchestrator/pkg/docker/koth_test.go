package docker

import (
	"context"
	"fmt"
	"os"
	"testing"
	"time"
)

func TestHasRequiredPorts(t *testing.T) {
	good := " sl  local_address rem_address st\n 0: 00000000:0016 00000000:0000 0A\n 1: 00000000:0050 00000000:0000 0A\n"
	if !hasRequiredPorts(good) {
		t.Fatal("expected SSH and HTTP to be listening")
	}
	if hasRequiredPorts("0: 00000000:0016 00000000:0000 0A") {
		t.Fatal("missing HTTP accepted")
	}
	if hasRequiredPorts("0: 00000000:0016 00000000:0000 01\n1: 00000000:0050 00000000:0000 0A") {
		t.Fatal("non-listening SSH accepted")
	}
}

func TestKothSnapshotDockerSmoke(t *testing.T) {
	image := os.Getenv("CF_DOCKER_SMOKE_KOTH_IMAGE")
	if image == "" {
		t.Skip("set CF_DOCKER_SMOKE_KOTH_IMAGE for Docker KotH smoke")
	}
	spawner, err := NewSpawner()
	if err != nil {
		t.Fatal(err)
	}
	defer spawner.Close()
	id := fmt.Sprintf("%08x-1111-4111-8111-111111111111", uint32(time.Now().UnixNano()))
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	if _, err := spawner.Spawn(ctx, id, image, ""); err != nil {
		t.Fatal(err)
	}
	defer func() {
		if err := spawner.Stop(context.Background(), id); err != nil {
			t.Errorf("stop: %v", err)
		}
	}()
	for attempt := 0; attempt < 20; attempt++ {
		result, err := spawner.KothSnapshot(ctx, id)
		if err == nil && result.King == "Player1" && result.Healthy {
			return
		}
		time.Sleep(100 * time.Millisecond)
	}
	result, err := spawner.KothSnapshot(ctx, id)
	t.Fatalf("snapshot = %+v, err = %v", result, err)
}
