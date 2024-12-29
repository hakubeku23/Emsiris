// api/index.js

const express = require('express');
const app = express();

// Middleware to handle JSON requests
app.use(express.json());

// Define your routes
app.get('/', (req, res) => {
    res.send('Hello from Express on Vercel!');
});

app.use(express.static('public')); // Serve static files from 'public' folder

// Export the app so Vercel can use it as a serverless function
module.exports = app;
