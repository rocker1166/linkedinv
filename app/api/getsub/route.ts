import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ message: 'User not found' }, { status: 401 });
  }

  if (!CLERK_SECRET_KEY) {
    return NextResponse.json({ error: 'Clerk secret key not found in environment variables' }, { status: 500 });
  }

  const CLERK_API_URL = `https://api.clerk.com/v1/users/${userId}/oauth_access_tokens/oauth_linkedin_oidc`;

  try {
    const clerkResponse = await fetch(CLERK_API_URL, {
      headers: {
        Authorization: `Bearer ${CLERK_SECRET_KEY}`,
      },
    });

    if (!clerkResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch data from Clerk API' }, { status: clerkResponse.status });
    }

    const clerkData = await clerkResponse.json();
    const linkedinToken = clerkData[0]?.token;

    if (!linkedinToken) {
      return NextResponse.json({ error: 'No LinkedIn token found' }, { status: 500 });
    }

    const linkedinResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${linkedinToken}`,
      },
    });

    if (!linkedinResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch data from LinkedIn API' }, { status: linkedinResponse.status });
    }

    const linkedinData = await linkedinResponse.json();

    return NextResponse.json({
      linkedinAccessToken: linkedinToken,
      linkedinUserInfo: linkedinData,
    });

  } catch (error) {
    console.error('Error fetching from APIs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
