package main

import (
	"encoding/base64"
	"encoding/json"
	"os"
	"path/filepath"
	"reflect"
	"testing"
	"time"
)

func testKey(value byte) string {
	data := make([]byte, 32)
	for i := range data {
		data[i] = value
	}
	return base64.StdEncoding.EncodeToString(data)
}

func TestAccessGrantOnlyForOwnedPeerAndExactTarget(t *testing.T) {
	id := "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
	userID := "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"
	ownerPeer := peer{testKey(1), "100.127.240.2"}
	var commands [][]string
	c := &controller{
		peers: map[string]peer{userID: ownerPeer}, access: map[string]accessGrant{},
		statePath: filepath.Join(t.TempDir(), "peers.json"),
		run: func(args ...string) error {
			commands = append(commands, append([]string(nil), args...))
			return nil
		},
	}
	grant := accessGrant{UserID: userID, PeerIP: ownerPeer.Address, TargetIP: "100.64.0.2", ExpiresAt: time.Now().Add(time.Hour)}
	if err := c.putAccess(id, grant); err != nil {
		t.Fatal(err)
	}
	if len(commands) < 5 || !reflect.DeepEqual(commands[2], []string{"iptables", "-A", "CF_VPN_FORWARD", "-i", "wg0", "-s", ownerPeer.Address, "-d", grant.TargetIP, "-j", "ACCEPT"}) {
		t.Fatalf("missing exact peer-target allow rule: %v", commands)
	}
	bad := grant
	bad.TargetIP = "8.8.8.8"
	if err := c.putAccess(id, bad); err == nil {
		t.Fatal("accepted Internet target")
	}
	bad = grant
	bad.PeerIP = "100.127.240.3"
	if err := c.putAccess(id, bad); err == nil {
		t.Fatal("accepted another peer address")
	}
	bad = grant
	bad.ExpiresAt = time.Now().Add(-time.Second)
	if err := c.putAccess(id, bad); err == nil {
		t.Fatal("accepted expired grant")
	}
	if err := c.deleteAccess(id); err != nil {
		t.Fatal(err)
	}
	if len(c.access) != 0 {
		t.Fatal("access not revoked")
	}
}

func TestPeerValidation(t *testing.T) {
	for _, value := range []peer{
		{testKey(1), "100.127.240.0"},
		{testKey(1), "100.127.240.1"},
		{testKey(1), "100.127.255.255"},
		{testKey(1), "100.127.239.2"},
		{"bad", "100.127.240.2"},
	} {
		if validPeer(value) {
			t.Fatalf("accepted invalid peer: %+v", value)
		}
	}
	if !validPeer(peer{testKey(1), "100.127.240.2"}) {
		t.Fatal("rejected valid peer")
	}
}

func TestReplacePeerPersistsAndRevokesOldKey(t *testing.T) {
	var commands [][]string
	c := &controller{
		peers: map[string]peer{}, statePath: filepath.Join(t.TempDir(), "peers.json"),
		run: func(args ...string) error {
			commands = append(commands, append([]string(nil), args...))
			return nil
		},
	}
	id := "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
	first := peer{testKey(1), "100.127.240.2"}
	second := peer{testKey(2), first.Address}
	if err := c.put(id, first); err != nil {
		t.Fatal(err)
	}
	if err := c.put(id, second); err != nil {
		t.Fatal(err)
	}
	if !reflect.DeepEqual(commands[1], []string{"wg", "set", "wg0", "peer", second.PublicKey, "allowed-ips", second.Address + "/32"}) ||
		!reflect.DeepEqual(commands[2], []string{"wg", "set", "wg0", "peer", first.PublicKey, "remove"}) {
		t.Fatalf("rotation did not revoke old key: %v", commands)
	}
	data, err := os.ReadFile(c.statePath)
	if err != nil {
		t.Fatal(err)
	}
	var saved map[string]peer
	if err := json.Unmarshal(data, &saved); err != nil || saved[id] != second {
		t.Fatalf("wrong persisted peer: %s %v", data, err)
	}
}
