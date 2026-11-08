-- Additive CF-701 schema update for an existing database. Review and run only after approval.
-- Existing submission rows and EXP balances are untouched.
BEGIN;
ALTER TABLE "users" ADD COLUMN "timezone" VARCHAR(64);
ALTER TABLE "users" ADD COLUMN "last_streak_date" VARCHAR(10);
ALTER TABLE "users" ADD COLUMN "streak_bonus_until" TIMESTAMPTZ;
ALTER TABLE "users" ADD COLUMN "streak_bonus_percent" INTEGER NOT NULL DEFAULT 100;
CREATE TABLE "streak_days" (
  "user_id" UUID NOT NULL,
  "local_date" VARCHAR(10) NOT NULL,
  "timezone" VARCHAR(64) NOT NULL,
  "task_id" UUID,
  "earned_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "streak_days_pkey" PRIMARY KEY ("user_id", "local_date"),
  CONSTRAINT "streak_days_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "streak_days_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "streak_days_user_id_task_id_key" ON "streak_days"("user_id", "task_id");
CREATE INDEX "streak_days_task_id_idx" ON "streak_days"("task_id");
CREATE TABLE "user_badges" (
  "user_id" UUID NOT NULL,
  "badge_id" VARCHAR(60) NOT NULL,
  "earned_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_badges_pkey" PRIMARY KEY ("user_id", "badge_id"),
  CONSTRAINT "user_badges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
COMMIT;
