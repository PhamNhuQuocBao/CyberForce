-- Additive only. Apply to the intended database before deploying CF-204.
CREATE TABLE IF NOT EXISTS "hint_unlocks" (
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "question_id" UUID NOT NULL REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "tier" INTEGER NOT NULL CHECK ("tier" BETWEEN 1 AND 3),
  "points_deducted" INTEGER NOT NULL CHECK ("points_deducted" >= 0),
  "unlocked_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("user_id", "question_id", "tier")
);
CREATE INDEX IF NOT EXISTS "hint_unlocks_question_id_idx" ON "hint_unlocks"("question_id");
