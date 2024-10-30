import { Card } from "./ui/card";
import ReactMarkdown from "react-markdown";

interface LinkedInPostPreviewProps {
  content: string;
}

export function LinkedInPostPreview({ content }: LinkedInPostPreviewProps) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Preview</h2>
      <div className="prose dark:prose-invert max-w-none">
        {content ? (
          <ReactMarkdown>{content}</ReactMarkdown>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            Your post preview will appear here after you write your content and
            click &quot;Preview with AI&quot;
          </p>
        )}
      </div>
    </Card>
  );
}