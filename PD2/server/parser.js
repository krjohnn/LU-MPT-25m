const fs = require('fs');
const path = require('path');
const { XMLParser } = require("fast-xml-parser");

// --- HELPER 1: TIME MATH ---
const parseTime = (timeStr) => {
    // Safety check: If time is missing or weird, return 0.
    if (!timeStr || typeof timeStr !== 'string') return 0;
    
    const parts = timeStr.split(':'); // Splits "60:30" into ["60", "30"]
    
    // Formula: Minutes + (Seconds / 60)
    return parseInt(parts[0]) + (parseInt(parts[1]) / 60);
};

console.log("Step 1 Loaded: Time Math is ready.");

function parseGameFile(filePath) {
    console.log("Attempting to read:", filePath);
    
    // 1. Read the file
    try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        console.log("File Read Successfully!");
        console.log("First 50 characters:", raw.substring(0, 50));
        
        // 2. Try to parse JSON
        const data = JSON.parse(raw);
        console.log("JSON Parse Successfully!");
        
        // 3. Check what keys we found
        console.log("Root Keys found:", Object.keys(data));
        
    } catch (err) {
        console.error("Error:", err.message);
    }
}

module.exports = { parseGameFile };