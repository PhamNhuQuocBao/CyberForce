package main

import (
	"crypto/ecdh"
	"crypto/rand"
	"crypto/subtle"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net"
	"net/http"
	"net/netip"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
	"sync"
	"time"
)

const (
	interfaceName = "wg0"
	gatewayCIDR   = "100.127.240.1/20"
	dataDir       = "/var/lib/cyberforce-vpn"
)

var (
	vpnRange   = netip.MustParsePrefix("100.127.240.0/20")
	userIDRule = regexp.MustCompile(`^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`)
)

type peer struct {
	PublicKey string `json:"publicKey"`
	Address   string `json:"address"`
}

type controller struct {
	mu        sync.Mutex
	peers     map[string]peer
	publicKey string
	token     string
	run       func(...string) error
	statePath string
}

func command(args ...string) error {
	cmd := exec.Command(args[0], args[1:]...)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("%s: %w: %s", args[0], err, output)
	}
	return nil
}

func validKey(value string) bool {
	decoded, err := base64.StdEncoding.DecodeString(value)
	return err == nil && len(decoded) == 32 && base64.StdEncoding.EncodeToString(decoded) == value
}

func validPeer(value peer) bool {
	address, err := netip.ParseAddr(value.Address)
	return validKey(value.PublicKey) && err == nil && address.Is4() &&
		vpnRange.Contains(address) && value.Address != "100.127.240.0" &&
		value.Address != "100.127.240.1" && value.Address != "100.127.255.255"
}

func loadOrCreateKey(path string) ([]byte, error) {
	if data, err := os.ReadFile(path); err == nil {
		decoded, err := base64.StdEncoding.DecodeString(string(data))
		if err != nil || len(decoded) != 32 {
			return nil, errors.New("invalid gateway private key")
		}
		return decoded, nil
	} else if !errors.Is(err, os.ErrNotExist) {
		return nil, err
	}
	key, err := ecdh.X25519().GenerateKey(rand.Reader)
	if err != nil {
		return nil, err
	}
	if err := os.WriteFile(path, []byte(base64.StdEncoding.EncodeToString(key.Bytes())), 0600); err != nil {
		return nil, err
	}
	return key.Bytes(), nil
}

func newController(token string) (*controller, error) {
	if len(token) < 32 || token == "cyberforce_local_orchestrator_token_2026" {
		return nil, errors.New("VPN_GATEWAY_TOKEN must be a distinct secret of at least 32 characters")
	}
	if err := os.MkdirAll(dataDir, 0700); err != nil {
		return nil, err
	}
	keyBytes, err := loadOrCreateKey(filepath.Join(dataDir, "server.key"))
	if err != nil {
		return nil, err
	}
	key, err := ecdh.X25519().NewPrivateKey(keyBytes)
	if err != nil {
		return nil, err
	}
	c := &controller{
		peers: map[string]peer{}, publicKey: base64.StdEncoding.EncodeToString(key.PublicKey().Bytes()),
		token: token, run: command, statePath: filepath.Join(dataDir, "peers.json"),
	}
	if data, err := os.ReadFile(c.statePath); err == nil {
		if err := json.Unmarshal(data, &c.peers); err != nil {
			return nil, err
		}
		for id, item := range c.peers {
			if !userIDRule.MatchString(id) || !validPeer(item) {
				return nil, errors.New("invalid persisted VPN peer")
			}
		}
	} else if !errors.Is(err, os.ErrNotExist) {
		return nil, err
	}
	forwarding, err := os.ReadFile("/proc/sys/net/ipv4/ip_forward")
	if err != nil || strings.TrimSpace(string(forwarding)) != "0" {
		return nil, errors.New("VPN gateway requires IPv4 forwarding disabled")
	}
	if err := c.run("ip", "link", "add", interfaceName, "type", "wireguard"); err != nil {
		return nil, err
	}
	if err := c.run("ip", "address", "add", gatewayCIDR, "dev", interfaceName); err != nil {
		return nil, err
	}
	if err := c.run("wg", "set", interfaceName, "private-key", filepath.Join(dataDir, "server.key"), "listen-port", "51820"); err != nil {
		return nil, err
	}
	for _, item := range c.peers {
		if err := c.run("wg", "set", interfaceName, "peer", item.PublicKey, "allowed-ips", item.Address+"/32"); err != nil {
			return nil, err
		}
	}
	if err := c.run("ip", "link", "set", "up", "dev", interfaceName); err != nil {
		return nil, err
	}
	return c, nil
}

