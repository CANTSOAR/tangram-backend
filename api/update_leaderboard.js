import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

// Vercel specific runtime configuration. 'edge' is recommended for performance.
export const runtime = 'edge';

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
      return NextResponse.json({ error: 'No leaderboard data provided.' }, { status: 400 });
    }

    // 2. Define the blob's filename and prepare the content.
    // We stringify the JSON object to store it as a text file.
    const blobName = 'leaderboard.json';
    const blobContent = JSON.stringify(leaderboardData, null, 2); // Using null, 2 for pretty-printing

    // 3. Upload the new leaderboard data to Vercel Blob.
    const { url } = await put(blobName, blobContent, {
      access: 'public', // The file needs to be public so your game can fetch it directly.
      addRandomSuffix: false, // CRITICAL: This ensures the URL is stable and predictable.
    });

    // 4. On success, return the public URL of the updated file.
    return NextResponse.json({ message: 'Leaderboard updated successfully!', url });

  } catch (error) {
    // 5. Handle any potential errors during the process.
    console.error('Error updating leaderboard:', error);
    return NextResponse.json({ error: 'Failed to upload leaderboard.' }, { status: 500 });
  }
}

/**
 * Optional: You can add a GET handler to this same file if you want
 * to proxy requests instead of fetching the blob URL directly, but for
 * this use case, fetching the public URL from the frontend is simpler.
 */
export async function GET(request) {
    return NextResponse.json({ message: 'This endpoint is for POST requests to update the leaderboard.' });
}
