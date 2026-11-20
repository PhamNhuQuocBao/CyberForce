-- Apply only during an approved rollout. Existing tasks remain General (no skill tags).
DO $$ BEGIN
  CREATE TYPE skill_axis AS ENUM (
    'web', 'network', 'binary', 'crypto', 'forensics',
    'windows_ad', 'defensive', 'cloud_devsecops'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS skill_tags skill_axis[] NOT NULL DEFAULT ARRAY[]::skill_axis[];

CREATE TABLE IF NOT EXISTS skill_awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  skill skill_axis NOT NULL,
  points_earned INTEGER NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT skill_awards_user_id_task_id_skill_key UNIQUE (user_id, task_id, skill)
);
CREATE INDEX IF NOT EXISTS skill_awards_user_id_skill_idx ON skill_awards(user_id, skill);
