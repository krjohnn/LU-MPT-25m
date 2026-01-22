const fs = require('fs');

// --- HELPER: Time conversions ---
// Converts "60:30" -> 60.5 minutes because we need it for calculations (sorting, comparisons, etc.)
const parseTime = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return 0;
    const parts = timeStr.split(':');
    return parseInt(parts[0]) + (parseInt(parts[1]) / 60);
};

// --- HELPER: Fixing Data Structure Issues ---
const asArray = (val) => {
    if (!val) return [];
    if (typeof val === 'string' && val.trim() === '') return []; // Empty string case
    return Array.isArray(val) ? val : [val];
};

function parseGameFile(filePath) {
    console.log(`\nParsing: ${filePath}`);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const root = JSON.parse(raw).Spele;

    // console.log(root);

    // DETERMINE GAME DURATION (Check for Overtime)
    let gameEndTime = 60.0;
    const teamsRaw = asArray(root.Komand);
    
    const allGoals = [];
    teamsRaw.forEach(t => {
        // "Varti" logic: Check inside VG first, then fallback
        const goals = asArray(t.Varti?.VG || t.Varti); 
        goals.forEach(g => allGoals.push(parseTime(g.Laiks)));
    });

    const otGoals = allGoals.filter(t => t > 60.0);
    if (otGoals.length > 0) {
        gameEndTime = Math.max(...otGoals);
        console.log(`Overtime Detected! Game ended at ${gameEndTime.toFixed(2)} mins`);
    }

    // PLAYER STATS
    const teams = teamsRaw.map(tRaw => {
        const name = tRaw.Nosaukums;
        const goals = asArray(tRaw.Varti?.VG || tRaw.Varti); 
        const subs = asArray(tRaw.Mainas?.Maina || tRaw.Mainas); 
        const cards = asArray(tRaw.Sodi?.Sods || tRaw.Sodi);
        
        // Starters (Pamatsastavs) - Get list of IDs
        const starters = asArray(tRaw.Pamatsastavs?.Speletajs).map(s => parseInt(s.Nr));
        const roster = asArray(tRaw.Speletaji?.Speletajs);

        const players = roster.map(p => {
            const nr = parseInt(p.Nr);
            
            // A. Start Time
            let startTime = starters.includes(nr) ? 0.0 : -1;
            let endTime = -1;

            // B. Sub IN
            const subIn = subs.find(s => parseInt(s.Nr2) === nr);
            if (subIn) startTime = parseTime(subIn.Laiks);

            // C. Sub OUT
            const subOut = subs.find(s => parseInt(s.Nr1) === nr);
            if (subOut) endTime = parseTime(subOut.Laiks);

            // D. Red Card (Ejection)
            const myCards = cards.filter(c => parseInt(c.Nr) === nr);
            if (myCards.length >= 2) {
                const ejectionTime = parseTime(myCards[1].Laiks);
                if (endTime === -1 || ejectionTime < endTime) endTime = ejectionTime;
            }

            // E. Duration Math
            let minutes = 0;
            if (startTime !== -1) {
                const actualEnd = (endTime === -1) ? gameEndTime : endTime;
                minutes = Math.max(0, actualEnd - startTime);
            }

            // F. Assists Calculation
            // Look through ALL goals this team scored.
            // If this player is listed in the 'P' (Passers) array of that goal, +1 assist.
            const assistsCount = goals.filter(g => {
                const passers = asArray(g.P);
                return passers.some(passer => parseInt(passer.Nr) === nr);
            }).length;

            return {
                nr: nr,
                name: `${p.Vards} ${p.Uzvards}`,
                role: p.Loma,
                minutes: Math.round(minutes),
                goals: goals.filter(g => parseInt(g.Nr) === nr).length,
                assists: assistsCount,
                yellow_cards: myCards.length >= 1 ? 1 : 0,
                red_cards: myCards.length >= 2 ? 1 : 0,
                games_played: minutes > 0 ? 1 : 0
            };
        });

        // Clean up output for the API (remove players with 0 stats if you want, or keep all)
        return {
            name: name,
            score: goals.length,
            players: players
        };
    });

    return {
        teamA: { ...teams[0], opponentScore: teams[1].score },
        teamB: { ...teams[1], opponentScore: teams[0].score },
        isOvertime: gameEndTime > 60.0
    };
}

module.exports = { parseGameFile };