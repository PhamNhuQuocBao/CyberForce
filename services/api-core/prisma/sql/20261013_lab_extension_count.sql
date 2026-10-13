-- Non-destructive CF-302 upgrade for databases managed outside local Compose.
ALTER TABLE lab_instances
  ADD COLUMN IF NOT EXISTS extension_count INTEGER NOT NULL DEFAULT 0;
