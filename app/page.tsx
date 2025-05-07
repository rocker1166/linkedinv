'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { ArrowRight, Share2, FileText, Image, Video, Clock } from "lucide-react";

export default function Landing() {
  const router = useRouter();
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  const handleGetStarted = () => {
    router.push("/user");
  };

  const features = [
    { 
      id: "text-posts", 
      title: "Text Posts", 
      description: "Share your thoughts and insights with your professional network.",
      icon: <FileText className="h-6 w-6 text-blue-500" />,
    },
    { 
      id: "article-sharing", 
      title: "Article Sharing", 
      description: "Share articles with custom titles and descriptions to engage your audience.",
      icon: <Share2 className="h-6 w-6 text-green-500" />,
    },
    { 
      id: "image-support", 
      title: "Image Sharing", 
      description: "Upload and share images to make your posts more engaging.",
      icon: <Image className="h-6 w-6 text-purple-500" />,
    },
    { 
      id: "video-support", 
      title: "Video Content", 
      description: "Share video content to demonstrate your expertise.",
      icon: <Video className="h-6 w-6 text-red-500" />,
    },
    { 
      id: "ai-assistance", 
      title: "AI Content Enhancement", 
      description: "AI-powered tools to optimize your LinkedIn content.",
      icon: <Clock className="h-6 w-6 text-amber-500" />,
    }
  ];

  return (
    <main className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center py-20 px-4 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-3xl text-center">
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Enhance Your LinkedIn Presence
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Share professional updates, articles, and media seamlessly on LinkedIn with advanced content optimization.
          </p>
          <Button 
            onClick={handleGetStarted} 
            className="px-8 py-6 text-lg font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-300"
          >
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card 
                key={feature.id}
                className={`border-2 transition-all duration-300 ${
                  hoveredFeature === feature.id 
                    ? "border-blue-500 shadow-lg transform -translate-y-1" 
                    : "border-gray-200 dark:border-gray-700"
                }`}
                onMouseEnter={() => setHoveredFeature(feature.id)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  {feature.icon}
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full h-12 w-12 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-xl">1</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Sign in with your account</h3>
                <p className="text-gray-600 dark:text-gray-300">Connect your LinkedIn profile to get started.</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full h-12 w-12 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-xl">2</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Create your content</h3>
                <p className="text-gray-600 dark:text-gray-300">Choose your post type - text, article, image, or video.</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full h-12 w-12 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-xl">3</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Enhance with AI</h3>
                <p className="text-gray-600 dark:text-gray-300">Use our AI tools to optimize your content for maximum engagement.</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full h-12 w-12 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-xl">4</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Share on LinkedIn</h3>
                <p className="text-gray-600 dark:text-gray-300">Publish your optimized content directly to your LinkedIn profile.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-blue-600 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Elevate Your LinkedIn Presence?</h2>
          <p className="text-xl mb-8">Start creating engagement-optimized LinkedIn content today.</p>
          <Button 
            onClick={handleGetStarted} 
            className="px-8 py-6 text-lg font-semibold bg-white text-blue-600 hover:bg-gray-100 transition-all duration-300"
          >
            Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-600 dark:text-gray-300">© {new Date().getFullYear()} LinkedInV. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}