CREATE UNIQUE INDEX IF NOT EXISTS "exam_sessions_one_active_user" ON "exam_sessions" ("user_id")
WHERE "status" IN ('provisioning'::exam_session_status, 'running'::exam_session_status);
