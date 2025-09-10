import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

// Vercel specific runtime configuration. 'edge' is recommended for performance.
export const runtime = 'edge';

// Common headers for CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * Handles OPTIONS preflight requests for CORS.
 * The browser sends this request first to ensure the server allows the subsequent POST request.
 */
export async function OPTIONS(request) {
  return new Response(null, {
    status: 204, // No Content
    headers: corsHeaders,
  });
}


/**
 * This API endpoint handles POST requests to update the leaderboard data.
 * It receives the entire leaderboard object, converts it to a JSON string,
 * and overwrites the 'leaderboard.json' file in Vercel Blob storage.
 */
export async function POST(request) {
  try {
    // 1. Get the complete leaderboard data from the request body.
    const leaderboardData = await request.json();

    // Basic validation to ensure data was sent.
    if (!leaderboardData) {
      return NextResponse.json({ error: 'No leaderboard data provided.' }, { status: 400, headers: corsHeaders });
    }

    // 2. Define the blob's filename and prepare the content.
    const blobName = 'leaderboard.json';
    const blobContent = JSON.stringify(leaderboardData, null, 2); 

    // 3. Upload the new leaderboard data to Vercel Blob.
    const { url } = await put(blobName, blobContent, {
      access: 'public',
      addRandomSuffix: false, 
    });

    // 4. On success, return the public URL of the updated file with CORS headers.
    return NextResponse.json({ message: 'Leaderboard updated successfully!', url }, {
        status: 200,
        headers: corsHeaders
    });

  } catch (error) {
    // 5. Handle any potential errors during the process.
    console.error('Error updating leaderboard:', error);
    return NextResponse.json({ error: 'Failed to upload leaderboard.' }, { status: 500, headers: corsHeaders });
  }
}

