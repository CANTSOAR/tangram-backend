// api/index.js

import express from 'express';
import { kv } from '@vercel/kv';
import cors from 'cors';

const app = express();

// Middlewares
app.use(express.json()); // To parse JSON bodies
app.use(cors()); // To allow requests from your GitHub Pages site

const LEADERBOARD_KEY = 'leaderboardData';

// --- API ENDPOINTS ---

// GET Endpoint: Fetch the leaderboard data
app.get('/api', async (req, res) => {
  try {
    // Retrieve data from Vercel KV storage.
    const leaderboardData = await kv.get(LEADERBOARD_KEY);
    // If no data exists yet, return an empty array.
    res.status(200).json(leaderboardData || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard data.' });
  }
});

// POST Endpoint: Add or update a score
app.post('/api', async (req, res) => {
  try {
    const { name, score } = req.body;

    if (!name || score === undefined) {
      return res.status(400).json({ error: 'Name and score are required.' });
    }

    // Get the current leaderboard
    let leaderboard = (await kv.get(LEADERBOARD_KEY)) || [];

    // Add the new score
    leaderboard.push({ name, score, timestamp: new Date().toISOString() });

    // Sort the leaderboard by score (descending)
    leaderboard.sort((a, b) => b.score - a.score);

    // Optional: Keep only the top 10 scores
    leaderboard = leaderboard.slice(0, 10);

    // Save the updated leaderboard back to Vercel KV
    await kv.set(LEADERBOARD_KEY, leaderboard);

    res.status(200).json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update leaderboard.' });
  }
});

// Export the app for Vercel
export default app;