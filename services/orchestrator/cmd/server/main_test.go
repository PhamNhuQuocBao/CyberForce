package main

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	labdocker "github.com/cyberforce/orchestrator/pkg/docker"
)

type fakeSpawner struct {
	spawned, stopped              bool
	vpnConnected, vpnDisconnected bool
	flag                          string
}

func (f *fakeSpawner) Spawn(_ context.Context, id, _, flag string) (labdocker.Instance, error) {
	f.spawned = true
	f.flag = flag
	return labdocker.Instance{ID: id, ContainerID: "container", TargetIP: "100.64.0.2"}, nil
}
func (f *fakeSpawner) Stop(_ context.Context, _ string) error { f.stopped = true; return nil }
func (f *fakeSpawner) ConnectVpn(_ context.Context, _ string) error {
	f.vpnConnected = true
	return nil
}
func (f *fakeSpawner) DisconnectVpn(_ context.Context, _ string) error {
	f.vpnDisconnected = true
	return nil
}

func TestPrivateAPI(t *testing.T) {
	fake := &fakeSpawner{}
	h := handler(fake, strings.Repeat("s", 32))
	unauthorized := httptest.NewRecorder()
	h.ServeHTTP(unauthorized, httptest.NewRequest(http.MethodPost, "/v1/instances", strings.NewReader(`{}`)))
	if unauthorized.Code != http.StatusUnauthorized || fake.spawned {
		t.Fatal("spawn accepted without token")
	}

	id := "11111111-1111-4111-8111-111111111111"
	flag := "flag{0123456789abcdef01234567}"
	req := httptest.NewRequest(http.MethodPost, "/v1/instances", strings.NewReader(`{"instanceId":"`+id+`","image":"cyberforce/test:v1","dynamicFlag":"`+flag+`"}`))
	req.Header.Set("Authorization", "Bearer "+strings.Repeat("s", 32))
	created := httptest.NewRecorder()
	h.ServeHTTP(created, req)
	if created.Code != http.StatusCreated || !fake.spawned || fake.flag != flag || strings.Contains(created.Body.String(), flag) {
		t.Fatalf("spawn failed: %d", created.Code)
	}
	connect := httptest.NewRequest(http.MethodPost, "/v1/instances/"+id+"/vpn-network", nil)
	connect.Header.Set("Authorization", "Bearer "+strings.Repeat("s", 32))
	connected := httptest.NewRecorder()
	h.ServeHTTP(connected, connect)
	if connected.Code != http.StatusNoContent || !fake.vpnConnected {
		t.Fatal("VPN network connect failed")
	}
	disconnect := httptest.NewRequest(http.MethodDelete, "/v1/instances/"+id+"/vpn-network", nil)
	disconnect.Header.Set("Authorization", "Bearer "+strings.Repeat("s", 32))
	disconnected := httptest.NewRecorder()
	h.ServeHTTP(disconnected, disconnect)
	if disconnected.Code != http.StatusNoContent || !fake.vpnDisconnected {
		t.Fatal("VPN network disconnect failed")
	}

	stop := httptest.NewRequest(http.MethodDelete, "/v1/instances/"+id, nil)
	stop.Header.Set("Authorization", "Bearer "+strings.Repeat("s", 32))
	stopped := httptest.NewRecorder()
	h.ServeHTTP(stopped, stop)
	if stopped.Code != http.StatusNoContent || !fake.stopped {
		t.Fatalf("stop failed: %d", stopped.Code)
	}
}
