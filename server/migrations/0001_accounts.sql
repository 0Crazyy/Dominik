-- Accounts: people log in with Discord (functions/api/auth/), publish teams with no review, like them and report them.
-- Admins moderate in /admin. Apply with:
--   npx wrangler d1 migrations apply dominik --remote      (--local for wrangler pages dev)

-- One row per Discord account that logged in
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,                     -- the Discord user id
  name TEXT NOT NULL,                      -- the Discord display name, refreshed on each login
  role TEXT NOT NULL DEFAULT 'user',       -- user or admin
  banned INTEGER NOT NULL DEFAULT 0,
  created INTEGER NOT NULL,                -- milliseconds
  seen INTEGER NOT NULL                    -- last login
);
CREATE INDEX IF NOT EXISTS users_name ON users (name);

-- Logged in browsers. Only the hash of the token is kept: the token itself lives in the cookie alone
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created INTEGER NOT NULL,
  expires INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_user ON sessions (user_id);
CREATE INDEX IF NOT EXISTS sessions_expires ON sessions (expires);

-- One like per account per team
CREATE TABLE IF NOT EXISTS likes (
  user_id TEXT NOT NULL,
  team_id INTEGER NOT NULL,
  created INTEGER NOT NULL,
  PRIMARY KEY (user_id, team_id)
);
CREATE INDEX IF NOT EXISTS likes_team ON likes (team_id);
CREATE INDEX IF NOT EXISTS likes_user ON likes (user_id, created);

-- One report per account per team, until an admin resolves it
CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  created INTEGER NOT NULL,
  resolved INTEGER                         -- when an admin dealt with it
);
CREATE UNIQUE INDEX IF NOT EXISTS reports_once ON reports (team_id, user_id);
CREATE INDEX IF NOT EXISTS reports_open ON reports (resolved, team_id);
CREATE INDEX IF NOT EXISTS reports_user ON reports (user_id, created);

-- What each admin did, kept for a year
CREATE TABLE IF NOT EXISTS admin_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id TEXT NOT NULL,
  action TEXT NOT NULL,                    -- remove, restore, approve, reject, dismiss, ban, unban, promote, demote
  target TEXT NOT NULL,                    -- "team 12" or "user 1234"
  detail TEXT,
  created INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS admin_log_created ON admin_log (created);

-- Teams now belong to the account that published them. Teams sent before accounts have none.
-- status: approved (on the site), removed (taken down by an admin), and from before accounts: pending, rejected
ALTER TABLE teams ADD COLUMN user_id TEXT;
CREATE INDEX IF NOT EXISTS teams_user ON teams (user_id, created);
