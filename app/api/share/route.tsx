import { NextRequest, NextResponse } from 'next/server';

const LINKEDIN_API_URL = 'https://api.linkedin.com/v2/ugcPosts';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { text } = await req.json();

    // In a real application, you would securely manage this token
    const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json({ error: 'LinkedIn access token not configured' }, { status: 500 });
    }

    const response = await fetch(LINKEDIN_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        author: `urn:li:person:${process.env.LINKEDIN_PERSON_ID}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: text
            },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: 'Failed to share on LinkedIn', details: errorData }, { status: response.status });
    }

    const shareId = response.headers.get('x-restli-id');
    return NextResponse.json({ success: true, shareId });

  } catch (error) {
    console.error('Error sharing on LinkedIn:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}