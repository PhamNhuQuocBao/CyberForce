package reaper

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5/pgxpool"
)

type PostgresStore struct{ pool *pgxpool.Pool }

func NewPostgresStore(ctx context.Context, databaseURL, password string) (*PostgresStore, error) {
	config, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		return nil, err
	}
	if config.ConnConfig.User != "cyberforce_reaper" {
		return nil, errors.New("reaper database URL must use cyberforce_reaper")
	}
	config.ConnConfig.Password = password
	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return nil, err
	}
	return &PostgresStore{pool: pool}, nil
}

func (s *PostgresStore) Close() { s.pool.Close() }

func (s *PostgresStore) Candidates(ctx context.Context) ([]Instance, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT id::text, status::text
		FROM lab_instances
		WHERE (status = 'running' AND expires_at + INTERVAL '3 minutes' <= NOW())
		   OR status = 'terminating'
		   OR (status = 'provisioning' AND created_at + INTERVAL '2 minutes' <= NOW())
		ORDER BY created_at
		LIMIT 100
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var instances []Instance
	for rows.Next() {
		var instance Instance
		if err := rows.Scan(&instance.ID, &instance.Status); err != nil {
			return nil, err
		}
		instances = append(instances, instance)
	}
	return instances, rows.Err()
}

func (s *PostgresStore) Claim(ctx context.Context, id string) (bool, error) {
	command, err := s.pool.Exec(ctx, `
		UPDATE lab_instances SET status = 'terminating'
		WHERE id = $1::uuid
		  AND ((status = 'running' AND expires_at + INTERVAL '3 minutes' <= NOW())
		    OR (status = 'provisioning' AND created_at + INTERVAL '2 minutes' <= NOW()))
	`, id)
	return command.RowsAffected() == 1, err
}

func (s *PostgresStore) MarkTerminated(ctx context.Context, id string) error {
	_, err := s.pool.Exec(ctx, `
		UPDATE lab_instances SET status = 'terminated'
		WHERE id = $1::uuid AND status = 'terminating'
	`, id)
	return err
}
