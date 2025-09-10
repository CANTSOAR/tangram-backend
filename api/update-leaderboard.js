import { put } from '@vercel/blob';

/**
 * This is a Vercel Serverless Function that uses the standard Node.js runtime.
 * @param {import('http').IncomingMessage} request
 * @param {import('http').ServerResponse} response
 */
export default async function handler(request, response) {
  // --- CORS HEADERS ---
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle the browser's preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    response.status(204).end();
    return;
  }

  // Only handle POST requests for updating the leaderboard
  if (request.method === 'POST') {
    try {
      const leaderboardData = request.body;

      if (!leaderboardData) {
        response.status(400).json({ error: 'No leaderboard data provided.' });
        return;
      }

      const blobName = 'leaderboard.json';
      const blobContent = JSON.stringify(leaderboardData, null, 2);

      // Upload the file to Vercel Blob
      const { url } = await put(blobName, blobContent, {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true, // This is the fix that allows overwriting the leaderboard
      });

      // Send a success response
      response.status(200).json({ message: 'Leaderboard updated successfully!', url });

    } catch (error) {
      console.error('Error in API function:', error);
      response.status(500).json({ error: 'Failed to upload leaderboard.' });
    }
  } else {
    response.setHeader('Allow', ['POST', 'OPTIONS']);
    response.status(405).end(`Method ${request.method} Not Allowed`);
  }
}

