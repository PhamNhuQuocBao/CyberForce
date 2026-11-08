-- CreateEnum
CREATE TYPE "exam_session_status" AS ENUM ('provisioning', 'running', 'finished', 'expired', 'failed');

-- AlterTable
ALTER TABLE "rooms" ADD COLUMN     "required_for_capstone" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "exams" (
    "id" UUID NOT NULL,
    "path_id" UUID NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "duration_hours" INTEGER NOT NULL,
    "passing_score" INTEGER NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_targets" (
    "id" UUID NOT NULL,
    "exam_id" UUID NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "image" VARCHAR(255) NOT NULL,
    "order_index" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "exam_targets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_objectives" (
    "id" UUID NOT NULL,
    "exam_id" UUID NOT NULL,
    "target_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "answer_hash" VARCHAR(71) NOT NULL,
    "order_index" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "exam_objectives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_sessions" (
    "id" UUID NOT NULL,
    "exam_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "status" "exam_session_status" NOT NULL DEFAULT 'provisioning',
    "consented_at" TIMESTAMPTZ NOT NULL,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "finished_at" TIMESTAMPTZ,
    "range_stopped_at" TIMESTAMPTZ,
    "score" INTEGER NOT NULL DEFAULT 0,
    "target_info" JSONB,

    CONSTRAINT "exam_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_submissions" (
    "id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "objective_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exams_slug_key" ON "exams"("slug");

-- CreateIndex
CREATE INDEX "exams_path_id_idx" ON "exams"("path_id");

-- CreateIndex
CREATE UNIQUE INDEX "exam_targets_exam_id_name_key" ON "exam_targets"("exam_id", "name");

-- CreateIndex
CREATE INDEX "exam_objectives_exam_id_idx" ON "exam_objectives"("exam_id");

-- CreateIndex
CREATE INDEX "exam_sessions_user_id_status_idx" ON "exam_sessions"("user_id", "status");

-- CreateIndex
CREATE INDEX "exam_sessions_status_expires_at_idx" ON "exam_sessions"("status", "expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "exam_submissions_session_id_objective_id_key" ON "exam_submissions"("session_id", "objective_id");

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_path_id_fkey" FOREIGN KEY ("path_id") REFERENCES "learning_paths"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_targets" ADD CONSTRAINT "exam_targets_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_objectives" ADD CONSTRAINT "exam_objectives_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_objectives" ADD CONSTRAINT "exam_objectives_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "exam_targets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_sessions" ADD CONSTRAINT "exam_sessions_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_sessions" ADD CONSTRAINT "exam_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_submissions" ADD CONSTRAINT "exam_submissions_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "exam_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_submissions" ADD CONSTRAINT "exam_submissions_objective_id_fkey" FOREIGN KEY ("objective_id") REFERENCES "exam_objectives"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- One in-progress exam per learner, including provisioning. The API expires stale rows before a new start.
CREATE UNIQUE INDEX "exam_sessions_one_active_user" ON "exam_sessions" ("user_id")
WHERE "status" IN ('provisioning'::exam_session_status, 'running'::exam_session_status);
