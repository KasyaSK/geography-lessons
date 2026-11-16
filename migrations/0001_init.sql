CREATE TABLE IF NOT EXISTS submissions (
 id TEXT PRIMARY KEY,
 full_name TEXT NOT NULL,
 student_class TEXT NOT NULL,
 answers_json TEXT NOT NULL,
 score INTEGER NOT NULL CHECK(score >= 0 AND score <= 16),
 submitted_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
 duration_seconds INTEGER NOT NULL DEFAULT 0,
 quiz_version TEXT NOT NULL DEFAULT '2026-11-16-v1'
);
CREATE INDEX IF NOT EXISTS idx_submission_date ON submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_submission_class ON submissions(student_class);
CREATE TABLE IF NOT EXISTS teacher_sessions (
 token_hash TEXT PRIMARY KEY,
 expires_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_teacher_sessions_expiry ON teacher_sessions(expires_at);
