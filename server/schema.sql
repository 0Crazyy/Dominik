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
-- Short links of the Team Builder (/editor?s=<code>), made by functions/api/share.js. Same command as above applies this too
CREATE TABLE IF NOT EXISTS shares (
  code TEXT PRIMARY KEY,                   -- 7 letters and digits in the link
  team TEXT NOT NULL,                      -- the clean team as JSON
  hash TEXT NOT NULL,                      -- of the team, so the same team always gets the same link
  ip_hash TEXT,                            -- for the limits per address; erased after 2 days
  created INTEGER NOT NULL                 -- milliseconds
);
CREATE UNIQUE INDEX IF NOT EXISTS shares_hash ON shares (hash);
CREATE INDEX IF NOT EXISTS shares_ip ON shares (ip_hash, created);
CREATE UNIQUE INDEX IF NOT EXISTS teams_hash ON teams (hash);
CREATE INDEX IF NOT EXISTS teams_status ON teams (status, created);
CREATE INDEX IF NOT EXISTS teams_ip ON teams (ip_hash, created);
