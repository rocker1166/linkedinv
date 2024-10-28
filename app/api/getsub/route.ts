import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const CLERK_ID = process.env.CLERK_SECRET_KEY;

export async function GET() {
  // Get the authenticated user's ID
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ message: 'User not found' }, { status: 401 });
  }

  // Set the Clerk API endpoint for the authenticated user
  const CLERK_API_URL = `https://api.clerk.com/v1/users/${userId}/oauth_access_tokens/oauth_linkedin_oidc`;

  // Check if the Clerk token is available
  if (!CLERK_ID) {
    return NextResponse.json({ error: 'Clerk ID not found in environment variables' }, { status: 500 });
  }

  try {
    // Fetch data from the Clerk API
    const clerkResponse = await fetch(CLERK_API_URL, {
      headers: {
        Authorization: `Bearer ${CLERK_ID}`,
      },
    });

    if (!clerkResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch data from Clerk API' }, { status: clerkResponse.status });
    }

    // Parse the response from Clerk and extract the token
    const clerkData = await clerkResponse.json();
    const linkedinToken = clerkData[0]?.token;

    if (!linkedinToken) {
      return NextResponse.json({ error: 'No LinkedIn token found' }, { status: 500 });
    }

    // Now make a request to LinkedIn's API using the fetched token
    const linkedinResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${linkedinToken}`,
      },
    });

    if (!linkedinResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch data from LinkedIn API' }, { status: linkedinResponse.status });
    }

    // Parse the LinkedIn response
    const linkedinData = await linkedinResponse.json();

    // Return both the LinkedIn access token and user info
    return NextResponse.json({
      linkedinAccessToken: linkedinToken,
      linkedinUserInfo: linkedinData,
    });

  } catch (error) {
    console.error('Error fetching from APIs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
