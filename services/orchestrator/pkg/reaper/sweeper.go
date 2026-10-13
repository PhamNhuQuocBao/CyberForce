package reaper

import (
	"context"
	"log"
	"time"
)

const Interval = 30 * time.Second

type Instance struct {
	ID     string
	Status string
}

type Store interface {
	Candidates(context.Context) ([]Instance, error)
	Claim(context.Context, string) (bool, error)
	MarkTerminated(context.Context, string) error
}

type Stopper interface {
	Stop(context.Context, string) error
}

type Sweeper struct {
	Store   Store
	Stopper Stopper
}

func (s Sweeper) Sweep(ctx context.Context) error {
	instances, err := s.Store.Candidates(ctx)
	if err != nil {
		return err
	}
	for _, instance := range instances {
		if err := ctx.Err(); err != nil {
			return err
		}
		if instance.Status != "terminating" {
			claimed, err := s.Store.Claim(ctx, instance.ID)
			if err != nil {
				log.Printf("reaper claim %s: %v", instance.ID, err)
				continue
			}
			if !claimed {
				continue // An extension or another cleanup won the race.
			}
		}
		stopCtx, cancel := context.WithTimeout(ctx, 10*time.Second)
		err := s.Stopper.Stop(stopCtx, instance.ID)
		cancel()
		if err != nil {
			log.Printf("reaper stop %s: %v", instance.ID, err)
			continue // Keep terminating so the next sweep retries.
		}
		if err := s.Store.MarkTerminated(ctx, instance.ID); err != nil {
			log.Printf("reaper mark terminated %s: %v", instance.ID, err)
		}
	}
	return nil
}

func (s Sweeper) Run(ctx context.Context) {
	ticker := time.NewTicker(Interval)
	defer ticker.Stop()
	for {
		if err := s.Sweep(ctx); err != nil && ctx.Err() == nil {
			log.Printf("reaper sweep failed: %v", err)
		}
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
		}
	}
}
