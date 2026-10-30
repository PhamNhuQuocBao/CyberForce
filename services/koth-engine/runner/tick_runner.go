package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"
)

type dueTick struct {
	MatchID    string `json:"matchId"`
	InstanceID string `json:"instanceId"`
	TickNumber int    `json:"tickNumber"`
}

type snapshot struct {
	King    string `json:"king"`
	Healthy bool   `json:"healthy"`
}

type runner struct {
	apiURL          string
	orchestratorURL string
	token           string
	client          *http.Client
}

func (r runner) request(ctx context.Context, method, url string, body any, output any) error {
	var input *strings.Reader
	if body != nil {
		encoded, err := json.Marshal(body)
		if err != nil {
			return err
		}
		input = strings.NewReader(string(encoded))
	} else {
		input = strings.NewReader("")
	}
	req, err := http.NewRequestWithContext(ctx, method, url, input)
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+r.token)
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	response, err := r.client.Do(req)
	if err != nil {
		return err
	}
	defer response.Body.Close()
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return fmt.Errorf("%s returned %d", url, response.StatusCode)
	}
	if output != nil {
		return json.NewDecoder(response.Body).Decode(output)
	}
	return nil
}

func (r runner) due(ctx context.Context) ([]dueTick, error) {
	var result struct {
		Data []dueTick `json:"data"`
	}
	err := r.request(ctx, http.MethodGet, r.apiURL+"/api/v1/koth/internal/due", nil, &result)
	return result.Data, err
}

func (r runner) process(ctx context.Context, tick dueTick) error {
	var current snapshot
	url := r.orchestratorURL + "/v1/instances/" + tick.InstanceID + "/koth-snapshot"
	if err := r.request(ctx, http.MethodGet, url, nil, &current); err != nil {
		return fmt.Errorf("target snapshot: %w", err)
	}
	url = fmt.Sprintf("%s/api/v1/koth/internal/matches/%s/ticks/%d", r.apiURL, tick.MatchID, tick.TickNumber)
	return r.request(ctx, http.MethodPost, url, current, nil)
}

func (r runner) cycle(ctx context.Context) error {
	ticks, err := r.due(ctx)
	if err != nil {
		return err
	}
	var group sync.WaitGroup
	for _, tick := range ticks {
		group.Add(1)
		go func(tick dueTick) {
			defer group.Done()
			deadline, cancel := context.WithTimeout(ctx, 4*time.Second)
			defer cancel()
			if err := r.process(deadline, tick); err != nil {
				log.Printf("match %s tick %d: %v", tick.MatchID, tick.TickNumber, err)
			}
		}(tick)
	}
	group.Wait()
	return nil
}

func main() {
	api := strings.TrimRight(os.Getenv("KOTH_API_URL"), "/")
	orchestrator := strings.TrimRight(os.Getenv("ORCHESTRATOR_URL"), "/")
	token := os.Getenv("ORCHESTRATOR_TOKEN")
	if api == "" || orchestrator == "" || len(token) < 32 {
		log.Fatal(errors.New("KotH URLs and token are required"))
	}
	r := runner{apiURL: api, orchestratorURL: orchestrator, token: token, client: &http.Client{Timeout: 4 * time.Second}}
	ticker := time.NewTicker(time.Second)
	defer ticker.Stop()
	for {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		if err := r.cycle(ctx); err != nil {
			log.Printf("KotH poll: %v", err)
		}
		cancel()
		<-ticker.C
	}
}