func (c *controller) persist() error {
	data, err := json.Marshal(c.peers)
	if err != nil {
		return err
	}
	tmp := c.statePath + ".tmp"
	if err := os.WriteFile(tmp, data, 0600); err != nil {
		return err
	}
	return os.Rename(tmp, c.statePath)
}

func (c *controller) put(id string, next peer) error {
	if !userIDRule.MatchString(id) || !validPeer(next) {
		return errors.New("invalid peer")
	}
	c.mu.Lock()
	defer c.mu.Unlock()
	for owner, item := range c.peers {
		if owner != id && (item.PublicKey == next.PublicKey || item.Address == next.Address) {
			return errors.New("peer key or address already assigned")
		}
	}
	old, exists := c.peers[id]
	if exists && old == next {
		return nil
	}
	if err := c.run("wg", "set", interfaceName, "peer", next.PublicKey, "allowed-ips", next.Address+"/32"); err != nil {
		return err
	}
	if exists && old.PublicKey != next.PublicKey {
		if err := c.run("wg", "set", interfaceName, "peer", old.PublicKey, "remove"); err != nil {
			_ = c.run("wg", "set", interfaceName, "peer", next.PublicKey, "remove")
			return err
		}
	}
	c.peers[id] = next
	if err := c.persist(); err != nil {
		if exists {
			c.peers[id] = old
			_ = c.run("wg", "set", interfaceName, "peer", old.PublicKey, "allowed-ips", old.Address+"/32")
		} else {
			delete(c.peers, id)
		}
		if !exists || old.PublicKey != next.PublicKey {
			_ = c.run("wg", "set", interfaceName, "peer", next.PublicKey, "remove")
		}
		return err
	}
	return nil
}

func (c *controller) delete(id string) error {
	if !userIDRule.MatchString(id) {
		return errors.New("invalid user ID")
	}
	c.mu.Lock()
	defer c.mu.Unlock()
	old, exists := c.peers[id]
	if !exists {
		return nil
	}
	if err := c.run("wg", "set", interfaceName, "peer", old.PublicKey, "remove"); err != nil {
		return err
	}
	delete(c.peers, id)
	if err := c.persist(); err != nil {
		c.peers[id] = old
		_ = c.run("wg", "set", interfaceName, "peer", old.PublicKey, "allowed-ips", old.Address+"/32")
		return err
	}
	return nil
}

func (c *controller) handler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(http.StatusNoContent) })
	mux.HandleFunc("GET /v1/public-key", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]string{"publicKey": c.publicKey})
	})
	mux.HandleFunc("PUT /v1/peers/{id}", func(w http.ResponseWriter, r *http.Request) {
		r.Body = http.MaxBytesReader(w, r.Body, 1024)
		var input peer
		if json.NewDecoder(r.Body).Decode(&input) != nil || !validPeer(input) {
			http.Error(w, "invalid peer", http.StatusBadRequest)
			return
		}
		if err := c.put(r.PathValue("id"), input); err != nil {
			log.Printf("peer update failed: %v", err)
			http.Error(w, "peer update failed", http.StatusBadGateway)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	})
	mux.HandleFunc("DELETE /v1/peers/{id}", func(w http.ResponseWriter, r *http.Request) {
		if err := c.delete(r.PathValue("id")); err != nil {
			log.Printf("peer removal failed: %v", err)
			http.Error(w, "peer removal failed", http.StatusBadGateway)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	})
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/health" {
			mux.ServeHTTP(w, r)
			return
		}
		given := r.Header.Get("Authorization")
		expected := "Bearer " + c.token
		if len(given) != len(expected) || subtle.ConstantTimeCompare([]byte(given), []byte(expected)) != 1 {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}
		mux.ServeHTTP(w, r)
	})
}

func main() {
	c, err := newController(os.Getenv("VPN_GATEWAY_TOKEN"))
	if err != nil {
		log.Fatal(err)
	}
	listener, err := net.Listen("tcp", "0.0.0.0:8082")
	if err != nil {
		log.Fatal(err)
	}
	server := &http.Server{
		Handler: c.handler(), ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout: 5 * time.Second, WriteTimeout: 5 * time.Second, IdleTimeout: 30 * time.Second,
	}
	log.Fatal(server.Serve(listener))
}
