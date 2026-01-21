const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors()); // Allow React (Port 3000) to talk to us

// 1. A simple test endpoint
app.get('/', (req, res) => {
    res.json({ message: "Hello World! The Football Backend is ALIVE." });
});

// 2. Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
