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