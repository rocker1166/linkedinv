/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AlertCircle, Camera, Link as LinkIcon, Video, MoreHorizontal, Loader2, X, Sparkles, Clock, Users, Bookmark, Wand2, FileText } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useChat } from 'ai/react'
import ReactMarkdown from 'react-markdown'
import { useTheme } from 'next-themes'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

type ShareType = 'TEXT' | 'ARTICLE' | 'IMAGE' | 'VIDEO'

interface LinkedInData {
  linkedinAccessToken: string;
  sub: string;
}

export default function LinkedInShareForm() {
  const [shareType, setShareType] = useState<ShareType>('TEXT')
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [media, setMedia] = useState<File[]>([])
  const [isSharing, setIsSharing] = useState(false)
  const [message, setMessage] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentField, setCurrentField] = useState('')
  const [isRewriting, setIsRewriting] = useState(false)
  const { theme, setTheme } = useTheme()
  
  // Post optimization options
  const [schedulePost, setSchedulePost] = useState(false)
  const [scheduleTime, setScheduleTime] = useState('')
  const [useHashtags, setUseHashtags] = useState(true)
  const [suggestedHashtags, setSuggestedHashtags] = useState<string[]>([])
  
  // For the Preview tab
  const [activeTab, setActiveTab] = useState("compose")
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  
  //for auth
  const [auth, setAuth] = useState<LinkedInData | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('LinkedIn User');
  
  const { messages, input, handleInputChange, handleSubmit: handleChatSubmit } = useChat({
    api: '/api/chat',
  })

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('')
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [message])

  // Generate preview image when media changes
  useEffect(() => {
    if (media.length > 0 && shareType === 'IMAGE') {
      const file = media[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPreviewImage(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  }, [media, shareType]);

  // Auto-suggest hashtags based on content
  useEffect(() => {
    if (text && text.length > 10 && useHashtags) {
      // This would normally call an API to get relevant hashtags
      // For now, we'll simulate with a timeout
      const timer = setTimeout(() => {
        const dummyHashtags = ['linkedin', 'networking', 'professional', 'career', 'business'];
        // Simple algorithm to extract "relevant" hashtags based on text
        const relevantHashtags = dummyHashtags.filter(tag => 
          text.toLowerCase().includes(tag) || Math.random() > 0.5
        ).slice(0, 3);
        setSuggestedHashtags(relevantHashtags);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [text, useHashtags]);

  //fetch accesstoken and person id 
  useEffect(() => {
    const fetchLinkedInData = async () => {
      try {
        const response = await fetch('/api/getsub');
        if (!response.ok) {
          throw new Error('Failed to fetch LinkedIn data');
        }
        
        const fullData = await response.json();
        
        // Extract only the needed fields
        setAuth({
          linkedinAccessToken: fullData.linkedinAccessToken,
          sub: fullData.linkedinUserInfo.sub
        });
        
        // Set username if available in the LinkedIn data
        if (fullData.linkedinUserInfo.name) {
          setUsername(fullData.linkedinUserInfo.name);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchLinkedInData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSharing(true)
    setMessage('')

    const formData = new FormData()
    formData.append('shareType', shareType)
    formData.append('text', text)
    formData.append('accessToken', auth?.linkedinAccessToken ?? '');
    formData.append('personId', auth?.sub ?? '');

    if (shareType === 'ARTICLE') {
      formData.append('url', url)
      formData.append('title', title)
      formData.append('description', description)
    } else if ((shareType === 'IMAGE' || shareType === 'VIDEO') && media.length > 0) {
      media.forEach((file, index) => {
        formData.append(`media${index}`, file)
      })
      formData.append('title', title)
      formData.append('description', description)
    }

    // Add hashtags if enabled
    if (useHashtags && suggestedHashtags.length > 0) {
      // Append hashtags to the text if they're not already included
      const hashtagString = suggestedHashtags.map(tag => `#${tag}`).join(' ');
      if (!text.includes(hashtagString)) {
        formData.append('text', `${text} ${hashtagString}`);
      }
    }

    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Successfully shared on LinkedIn!')
        setText('')
        setUrl('')
        setTitle('')
        setDescription('')
        setMedia([])
        setSuggestedHashtags([])
        // Reset to compose tab after successful share
        setActiveTab("compose")
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('An error occurred while sharing')
    } finally {
      setIsSharing(false)
    }
  }

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setMedia(prevMedia => [...prevMedia, ...files])
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const files = Array.from(e.dataTransfer.files)
    setMedia(prevMedia => [...prevMedia, ...files])
  }

  const removeMedia = (index: number) => {
    setMedia(prevMedia => prevMedia.filter((_, i) => i !== index))
  }

  const handleAIRewrite = async (fieldType: string, content: string) => {
    setCurrentField(fieldType)
    setIsRewriting(true)
    handleInputChange({ target: { value: `Rewrite the following ${fieldType} for a high-quality LinkedIn post. Make it engaging, professional, and optimized for the platform: "${content}"` } } as any)
    await handleChatSubmit(new Event('submit') as any)
    setIsDialogOpen(true)
    setIsRewriting(false)
  }

  const acceptSuggestion = () => {
    const suggestion = messages[messages.length - 1]?.content
    if (suggestion) {
      switch (currentField) {
        case 'text':
          setText(suggestion)
          break
        case 'title':
          setTitle(suggestion)
          break
        case 'description':
          setDescription(suggestion)
          break
      }
    }
    setIsDialogOpen(false)
  }
  
  const generateAIContent = async () => {
    setIsRewriting(true);
    let prompt = "Generate a professional LinkedIn post";
    
    if (shareType === 'ARTICLE' && url) {
      prompt += ` about this article: ${url}`;
    } else if (shareType === 'IMAGE' && media.length > 0) {
      prompt += ` to accompany an image about ${title || 'professional content'}`;
    } else if (shareType === 'VIDEO' && media.length > 0) {
      prompt += ` to accompany a video about ${title || 'professional content'}`;
    }
    
    handleInputChange({ target: { value: prompt } } as any);
    await handleChatSubmit(new Event('submit') as any);
    setIsDialogOpen(true);
    setCurrentField('text');
    setIsRewriting(false);
  }

  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="flex flex-row justify-between items-center border-b">
        <CardTitle className="text-xl font-bold">Share on LinkedIn</CardTitle>
        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!text}
                  onClick={() => setActiveTab(activeTab === "compose" ? "preview" : "compose")}
                >
                  {activeTab === "compose" ? "Preview" : "Edit"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{activeTab === "compose" ? "Preview your post" : "Return to editing"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateAIContent}
                  disabled={isRewriting}
                >
                  {isRewriting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4 mr-1" />}
                  AI Generate
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Generate an AI-optimized post</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      
      {activeTab === "compose" ? (
        <form onSubmit={handleSubmit}>
          <CardContent className="pt-6">
            <div className="grid w-full items-center gap-6">
              <div className="flex flex-wrap gap-4 items-center">
                <Label htmlFor="shareType" className="text-base font-medium">Post Type:</Label>
                <RadioGroup id="shareType" value={shareType} onValueChange={(value) => setShareType(value as ShareType)} className="flex flex-wrap gap-2">
                  {[
                    { value: 'TEXT', label: 'Text', icon: <FileText className="h-4 w-4" /> },
                    { value: 'ARTICLE', label: 'Article', icon: <LinkIcon className="h-4 w-4" /> },
                    { value: 'IMAGE', label: 'Image', icon: <Camera className="h-4 w-4" /> },
                    { value: 'VIDEO', label: 'Video', icon: <Video className="h-4 w-4" /> }
                  ].map((type) => (
                    <div key={type.value} className="flex items-center">
                      <RadioGroupItem value={type.value} id={`shareType${type.value}`} className="peer sr-only" />
                      <Label
                        htmlFor={`shareType${type.value}`}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 peer-checked:border-blue-500 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900 peer-checked:text-blue-600 dark:peer-checked:text-blue-300 transition-colors"
                      >
                        {type.icon}
                        <span>{type.label}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="text" className="text-base font-medium flex items-center gap-1.5">
                  Post Content
                  {isRewriting ? 
                    <Loader2 className="h-4 w-4 animate-spin" /> : 
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleAIRewrite('text', text)}
                          >
                            <Sparkles className="h-4 w-4 text-amber-500" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Enhance with AI</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  }
                </Label>
                
                <Textarea
                  id="text"
                  placeholder="What do you want to share with your network? Make it engaging and professional."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  required
                  className={`min-h-[120px] ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : ''}`}
                />
                
                {useHashtags && suggestedHashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-sm text-gray-500">Suggested hashtags:</span>
                    {suggestedHashtags.map(tag => (
                      <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              {shareType === 'ARTICLE' && (
                <>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="url" className="text-base font-medium">Article URL</Label>
                    <div className="relative">
                      <Input
                        id="url"
                        type="url"
                        placeholder="https://example.com/article"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        required
                        className={`pl-10 ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : ''}`}
                      />
                      <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="title" className="text-base font-medium flex items-center gap-1.5">
                        Article Title
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleAIRewrite('title', title)}
                                disabled={isRewriting}
                              >
                                <Sparkles className="h-4 w-4 text-amber-500" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Optimize title with AI</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                      <Input
                        id="title"
                        placeholder="Enter a catchy and informative title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : ''}
                      />
                    </div>
                    
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="description" className="text-base font-medium flex items-center gap-1.5">
                        Article Description
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleAIRewrite('description', description)}
                                disabled={isRewriting}
                              >
                                <Sparkles className="h-4 w-4 text-amber-500" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Optimize description with AI</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Write a compelling description to encourage clicks"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className={`min-h-[80px] ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : ''}`}
                      />
                    </div>
                  </div>
                </>
              )}
              
              {(shareType === 'IMAGE' || shareType === 'VIDEO') && (
                <>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="media" className="text-base font-medium">Upload {shareType === 'IMAGE' ? 'Images' : 'Videos'}</Label>
                    <div
                      className={`border-2 border-dashed rounded-md p-6 ${
                        theme === 'dark' ? 'border-gray-700 bg-gray-800/30' : 'border-gray-300 bg-gray-50/50'
                      } transition-colors hover:bg-gray-100 dark:hover:bg-gray-800`}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      <Input
                        id="media"
                        type="file"
                        accept={shareType === 'IMAGE' ? "image/*" : "video/*"}
                        onChange={handleMediaUpload}
                        className="hidden"
                        multiple
                      />
                      <Label htmlFor="media" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                        {shareType === 'IMAGE' ? (
                          <Camera className="w-10 h-10 text-gray-400" />
                        ) : (
                          <Video className="w-10 h-10 text-gray-400" />
                        )}
                        <span className="text-center text-gray-500">
                          Drag and drop or click to select {shareType === 'IMAGE' ? 'images' : 'videos'}
                        </span>
                        <span className="text-xs text-gray-400">
                          Maximum file size: 100MB
                        </span>
                      </Label>
                    </div>
                    {media.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="text-sm text-gray-500 mb-1">
                          {media.length} {media.length === 1 ? 
                            (shareType === 'IMAGE' ? 'image' : 'video') : 
                            (shareType === 'IMAGE' ? 'images' : 'videos')
                          } selected
                        </div>
                        <ScrollArea className="h-24 rounded border">
                          <div className="p-2 space-y-2">
                            {media.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                <div className="flex items-center gap-2 overflow-hidden">
                                  {shareType === 'IMAGE' && (
                                    <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                      <Camera className="h-4 w-4 text-gray-500" />
                                    </div>
                                  )}
                                  <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeMedia(index)}
                                  className="h-7 w-7 rounded-full hover:bg-red-50 dark:hover:bg-red-900 hover:text-red-500"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="mediaTitle" className="text-base font-medium flex items-center gap-1.5">
                        {shareType === 'IMAGE' ? 'Image' : 'Video'} Title
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleAIRewrite('title', title)}
                                disabled={isRewriting}
                              >
                                <Sparkles className="h-4 w-4 text-amber-500" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Generate title with AI</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                      <Input
                        id="mediaTitle"
                        placeholder={`Enter an attention-grabbing ${shareType === 'IMAGE' ? 'image' : 'video'} title`}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : ''}
                      />
                    </div>
                    
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="mediaDescription" className="text-base font-medium flex items-center gap-1.5">
                        {shareType === 'IMAGE' ? 'Image' : 'Video'} Description
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleAIRewrite('description', description)}
                                disabled={isRewriting}
                              >
                                <Sparkles className="h-4 w-4 text-amber-500" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Generate description with AI</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                      <Textarea
                        id="mediaDescription"
                        placeholder={`Describe your ${shareType === 'IMAGE' ? 'image' : 'video'} and why it's relevant to your audience`}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className={`min-h-[80px] ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : ''}`}
                      />
                    </div>
                  </div>
                </>
              )}
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex flex-col space-y-1">
                    <Label htmlFor="schedule" className="text-base font-medium">Schedule Post</Label>
                    <span className="text-sm text-gray-500">Publish your post at a later time</span>
                  </div>
                  <Switch
                    id="schedule"
                    checked={schedulePost}
                    onCheckedChange={setSchedulePost}
                  />
                </div>
                
                {schedulePost && (
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="scheduleTime" className="text-base font-medium">
                      Schedule Time
                    </Label>
                    <Input
                      id="scheduleTime"
                      type="datetime-local"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className={theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : ''}
                    />
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="hashtags" className="text-base font-medium">Add Hashtags</Label>
                  <span className="text-sm text-gray-500">Auto-generate relevant hashtags for better reach</span>
                </div>
                <Switch
                  id="hashtags"
                  checked={useHashtags}
                  onCheckedChange={setUseHashtags}
                />
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between items-center border-t pt-4 pb-4">
            <div>
              {message && (
                <Alert variant={message.includes('Error') ? "destructive" : "default"} className="p-2">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}
            </div>
            
            <Button type="submit" disabled={isSharing} className="min-w-[120px]">
              {isSharing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSharing ? 'Sharing...' : 'Share on LinkedIn'}
            </Button>
          </CardFooter>
        </form>
      ) : (
        // Preview Tab Content
        <CardContent className="pt-6">
          <div className="rounded-lg border shadow-sm overflow-hidden">
            <div className="bg-white dark:bg-gray-900 p-4">
              <div className="flex items-start space-x-4">
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src="" alt={username} />
                  <AvatarFallback>{username.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{username}</h3>
                      <p className="text-sm text-gray-500">
                        {schedulePost && scheduleTime ? new Date(scheduleTime).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        }) : formattedDate}
                      </p>
                    </div>
                    {schedulePost && scheduleTime && (
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        Scheduled
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="whitespace-pre-wrap">
                      {text}
                      {useHashtags && suggestedHashtags.length > 0 && (
                        <p className="text-blue-600 dark:text-blue-400 mt-1">
                          {suggestedHashtags.map(tag => `#${tag}`).join(' ')}
                        </p>
                      )}
                    </div>
                    
                    {shareType === 'ARTICLE' && url && (
                      <div className="rounded border overflow-hidden mt-2">
                        <div className="h-40 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <LinkIcon className="h-10 w-10 text-gray-400" />
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800">
                          <h4 className="font-medium text-sm">{title || 'Article Title'}</h4>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{description || 'Article description will appear here...'}</p>
                          <p className="text-xs text-gray-400 mt-1 truncate">{url}</p>
                        </div>
                      </div>
                    )}
                    
                    {shareType === 'IMAGE' && previewImage && (
                      <div className="rounded overflow-hidden mt-2">
                        <img src={previewImage} alt={title || "Preview"} className="w-full max-h-[300px] object-cover" />
                        {(title || description) && (
                          <div className="p-3 bg-gray-50 dark:bg-gray-800">
                            {title && <h4 className="font-medium text-sm">{title}</h4>}
                            {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {shareType === 'VIDEO' && media.length > 0 && (
                      <div className="rounded overflow-hidden mt-2 border">
                        <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <Video className="h-12 w-12 text-gray-400" />
                          <p className="text-sm text-gray-500 absolute">Video preview</p>
                        </div>
                        {(title || description) && (
                          <div className="p-3 bg-gray-50 dark:bg-gray-800">
                            {title && <h4 className="font-medium text-sm">{title}</h4>}
                            {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-3 border-t">
                <div className="flex space-x-4 text-gray-500 text-sm">
                  <button className="flex items-center gap-1 hover:text-blue-600">
                    <Sparkles className="h-4 w-4" />
                    <span>Like</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-blue-600">
                    <Users className="h-4 w-4" />
                    <span>Comment</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-blue-600">
                    <Bookmark className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <Button 
              type="button" 
              className="min-w-[120px]"
              onClick={() => setActiveTab("compose")}
            >
              Return to Editor
            </Button>
          </div>
        </CardContent>
      )}
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              AI Suggestion
            </DialogTitle>
            <DialogDescription>
              Here's a suggested {currentField} optimized for LinkedIn. Would you like to use this?
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-md max-h-[300px] border">
            <ReactMarkdown className="prose dark:prose-invert prose-sm max-w-none">
              {messages[messages.length - 1]?.content || ''}
            </ReactMarkdown>
          </ScrollArea>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={acceptSuggestion} className="gap-1">
              <Sparkles className="h-4 w-4" />
              Accept Suggestion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}








