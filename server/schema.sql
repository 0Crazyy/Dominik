-- Community teams sent from the Team Builder. Apply with:
--   npx wrangler@4 d1 execute dominik --remote --file server/schema.sql
CREATE TABLE IF NOT EXISTS teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page TEXT NOT NULL,                      -- "energy/fire"
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, approved or rejected
  team TEXT NOT NULL,                      -- the team as JSON, in the shape of the Team Builder
  author TEXT NOT NULL DEFAULT '',
  hash TEXT NOT NULL,                      -- of the team, so the same team is not sent twice
  ip_hash TEXT,                            -- for the sending limits; erased after 2 days
  created INTEGER NOT NULL,                -- milliseconds
  reviewed INTEGER,
  reason TEXT,
  message TEXT                             -- the Discord message where the bot shows the team for review
);
CREATE UNIQUE INDEX IF NOT EXISTS teams_hash ON teams (hash);
CREATE INDEX IF NOT EXISTS teams_status ON teams (status, created);
CREATE INDEX IF NOT EXISTS teams_ip ON teams (ip_hash, created);
