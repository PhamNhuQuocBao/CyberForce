package main

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"strconv"
	"testing"
	"time"
)

func TestHandshakeStatusIsCurrentAndPrivate(t *testing.T) {
	id := "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
	key := testKey(1)
	c := &controller{
		peers:     map[string]peer{id: {PublicKey: key, Address: "100.127.240.2"}},
		token:     "a-very-long-test-token-for-status-checks",
		statePath: filepath.Join(t.TempDir(), "peers.json"),
		run:       func(...string) error { return nil },
	}
	last := time.Now().Unix()
	c.readHandshakes = func() ([]byte, error) { return []byte(key + "\t" + strconv.FormatInt(last, 10) + "\n"), nil }
	c.sampleHandshakes()
	request := func(auth, path string) *httptest.ResponseRecorder {
		r := httptest.NewRequest(http.MethodGet, path, nil)
		if auth != "" {
			r.Header.Set("Authorization", "Bearer "+auth)
		}
		w := httptest.NewRecorder()
		c.handler().ServeHTTP(w, r)
		return w
	}
	path := "/v1/peers/" + id + "/status"
	if request("", path).Code != http.StatusUnauthorized ||
		request(c.token, "/v1/peers/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/status").Code != http.StatusNotFound {
		t.Fatal("status authorization or isolation failed")
	}
	w := request(c.token, path)
	var status struct {
		Connected bool   `json:"connected"`
		Address   string `json:"address"`
	}
	if w.Code != http.StatusOK || json.Unmarshal(w.Body.Bytes(), &status) != nil || !status.Connected || status.Address != "100.127.240.2" {
		t.Fatalf("unexpected status: %d %s", w.Code, w.Body.String())
	}
	if err := c.put(id, peer{PublicKey: testKey(3), Address: "100.127.240.2"}); err != nil {
		t.Fatal(err)
	}
	w = request(c.token, path)
	if json.Unmarshal(w.Body.Bytes(), &status) != nil || status.Connected {
		t.Fatalf("rotated peer retained old handshake: %s", w.Body.String())
	}
	if err := c.put(id, peer{PublicKey: key, Address: "100.127.240.2"}); err != nil {
		t.Fatal(err)
	}
	last = time.Now().Add(-181 * time.Second).Unix()
	c.sampleHandshakes()
	w = request(c.token, path)
	if json.Unmarshal(w.Body.Bytes(), &status) != nil || status.Connected {
		t.Fatalf("stale handshake is connected: %s", w.Body.String())
	}
	c.readHandshakes = func() ([]byte, error) { return nil, errors.New("wg unavailable") }
	c.sampleHandshakes()
	if request(c.token, path).Code != http.StatusServiceUnavailable {
		t.Fatal("unavailable sample reported as disconnected")
	}
}
