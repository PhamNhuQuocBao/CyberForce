-- Upgrade legacy static seed answers without reseeding rooms or user progress.
-- Applies only where the hash is absent; review rows in the target environment first.
BEGIN;
UPDATE questions
SET answer_hash = 'sha256:' || encode(sha256(convert_to(flag_pattern, 'UTF8')), 'hex'),
    flag_pattern = NULL
WHERE flag_type = 'static'
  AND answer_hash IS NULL
  AND flag_pattern IS NOT NULL;
COMMIT;
