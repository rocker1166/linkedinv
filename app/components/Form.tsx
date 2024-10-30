/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AlertCircle, Camera, Link as LinkIcon, Video, MoreHorizontal, Loader2, X } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useChat } from 'ai/react'
import ReactMarkdown from 'react-markdown'
import { useTheme } from 'next-themes'

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
  
  //for auth
  const [auth, setAuth] = useState<LinkedInData | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  const { messages, input, handleInputChange, handleSubmit: handleChatSubmit } = useChat({
    api: '/api/chat',
  })

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [message])

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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchLinkedInData();
  }, [auth]);




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

  return (
    <div >
      <Card className={`w-full max-w-2xl`}>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-2xl font-bold">Share on LinkedIn</CardTitle>
         
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="grid w-full items-center gap-6">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="shareType" className="text-lg font-semibold">Share Type</Label>
                <RadioGroup id="shareType" value={shareType} onValueChange={(value) => setShareType(value as ShareType)} className="flex flex-wrap gap-4">
                  {['TEXT', 'ARTICLE', 'IMAGE', 'VIDEO'].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <RadioGroupItem value={type} id={`shareType${type}`} />
                      <Label htmlFor={`shareType${type}`}>{type.charAt(0) + type.slice(1).toLowerCase()}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="text" className="text-lg font-semibold">Share Text</Label>
                <div className="relative">
                  <Textarea
                    id="text"
                    placeholder="What do you want to share? Make it engaging and professional."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    required
                    className={`pr-10 min-h-[100px] ${theme === 'dark' ? 'bg-gray-700 text-white' : ''}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={() => handleAIRewrite('text', text)}
                    disabled={isRewriting}
                  >
                    {isRewriting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              {shareType === 'ARTICLE' && (
                <>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="url" className="text-lg font-semibold">Article URL</Label>
                    <div className="relative">
                      <Input
                        id="url"
                        type="url"
                        placeholder="https://example.com/article"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        required
                        className={`pl-10 ${theme === 'dark' ? 'bg-gray-700 text-white' : ''}`}
                      />
                      <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="title" className="text-lg font-semibold">Article Title</Label>
                    <div className="relative">
                      <Input
                        id="title"
                        placeholder="Enter a catchy and informative title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={theme === 'dark' ? 'bg-gray-700 text-white' : ''}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        onClick={() => handleAIRewrite('title', title)}
                        disabled={isRewriting}
                      >
                        {isRewriting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="description" className="text-lg font-semibold">Article Description</Label>
                    <div className="relative">
                      <Textarea
                        id="description"
                        placeholder="Write a compelling description to encourage clicks"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className={`pr-10 min-h-[80px] ${theme === 'dark' ? 'bg-gray-700 text-white' : ''}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2"
                        onClick={() => handleAIRewrite('description', description)}
                        disabled={isRewriting}
                      >
                        {isRewriting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </>
              )}
              {(shareType === 'IMAGE' || shareType === 'VIDEO') && (
                <>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="media" className="text-lg font-semibold">Upload {shareType === 'IMAGE' ? 'Images' : 'Videos'}</Label>
                    <div
                      className={`border-2 border-dashed rounded-md p-4 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}
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
                        {shareType === 'IMAGE' ? <Camera className="w-8 h-8" /> : <Video className="w-8 h-8" />}
                        <span>Drag and drop or click to select {shareType === 'IMAGE' ? 'images' : 'videos'}</span>
                      </Label>
                    </div>
                    {media.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {media.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded">
                            <span>{file.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeMedia(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="mediaTitle" className="text-lg font-semibold">{shareType === 'IMAGE' ? 'Image' : 'Video'} Title</Label>
                    <div className="relative">
                      <Input
                        id="mediaTitle"
                        placeholder={`Enter an attention-grabbing ${shareType === 'IMAGE' ? 'image' : 'video'} title`}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={theme === 'dark' ? 'bg-gray-700 text-white' : ''}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        onClick={() => handleAIRewrite('title', title)}
                        disabled={isRewriting}
                      >
                        {isRewriting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="mediaDescription" className="text-lg font-semibold">{shareType === 'IMAGE' ? 'Image' : 'Video'} Description</Label>
                    <div className="relative">
                      <Textarea
                        id="mediaDescription"
                        placeholder={`Describe your ${shareType === 'IMAGE' ? 'image' : 'video'} and why it's relevant to your audience`}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className={`pr-10 min-h-[80px] ${theme === 'dark' ? 'bg-gray-700 text-white' : ''}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2"
                        onClick={() => handleAIRewrite('description', description)}
                        disabled={isRewriting}
                      >
                        {isRewriting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button type="submit" disabled={isSharing} className="w-full max-w-xs">
              {isSharing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSharing ? 'Sharing...' : 'Share on LinkedIn'}
            </Button>
          </CardFooter>
        </form>
        {message && (
          <Alert variant={message.includes('Error') ? "destructive" : "default"} className="mt-4 mx-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{message.includes('Error') ? 'Error' : 'Success'}</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Suggestion</DialogTitle>
            <DialogDescription>
              Heres a suggested rewrite for your {currentField}. Would you like to use this?
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 p-4 bg-gray-100 rounded-md max-h-60 overflow-y-auto">
            <ReactMarkdown>{messages[messages.length - 1]?.content || ''}</ReactMarkdown>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={acceptSuggestion}>Accept Suggestion</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}








