const db = require('better-sqlite3')('football.db');

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS processed_files (
    filename TEXT,
    content_hash TEXT,
    processed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (filename, content_hash)
  );

  CREATE TABLE IF NOT EXISTS teams (
    name TEXT PRIMARY KEY,
    points INTEGER DEFAULT 0,
    games_won_reg INTEGER DEFAULT 0,
    games_won_ot INTEGER DEFAULT 0,
    games_lost_reg INTEGER DEFAULT 0,
    games_lost_ot INTEGER DEFAULT 0,
    goals_scored INTEGER DEFAULT 0,
    goals_conceded INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS players (
    id TEXT PRIMARY KEY, -- "TeamName-PlayerNr"
    name TEXT,
    team TEXT,
    nr INTEGER,
    role TEXT,
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    minutes_played INTEGER DEFAULT 0,
    yellow_cards INTEGER DEFAULT 0,
    red_cards INTEGER DEFAULT 0,
    games_played INTEGER DEFAULT 0
  );
`);

module.exports = db;
