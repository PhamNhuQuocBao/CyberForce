package main

import (
	"context"
	"crypto/subtle"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	labdocker "github.com/cyberforce/orchestrator/pkg/docker"
	"github.com/cyberforce/orchestrator/pkg/reaper"
	"github.com/gorilla/websocket"
)

type labSpawner interface {
	Spawn(context.Context, string, string, string) (labdocker.Instance, error)
	Stop(context.Context, string) error
}

type spawnRequest struct {
	InstanceID  string `json:"instanceId"`
	Image       string `json:"image"`
	DynamicFlag string `json:"dynamicFlag"`
}

type terminalOpener interface {
	OpenTerminal(context.Context, string) (*labdocker.TerminalSession, error)
}

type kothInspector interface {
	KothSnapshot(context.Context, string) (labdocker.KothSnapshot, error)
}

type vpnNetworkManager interface {
	ConnectVpn(context.Context, string) error
	DisconnectVpn(context.Context, string) error
}

type examRangeManager interface {
	SpawnExam(context.Context, string, []labdocker.ExamTarget) (labdocker.ExamRange, error)
	InspectExam(context.Context, string) (labdocker.ExamRange, error)
	StopExam(context.Context, string) error
}

type examVpnManager interface {
	ConnectExamVpn(context.Context, string) error
	DisconnectExamVpn(context.Context, string) error
}

func serveTerminal(w http.ResponseWriter, r *http.Request, opener terminalOpener, id string) {
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	session, err := opener.OpenTerminal(ctx, id)
	cancel()
	if err != nil {
		http.Error(w, "terminal unavailable", http.StatusBadGateway)
		return
	}
	defer session.Conn.Close()
	ws, err := (&websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return r.Header.Get("Origin") == "" }}).Upgrade(w, r, nil)
	if err != nil {
		return
	}
	defer ws.Close()
	ws.SetReadLimit(64 * 1024)
	done := make(chan struct{})
	go func() {
		defer close(done)
		defer ws.Close()
		buf := make([]byte, 16*1024)
		for {
			n, err := session.Reader.Read(buf)
			if n > 0 {
				if writeErr := ws.WriteMessage(websocket.BinaryMessage, buf[:n]); writeErr != nil {
					return
				}
			}
			if err != nil {
				return
			}
		}
	}()
	// Input activity is the idle criterion; terminal output must not keep an abandoned session alive.
	_ = ws.SetReadDeadline(time.Now().Add(15 * time.Minute))
	for {
		kind, data, err := ws.ReadMessage()
		if err != nil {
			break
		}
		if kind == websocket.BinaryMessage {
			if _, err := session.Conn.Write(data); err != nil {
				break
			}
			_ = ws.SetReadDeadline(time.Now().Add(15 * time.Minute))
		} else if kind == websocket.TextMessage {
			var size struct {
				Rows uint `json:"rows"`
				Cols uint `json:"cols"`
			}
			if json.Unmarshal(data, &size) == nil {
				resizeCtx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
				_ = session.Resize(resizeCtx, size.Rows, size.Cols)
				cancel()
			}
		}
	}
	_ = session.Conn.Close()
	select {
	case <-done:
	case <-time.After(time.Second):
	}
}

