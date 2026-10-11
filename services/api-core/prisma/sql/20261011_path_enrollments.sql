-- Additive schema update for existing databases managed with prisma db push.
-- Run once with: prisma db execute --file prisma/sql/20261011_path_enrollments.sql --schema prisma/schema.prisma
BEGIN;
CREATE TABLE "path_enrollments" (
  "user_id" UUID NOT NULL,
  "path_id" UUID NOT NULL,
  "enrolled_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "path_enrollments_pkey" PRIMARY KEY ("user_id", "path_id"),
  CONSTRAINT "path_enrollments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "path_enrollments_path_id_fkey" FOREIGN KEY ("path_id") REFERENCES "learning_paths"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "path_enrollments_path_id_idx" ON "path_enrollments"("path_id");
COMMIT;
