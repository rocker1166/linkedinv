/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useChat } from 'ai/react';
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Textarea } from "./ui/textarea";
import { ImageIcon, LinkIcon, MessageSquare, VideoIcon } from "lucide-react";
import { toast } from "sonner";

interface LinkedInPostFormProps {
  onPreview: (content: string) => void;
}

interface LinkedInCredentials {
  linkedinAccessToken: string;
  linkedinUserInfo: { sub: string };
}

export function LinkedInPostForm({ onPreview }: LinkedInPostFormProps) {
  const [shareType, setShareType] = useState("TEXT");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subData, setSubData] = useState<LinkedInCredentials | null>(null);

  const { input, handleInputChange, handleSubmit, messages } = useChat({
    api: "/api/chat",
    body: {
      contentType: shareType,
    },
    onResponse: (response) => {
      if (response.ok) {
        onPreview(input);
      }
    },
  });

  useEffect(() => {
    async function fetchLinkedInCredentials() {
      try {
        const response = await fetch("/api/getsub");
        const data = await response.json();
        setSubData(data);
      } catch (error) {
        console.error("Error fetching LinkedIn credentials:", error);
        toast.error("Failed to load LinkedIn credentials.");
      }
    }

    // Fetch LinkedIn credentials only once
    if (!subData) {
      fetchLinkedInCredentials();
    }
  }, [subData]);

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!subData || !subData.linkedinAccessToken || !subData.linkedinUserInfo) {
        toast.error("LinkedIn authentication required");
        return;
      }



      // Prepare form data
      const formData = new FormData();
      formData.append("shareType", shareType);
      formData.append("text", messages[messages.length - 1]?.content || input);
      formData.append("url", url);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("accessToken", subData.linkedinAccessToken);
      formData.append("personId", subData.linkedinUserInfo.sub);

      // Append media files if any
      media.forEach((file, index) => {
        formData.append(`media${index}`, file);
      });

      // Share to LinkedIn
      const shareResponse = await fetch("/api/share", {
        method: "POST",
        body: formData,
      });

      if (!shareResponse.ok) {
        throw new Error("Failed to share post");
      }

      toast.success("Post shared successfully on LinkedIn!");

      // Reset form
      setUrl("");
      setTitle("");
      setDescription("");
      setMedia([]);
      
    } catch (error) {
      toast.error("Error sharing post");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleShare} className="space-y-6">
        <div className="space-y-4">
          <Label>Post Type</Label>
          <RadioGroup
            defaultValue="TEXT"
            onValueChange={setShareType}
            className="grid grid-cols-2 gap-4 sm:grid-cols-4"
          >
            <Label
              htmlFor="text"
              className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${
                shareType === "TEXT"
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-800"
              }`}
            >
              <RadioGroupItem value="TEXT" id="text" className="sr-only" />
              <MessageSquare className="mb-2 h-6 w-6" />
              <span>Text</span>
            </Label>
            <Label
              htmlFor="article"
              className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${
                shareType === "ARTICLE"
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-800"
              }`}
            >
              <RadioGroupItem value="ARTICLE" id="article" className="sr-only" />
              <LinkIcon className="mb-2 h-6 w-6" />
              <span>Article</span>
            </Label>
            <Label
              htmlFor="image"
              className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${
                shareType === "IMAGE"
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-800"
              }`}
            >
              <RadioGroupItem value="IMAGE" id="image" className="sr-only" />
              <ImageIcon className="mb-2 h-6 w-6" />
              <span>Image</span>
            </Label>
            <Label
              htmlFor="video"
              className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${
                shareType === "VIDEO"
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-800"
              }`}
            >
              <RadioGroupItem value="VIDEO" id="video" className="sr-only" />
              <VideoIcon className="mb-2 h-6 w-6" />
              <span>Video</span>
            </Label>
          </RadioGroup>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="content">Post Content</Label>
            <Textarea
              id="content"
              value={input}
              onChange={handleInputChange}
              placeholder="Write your post content..."
              className="mt-1.5 min-h-[120px]"
            />
          </div>

          {shareType === "ARTICLE" && (
            <>
              <div>
                <Label htmlFor="url">Article URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Article title..."
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Article description..."
                  className="mt-1.5"
                />
              </div>
            </>
          )}

          {(shareType === "IMAGE" || shareType === "VIDEO") && (
            <div>
              <Label htmlFor="media">Upload {shareType.toLowerCase()}</Label>
              <Input
                id="media"
                type="file"
                accept={
                  shareType === "IMAGE"
                    ? "image/*"
                    : "video/*"
                }
                multiple={shareType === "IMAGE"}
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setMedia(files);
                }}
                className="mt-1.5"
              />
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleSubmit(e);
            }}
          >
            Preview with AI
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#0A66C2] hover:bg-[#004182]"
          >
            {isSubmitting ? "Sharing..." : "Share on LinkedIn"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