func handler(spawner labSpawner, token string) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/v1/exams", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}
		manager, ok := spawner.(examRangeManager)
		if !ok {
			http.Error(w, "exam range unavailable", http.StatusServiceUnavailable)
			return
		}
		var input struct {
			SessionID string                 `json:"sessionId"`
			Targets   []labdocker.ExamTarget `json:"targets"`
		}
		r.Body = http.MaxBytesReader(w, r.Body, 8192)
		if json.NewDecoder(r.Body).Decode(&input) != nil {
			http.Error(w, "invalid JSON", http.StatusBadRequest)
			return
		}
		ctx, cancel := context.WithTimeout(r.Context(), 60*time.Second)
		defer cancel()
		result, err := manager.SpawnExam(ctx, input.SessionID, input.Targets)
		if err != nil {
			log.Printf("exam spawn failed: %v", err)
			http.Error(w, "exam range failed", http.StatusBadGateway)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		_ = json.NewEncoder(w).Encode(result)
	})
	mux.HandleFunc("/v1/exams/", func(w http.ResponseWriter, r *http.Request) {
		if strings.HasSuffix(r.URL.Path, "/vpn-network") {
			manager, ok := spawner.(examVpnManager)
			if !ok {
				http.Error(w, "exam VPN unavailable", http.StatusServiceUnavailable)
				return
			}
			id := strings.TrimSuffix(strings.TrimPrefix(r.URL.Path, "/v1/exams/"), "/vpn-network")
			ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
			defer cancel()
			var err error
			switch r.Method {
			case http.MethodPost:
				err = manager.ConnectExamVpn(ctx, id)
			case http.MethodDelete:
				err = manager.DisconnectExamVpn(ctx, id)
			default:
				http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
				return
			}
			if err != nil {
				log.Printf("exam VPN failed: %v", err)
				http.Error(w, "exam VPN unavailable", http.StatusBadGateway)
				return
			}
			w.WriteHeader(http.StatusNoContent)
			return
		}
		manager, ok := spawner.(examRangeManager)
		if !ok {
			http.Error(w, "exam range unavailable", http.StatusServiceUnavailable)
			return
		}
		id := strings.TrimPrefix(r.URL.Path, "/v1/exams/")
		ctx, cancel := context.WithTimeout(r.Context(), 20*time.Second)
		defer cancel()
		switch r.Method {
		case http.MethodGet:
			result, err := manager.InspectExam(ctx, id)
			if err != nil {
				http.Error(w, "exam range unavailable", http.StatusBadGateway)
				return
			}
			w.Header().Set("Content-Type", "application/json")
			_ = json.NewEncoder(w).Encode(result)
		case http.MethodDelete:
			if err := manager.StopExam(ctx, id); err != nil {
				log.Printf("exam stop failed: %v", err)
				http.Error(w, "exam stop failed", http.StatusBadGateway)
				return
			}
			w.WriteHeader(http.StatusNoContent)
		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	})
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	})
	mux.HandleFunc("/v1/instances", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}
		var input spawnRequest
		r.Body = http.MaxBytesReader(w, r.Body, 4096)
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			http.Error(w, "invalid JSON", http.StatusBadRequest)
			return
		}
		ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
		defer cancel()
		instance, err := spawner.Spawn(ctx, input.InstanceID, input.Image, input.DynamicFlag)
		if err != nil {
			log.Printf("spawn failed: %v", err)
			http.Error(w, "lab spawn failed", http.StatusBadGateway)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		_ = json.NewEncoder(w).Encode(instance)
	})
	mux.HandleFunc("/v1/instances/", func(w http.ResponseWriter, r *http.Request) {
		if strings.HasSuffix(r.URL.Path, "/koth-snapshot") {
			if r.Method != http.MethodGet {
				http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
				return
			}
			id := strings.TrimSuffix(strings.TrimPrefix(r.URL.Path, "/v1/instances/"), "/koth-snapshot")
			inspector, ok := spawner.(kothInspector)
			if !ok {
				http.Error(w, "KotH inspection unavailable", http.StatusServiceUnavailable)
				return
			}
			ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
			defer cancel()
			snapshot, err := inspector.KothSnapshot(ctx, id)
			if err != nil {
				http.Error(w, "KotH inspection failed", http.StatusBadGateway)
				return
			}
			w.Header().Set("Content-Type", "application/json")
			_ = json.NewEncoder(w).Encode(snapshot)
			return
		}
		if strings.HasSuffix(r.URL.Path, "/vpn-network") {
			id := strings.TrimSuffix(strings.TrimPrefix(r.URL.Path, "/v1/instances/"), "/vpn-network")
			manager, ok := spawner.(vpnNetworkManager)
			if !ok {
				http.Error(w, "VPN network unavailable", http.StatusServiceUnavailable)
				return
			}
			ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
			defer cancel()
			var err error
			switch r.Method {
			case http.MethodPost:
				err = manager.ConnectVpn(ctx, id)
			case http.MethodDelete:
				err = manager.DisconnectVpn(ctx, id)
			default:
				http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
				return
			}
			if err != nil {
				log.Printf("VPN network operation failed: %v", err)
				http.Error(w, "VPN network operation failed", http.StatusBadGateway)
				return
			}
			w.WriteHeader(http.StatusNoContent)
			return
		}
		if strings.HasSuffix(r.URL.Path, "/attackbox/stream") {
			if r.Method != http.MethodGet {
				http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
				return
			}
			id := strings.TrimSuffix(strings.TrimPrefix(r.URL.Path, "/v1/instances/"), "/attackbox/stream")
			if manager, ok := spawner.(attackBoxManager); ok {
				serveAttackBox(w, r, manager, id)
				return
			}
			http.Error(w, "attackbox unavailable", http.StatusServiceUnavailable)
			return
		}
		if strings.HasSuffix(r.URL.Path, "/attackbox") {
			id := strings.TrimSuffix(strings.TrimPrefix(r.URL.Path, "/v1/instances/"), "/attackbox")
			manager, ok := spawner.(attackBoxManager)
			if !ok {
				http.Error(w, "attackbox unavailable", http.StatusServiceUnavailable)
				return
			}
			ctx, cancel := context.WithTimeout(r.Context(), 20*time.Second)
			defer cancel()
			switch r.Method {
			case http.MethodGet:
				status, err := manager.AttackBoxStatus(ctx, id)
				if err == nil {
					_ = json.NewEncoder(w).Encode(status)
					return
				}
			case http.MethodPost:
				status, err := manager.StartAttackBox(ctx, id)
				if err == nil {
					w.WriteHeader(http.StatusCreated)
					_ = json.NewEncoder(w).Encode(status)
					return
				}
			case http.MethodDelete:
				if err := manager.StopAttackBox(ctx, id); err == nil {
					w.WriteHeader(http.StatusNoContent)
					return
				}
			default:
				http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
				return
			}
			http.Error(w, "attackbox operation failed", http.StatusBadGateway)
			return
		}
		if r.Method == http.MethodGet && strings.HasSuffix(r.URL.Path, "/terminal") {
			id := strings.TrimSuffix(strings.TrimPrefix(r.URL.Path, "/v1/instances/"), "/terminal")
			if opener, ok := spawner.(terminalOpener); ok {
				serveTerminal(w, r, opener, id)
				return
			}
			http.Error(w, "terminal unavailable", http.StatusServiceUnavailable)
			return
		}
		if r.Method != http.MethodDelete {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}
		id := strings.TrimPrefix(r.URL.Path, "/v1/instances/")
		ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
		defer cancel()
		if err := spawner.Stop(ctx, id); err != nil {
			log.Printf("stop failed: %v", err)
			http.Error(w, "lab stop failed", http.StatusBadGateway)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	})
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/health" {
			bearer := "Bearer " + token
			if subtle.ConstantTimeCompare([]byte(r.Header.Get("Authorization")), []byte(bearer)) != 1 {
				http.Error(w, "unauthorized", http.StatusUnauthorized)
				return
			}
		}
		mux.ServeHTTP(w, r)
	})
}

func main() {
	token := os.Getenv("ORCHESTRATOR_TOKEN")
	if len(token) < 32 {
		log.Fatal("ORCHESTRATOR_TOKEN must be at least 32 characters")
	}
	spawner, err := labdocker.NewSpawner()
	if err != nil {
		log.Fatal(err)
	}
	defer spawner.Close()
	databaseURL := os.Getenv("REAPER_DATABASE_URL")
	password := os.Getenv("REAPER_DB_PASSWORD")
	if databaseURL == "" {
		log.Fatal("REAPER_DATABASE_URL is required")
	}
	if len(password) < 32 {
		log.Fatal("REAPER_DB_PASSWORD must be at least 32 characters")
	}
	store, err := reaper.NewPostgresStore(context.Background(), databaseURL, password)
	if err != nil {
		log.Fatal(err)
	}
	defer store.Close()
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	go (reaper.Sweeper{Store: store, Stopper: spawner}).Run(ctx)
	server := &http.Server{Addr: ":8081", Handler: handler(spawner, token), ReadHeaderTimeout: 5 * time.Second}
	log.Fatal(server.ListenAndServe())
}
