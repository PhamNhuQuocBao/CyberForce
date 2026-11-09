-- Review and apply to an existing database only during an approved rollout.
-- Take a backup first; this preserves existing paths, rooms, tasks and questions.

DO $$ BEGIN
  CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS status content_status NOT NULL DEFAULT 'published';
ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
UPDATE learning_paths SET status = CASE WHEN is_published THEN 'published'::content_status ELSE 'draft'::content_status END WHERE status <> 'archived';

CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE RESTRICT,
  title VARCHAR(150) NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 1,
  status content_status NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS modules_path_id_order_index_idx ON modules(path_id, order_index);

ALTER TABLE rooms ADD COLUMN IF NOT EXISTS module_id UUID;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS status content_status NOT NULL DEFAULT 'published';
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
UPDATE rooms SET status = CASE WHEN published_at IS NOT NULL THEN 'published'::content_status ELSE 'draft'::content_status END WHERE status <> 'archived';

INSERT INTO modules (id, path_id, title, order_index, status, updated_at)
SELECT gen_random_uuid(), r.path_id, r.module_name, r.module_order,
  CASE WHEN bool_or(r.published_at IS NOT NULL) AND p.is_published
    THEN 'published'::content_status ELSE 'draft'::content_status END, now()
FROM rooms r JOIN learning_paths p ON p.id = r.path_id
WHERE r.path_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM modules m WHERE m.path_id = r.path_id
      AND m.title = r.module_name AND m.order_index = r.module_order
  )
GROUP BY r.path_id, r.module_name, r.module_order, p.is_published;

UPDATE rooms r SET module_id = m.id
FROM modules m
WHERE r.module_id IS NULL AND r.path_id = m.path_id
  AND r.module_name = m.title AND r.module_order = m.order_index;

CREATE INDEX IF NOT EXISTS rooms_module_id_idx ON rooms(module_id);
DO $$ BEGIN
  ALTER TABLE rooms ADD CONSTRAINT rooms_module_id_fkey
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS status content_status NOT NULL DEFAULT 'published';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE questions ADD COLUMN IF NOT EXISTS status content_status NOT NULL DEFAULT 'published';
ALTER TABLE questions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
