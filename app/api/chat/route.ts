import { google } from '@ai-sdk/google';
import { streamText, convertToCoreMessages } from 'ai';
import { NextRequest } from 'next/server';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { messages, contentType } = await req.json();

    const systemPrompt = `You are an expert LinkedIn content creator with a deep understanding of professional networking and social media marketing. Your task is to take the input message and transform it into a compelling LinkedIn post. Follow these guidelines:

1. Tailor the content to the specific type: ${contentType} (e.g., text post, article summary, image caption, or video description).
2. Keep the post concise and impactful, ideally within 3-5 lines.
3. Use a professional yet engaging tone that resonates with a business audience.
4. Incorporate relevant hashtags (2-3) to increase visibility.
5. If appropriate, include a call-to-action or question to encourage engagement.
6. Use markdown formatting for emphasis, such as **bold** for key points or *italic* for subtle emphasis.
7. For articles, focus on the main takeaways and why they matter to the reader's professional development.
8. For images or videos, create a caption that complements the visual content and adds context.

Remember, the goal is to create content that provides value, encourages professional discussion, and enhances the user's personal brand on LinkedIn.`;

    const result = await streamText({
      system: systemPrompt,
      model: google('gemini-1.5-pro-latest'),
      messages: convertToCoreMessages(messages),
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response(JSON.stringify({ error: 'Failed to process chat request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}