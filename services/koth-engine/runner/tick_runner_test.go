package main

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestRunnerPassesSnapshotToTickAPI(t *testing.T) {
	var posted snapshot
	var authorized bool
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		authorized = req.Header.Get("Authorization") == "Bearer "+"12345678901234567890123456789012"
		switch req.URL.Path {
		case "/api/v1/koth/internal/due":
			_, _ = w.Write([]byte(`{"data":[{"matchId":"match","instanceId":"instance","tickNumber":1}]}`))
		case "/v1/instances/instance/koth-snapshot":
			_, _ = w.Write([]byte(`{"king":"Player1","healthy":true}`))
		case "/api/v1/koth/internal/matches/match/ticks/1":
			_ = json.NewDecoder(req.Body).Decode(&posted)
			w.WriteHeader(http.StatusOK)
		default:
			t.Errorf("unexpected path: %s", req.URL.Path)
			w.WriteHeader(http.StatusNotFound)
		}
	}))
	defer server.Close()
	r := runner{apiURL: server.URL, orchestratorURL: server.URL, token: "12345678901234567890123456789012", client: server.Client()}
	if err := r.cycle(context.Background()); err != nil {
		t.Fatal(err)
	}
	if !authorized || posted.King != "Player1" || !posted.Healthy {
		t.Fatalf("wrong tick payload: %+v", posted)
	}
}

func TestRunnerFailsClosedWhenSnapshotUnavailable(t *testing.T) {
	posted := false
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		if req.Method == http.MethodGet {
			w.WriteHeader(http.StatusServiceUnavailable)
			return
		}
		posted = true
	}))
	defer server.Close()
	r := runner{apiURL: server.URL, orchestratorURL: server.URL, token: "12345678901234567890123456789012", client: server.Client()}
	if err := r.process(context.Background(), dueTick{MatchID: "match", InstanceID: "instance", TickNumber: 1}); err == nil {
		t.Fatal("expected snapshot error")
	}
	if posted {
		t.Fatal("tick submitted without a target snapshot")
	}
}
