import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

// Vercel specific runtime configuration. 'edge' is recommended for performance.
export const runtime = 'edge';

// --- CORS HEADERS ---
// These headers are essential to allow your game to communicate with this API.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allows any origin to access the API
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', // Specifies allowed methods
  'Access-Control-Allow-Headers': 'Content-Type', // Specifies allowed headers
};

/**
 * Handles OPTIONS preflight requests for CORS.
 * Browsers send this automatically before a POST request to a different domain.
 */
export async function OPTIONS(request) {
  // Respond with just the CORS headers to confirm the connection is allowed.
  return new Response(null, {
    status: 204, // No Content
    headers: corsHeaders,
  });
}


/**
 * This API endpoint handles POST requests to update the leaderboard data.
 */
export async function POST(request) {
  try {
    const leaderboardData = await request.json();

    if (!leaderboardData) {
      return NextResponse.json({ error: 'No leaderboard data provided.' }, { status: 400, headers: corsHeaders });
    }

    const blobName = 'leaderboard.json';
    const blobContent = JSON.stringify(leaderboardData, null, 2); 

    const { url } = await put(blobName, blobContent, {
      access: 'public',
      addRandomSuffix: false, 
    });

    // On success, return a success message and include the CORS headers.
    return NextResponse.json({ message: 'Leaderboard updated successfully!', url }, {
        status: 200,
        headers: corsHeaders
    });

  } catch (error) {
    console.error('Error updating leaderboard:', error);
    // On failure, return an error message and include the CORS headers.
    return NextResponse.json({ error: 'Failed to upload leaderboard.' }, { status: 500, headers: corsHeaders });
  }
}

