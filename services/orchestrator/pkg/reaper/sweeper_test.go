package reaper

import (
	"context"
	"errors"
	"testing"
)

type fakeStore struct {
	instances []Instance
	claimed   bool
	marked    int
}

func (f *fakeStore) Candidates(context.Context) ([]Instance, error) { return f.instances, nil }
func (f *fakeStore) Claim(context.Context, string) (bool, error)    { return f.claimed, nil }
func (f *fakeStore) MarkTerminated(context.Context, string) error {
	f.marked++
	return nil
}

type fakeStopper struct {
	stops int
	err   error
}

func (f *fakeStopper) Stop(context.Context, string) error {
	f.stops++
	return f.err
}

func TestSweepHonorsClaimAndRetriesCleanup(t *testing.T) {
	store := &fakeStore{instances: []Instance{{ID: "one", Status: "running"}}}
	stopper := &fakeStopper{}
	sweeper := Sweeper{Store: store, Stopper: stopper}
	if err := sweeper.Sweep(context.Background()); err != nil || stopper.stops != 0 {
		t.Fatal("unclaimed session was stopped")
	}
	store.claimed = true
	stopper.err = errors.New("Docker unavailable")
	if err := sweeper.Sweep(context.Background()); err != nil || store.marked != 0 {
		t.Fatal("failed cleanup was marked terminated")
	}
	store.instances[0].Status = "terminating"
	stopper.err = nil
	if err := sweeper.Sweep(context.Background()); err != nil || store.marked != 1 || stopper.stops != 2 {
		t.Fatal("terminating session was not retried")
	}
}
