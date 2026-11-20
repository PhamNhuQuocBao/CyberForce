-- Apply only in an approved rollout after CF-801's admin CMS backfill.
-- Additive: existing rooms remain admin-managed with creator_id NULL.
DO $$ BEGIN
  CREATE TYPE creator_review_status AS ENUM ('editing', 'pending_review', 'changes_requested', 'rejected', 'approved');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE rooms ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS review_status creator_review_status NOT NULL DEFAULT 'editing';
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS review_fingerprint VARCHAR(64);
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS review_submitted_at TIMESTAMPTZ;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS review_feedback TEXT;
CREATE INDEX IF NOT EXISTS rooms_creator_id_review_status_idx ON rooms(creator_id, review_status);

CREATE TABLE IF NOT EXISTS creator_test_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lab_instance_id UUID NOT NULL UNIQUE REFERENCES lab_instances(id) ON DELETE CASCADE,
  fingerprint VARCHAR(64) NOT NULL,
  verified_question_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS creator_test_runs_room_id_created_at_idx ON creator_test_runs(room_id, created_at);

CREATE TABLE IF NOT EXISTS creator_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  uploader_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  object_key TEXT NOT NULL UNIQUE,
  filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size_bytes INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS creator_attachments_room_id_idx ON creator_attachments(room_id);
