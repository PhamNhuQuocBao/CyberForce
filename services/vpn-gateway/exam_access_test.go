package main

import (
	"testing"
	"time"
)

func TestExamGrantAllowsOnlyAssignedTargets(t *testing.T) {
	id := "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa"
	user := "bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb"
	peerIP := "100.127.240.2"
	peers := map[string]peer{user: {Address: peerIP}}
	grant := accessGrant{UserID: user, PeerIP: peerIP, TargetIPs: []string{"100.64.0.2", "100.64.0.3"}, ExpiresAt: time.Now().Add(24 * time.Hour)}
	if !validGrant(id, grant, peers) {
		t.Fatal("valid multi-target exam grant rejected")
	}
	grant.TargetIPs = []string{"100.64.0.2", "100.64.0.2"}
	if validGrant(id, grant, peers) {
		t.Fatal("duplicate target accepted")
	}
	grant.TargetIPs = []string{"100.127.240.3"}
	if validGrant(id, grant, peers) {
		t.Fatal("VPN peer address accepted as target")
	}
	grant.TargetIPs = []string{"100.64.0.2", "100.64.0.3"}
	grant.PeerIP = "100.127.240.4"
	if validGrant(id, grant, peers) {
		t.Fatal("other peer accepted")
	}
}
