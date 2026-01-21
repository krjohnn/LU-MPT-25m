const { parseGameFile } = require('./parser');
const path = require('path');

// Point this to one of your real data files
const file = path.join(__dirname, '../data/JSON_TestData/JSONFirstRound/futbols0.json');

console.log("Testing parser...");
parseGameFile(file);