-- CreateTable
CREATE TABLE "ctf_events" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "description" TEXT NOT NULL,
    "starts_at" TIMESTAMPTZ NOT NULL,
    "ends_at" TIMESTAMPTZ NOT NULL,
    "freeze_at" TIMESTAMPTZ,
    "unfrozen_at" TIMESTAMPTZ,
    "published_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ctf_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ctf_challenges" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "description" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "flag_hash" VARCHAR(71) NOT NULL,
    "order_index" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ctf_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ctf_participants" (
    "event_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "joined_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ctf_participants_pkey" PRIMARY KEY ("event_id","user_id")
);

-- CreateTable
CREATE TABLE "ctf_solves" (
    "id" BIGSERIAL NOT NULL,
    "challenge_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "solved_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ctf_solves_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ctf_events_slug_key" ON "ctf_events"("slug");

-- CreateIndex
CREATE INDEX "ctf_events_published_at_starts_at_idx" ON "ctf_events"("published_at", "starts_at");

-- CreateIndex
CREATE INDEX "ctf_challenges_event_id_order_index_idx" ON "ctf_challenges"("event_id", "order_index");

-- CreateIndex
CREATE INDEX "ctf_solves_challenge_id_solved_at_idx" ON "ctf_solves"("challenge_id", "solved_at");

-- CreateIndex
CREATE INDEX "ctf_solves_user_id_solved_at_idx" ON "ctf_solves"("user_id", "solved_at");

-- CreateIndex
CREATE UNIQUE INDEX "ctf_solves_challenge_id_user_id_key" ON "ctf_solves"("challenge_id", "user_id");

-- AddForeignKey
ALTER TABLE "ctf_challenges" ADD CONSTRAINT "ctf_challenges_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "ctf_events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ctf_participants" ADD CONSTRAINT "ctf_participants_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "ctf_events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ctf_participants" ADD CONSTRAINT "ctf_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ctf_solves" ADD CONSTRAINT "ctf_solves_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "ctf_challenges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ctf_solves" ADD CONSTRAINT "ctf_solves_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

