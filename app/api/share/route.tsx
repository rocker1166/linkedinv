/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

const LINKEDIN_API_URL = 'https://api.linkedin.com/v2/ugcPosts';
const LINKEDIN_ASSET_URL = 'https://api.linkedin.com/v2/assets?action=registerUpload';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData();
    const shareType = formData.get('shareType') as string;
    const text = formData.get('text') as string;
    const url = formData.get('url') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
    const personId = process.env.LINKEDIN_PERSON_ID;

    if (!accessToken || !personId) {
      return NextResponse.json({ error: 'LinkedIn credentials not configured' }, { status: 500 });
    }

    const mediaAssets = [];
    if (shareType === 'IMAGE' || shareType === 'VIDEO') {
      const mediaFiles = [];
      for (let i = 0; formData.get(`media${i}`); i++) {
        mediaFiles.push(formData.get(`media${i}`) as File);
      }

      for (const media of mediaFiles) {
        // Register upload
        const registerResponse = await fetch(LINKEDIN_ASSET_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            registerUploadRequest: {
              recipes: [`urn:li:digitalmediaRecipe:feedshare-${shareType.toLowerCase()}`],
              owner: `urn:li:person:${personId}`,
              serviceRelationships: [{
                relationshipType: 'OWNER',
                identifier: 'urn:li:userGeneratedContent'
              }],
            },
          }),
        });

        if (!registerResponse.ok) {
          return NextResponse.json({ error: 'Failed to register media upload' }, { status: registerResponse.status });
        }

        const { value: { asset, uploadMechanism } } = await registerResponse.json();
        
        // Upload media
        const uploadResponse = await fetch(uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          body: media,
        });

        if (!uploadResponse.ok) {
          return NextResponse.json({ error: 'Failed to upload media' }, { status: uploadResponse.status });
        }

        mediaAssets.push(asset);
      }
    }

    const shareData: any = {
      author: `urn:li:person:${personId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: text
          },
          shareMediaCategory: shareType === 'ARTICLE' ? 'ARTICLE' : shareType === 'IMAGE' ? 'IMAGE' : shareType === 'VIDEO' ? 'VIDEO' : 'NONE',
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    if (shareType === 'ARTICLE' && url) {
      shareData.specificContent['com.linkedin.ugc.ShareContent'].media = [{
        status: 'READY',
        originalUrl: url,
        title: { text: title },
        description: { text: description },
      }];
    } else if ((shareType === 'IMAGE' || shareType === 'VIDEO') && mediaAssets.length > 0) {
      shareData.specificContent['com.linkedin.ugc.ShareContent'].media = mediaAssets.map(asset => ({
        status: 'READY',
        media: asset,
        title: { text: title },
        description: { text: description },
      }));
    }

    const response = await fetch(LINKEDIN_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shareData),
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