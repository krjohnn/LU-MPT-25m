const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const db = require('./database');
const { parseGameFile } = require('./parser');

const app = express();
app.use(cors());

// --- 1. THE MAIN "SCAN" API ---
app.get('/api/process', (req, res) => {
    const dataDir = path.join(__dirname, '../data/JSON_TestData');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
    let count = 0;

    const insertTeam = db.prepare(`INSERT INTO teams (name) VALUES (?) ON CONFLICT(name) DO NOTHING`);
    const updateTeamStats = db.prepare(`
        UPDATE teams SET points = points + ?, games_won_reg = games_won_reg + ?, 
        games_won_ot = games_won_ot + ?, games_lost_reg = games_lost_reg + ?, 
        games_lost_ot = games_lost_ot + ?, goals_scored = goals_scored + ?, 
        goals_conceded = goals_conceded + ? WHERE name = ?
    `);
    const insertPlayer = db.prepare(`
        INSERT INTO players (id, name, team, nr, role, goals, assists, minutes_played, yellow_cards, red_cards, games_played)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
        goals = goals + excluded.goals, assists = assists + excluded.assists,
        minutes_played = minutes_played + excluded.minutes_played,
        yellow_cards = yellow_cards + excluded.yellow_cards, red_cards = red_cards + excluded.red_cards,
        games_played = games_played + excluded.games_played
    `);

    files.forEach(file => {
        const filePath = path.join(dataDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const contentHash = crypto.createHash('md5').update(fileContent).digest('hex');
        
        const exists = db.prepare('SELECT 1 FROM processed_files WHERE filename = ? AND content_hash = ?').get(file, contentHash);
        if (exists) return;

        try {
            const game = parseGameFile(filePath);
            
            [game.teamA, game.teamB].forEach(team => {
                let pts=0, wReg=0, wOt=0, lReg=0, lOt=0;
                const win = team.score > team.opponentScore;
                
                if (win) {
                    if (game.isOvertime) { pts=3; wOt=1; } else { pts=5; wReg=1; }
                } else {
                    if (game.isOvertime) { pts=2; lOt=1; } else { pts=1; lReg=1; }
                }

                insertTeam.run(team.name);
                updateTeamStats.run(pts, wReg, wOt, lReg, lOt, team.score, team.opponentScore, team.name);

                team.players.forEach(p => {
                    const uniqueId = `${team.name}-${p.nr}`;
                    insertPlayer.run(uniqueId, p.name, team.name, p.nr, p.role, p.goals, p.assists, p.minutes, p.yellow_cards, p.red_cards, p.games_played);
                });
            });

            db.prepare('INSERT INTO processed_files (filename, content_hash) VALUES (?, ?)').run(file, contentHash);
            count++;
        } catch (e) {
            console.error("Error processing " + file, e);
        }
    });

    res.json({ message: `Processed ${count} new files.` });
});

// --- 2. DATA ENDPOINTS (EXISTING) ---
app.get('/api/table', (req, res) => {
    const data = db.prepare('SELECT * FROM teams ORDER BY points DESC, goals_scored DESC').all();
    res.json(data);
});

app.get('/api/scorers', (req, res) => {
    const data = db.prepare('SELECT * FROM players WHERE goals > 0 OR assists > 0 ORDER BY goals DESC, assists DESC LIMIT 10').all();
    res.json(data);
});

// --- 3. NEW EXTRA STATS ENDPOINTS (THIS IS THE "API PART") ---

// Extra Stat 1: Most Cards (Red first, then Yellow)
app.get('/api/penalties', (req, res) => {
    const data = db.prepare(`
        SELECT name, team, red_cards, yellow_cards 
        FROM players 
        WHERE red_cards > 0 OR yellow_cards > 0 
        ORDER BY red_cards DESC, yellow_cards DESC 
        LIMIT 10
    `).all();
    res.json(data);
});

// Extra Stat 2: Most Minutes (Iron Men)
app.get('/api/ironmen', (req, res) => {
    const data = db.prepare(`
        SELECT name, team, minutes_played, games_played
        FROM players 
        ORDER BY minutes_played DESC 
        LIMIT 10
    `).all();
    res.json(data);
});

app.listen(5000, () => console.log("Server running on port 5000"));