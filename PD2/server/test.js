const { parseGameFile } = require('./parser');
const path = require('path');

// Target the first file you uploaded
const file = path.join(__dirname, '../data/JSON_TestData/JSONFirstRound/futbols0.json');

try {
    console.log("Testing JSON Parser on: futbols0.json");
    const game = parseGameFile(file);
    
    console.log(`\nMatch Result: ${game.teamA.name} (${game.teamA.score}) vs ${game.teamB.name} (${game.teamB.score})`);
    if(game.isOvertime) console.log("!! Game went to Overtime !!");

    // Print Player Stats for Team A
    console.log(`\n--- Stats: ${game.teamA.name} ---`);
    console.table(game.teamA.players.map(p => ({
        Nr: p.nr,
        Name: p.name,
        Min: p.minutes,
        G: p.goals,
        A: p.assists
    })));

    // Print Player Stats for Team B
    console.log(`\n--- Stats: ${game.teamB.name} ---`);
    console.table(game.teamB.players.map(p => ({
        Nr: p.nr,
        Name: p.name,
        Min: p.minutes,
        G: p.goals,
        A: p.assists
    })));

} catch (e) {
    console.error("CRASH:", e);
}