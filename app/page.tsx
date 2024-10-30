"use client";

import { LinkedInPostForm } from "./components/linkedin-post-form";
import { LinkedInPostPreview } from "./components/linkedin-post-preview";
import { useState } from "react";
import { Share2Icon } from "lucide-react";

export default function Home() {
  const [preview, setPreview] = useState("");

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Share2Icon className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              LinkedIn Post Creator
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Create engaging LinkedIn posts with AI assistance. Share text, articles,
            images, or videos directly to your professional network.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          <LinkedInPostForm onPreview={setPreview} />
          <LinkedInPostPreview content={preview} />
        </div>
      </div>
    </main>
  );
}