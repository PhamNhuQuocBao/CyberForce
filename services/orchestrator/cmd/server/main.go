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
)

type labSpawner interface {
	Spawn(context.Context, string, string) (labdocker.Instance, error)
	Stop(context.Context, string) error
}

type spawnRequest struct {
	InstanceID string `json:"instanceId"`
	Image      string `json:"image"`
}

func handler(spawner labSpawner, token string) http.Handler {
	mux := http.NewServeMux()
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
		instance, err := spawner.Spawn(ctx, input.InstanceID, input.Image)
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
