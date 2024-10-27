'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Camera } from 'lucide-react'

type ShareType = 'TEXT' | 'ARTICLE' | 'IMAGE'

export function LinkedInShareFormComponent() {
  const [shareType, setShareType] = useState<ShareType>('TEXT')
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [isSharing, setIsSharing] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSharing(true)
    setMessage('')

    const formData = new FormData()
    formData.append('shareType', shareType)
    formData.append('text', text)

    if (shareType === 'ARTICLE') {
      formData.append('url', url)
      formData.append('title', title)
      formData.append('description', description)
    } else if (shareType === 'IMAGE' && image) {
      formData.append('image', image)
      formData.append('title', title)
      formData.append('description', description)
    }

    try {
      const response = await fetch('/api/linkedin/share', {
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
        setImage(null)
      } else {
        setMessage(`Error: ${data.error}`)
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setMessage('An error occurred while sharing')
    } finally {
      setIsSharing(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Share on LinkedIn</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="shareType">Share Type</Label>
              <RadioGroup id="shareType" value={shareType} onValueChange={(value) => setShareType(value as ShareType)} className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="TEXT" id="shareTypeText" />
                  <Label htmlFor="shareTypeText">Text</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ARTICLE" id="shareTypeArticle" />
                  <Label htmlFor="shareTypeArticle">Article</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="IMAGE" id="shareTypeImage" />
                  <Label htmlFor="shareTypeImage">Image</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="text">Share Text</Label>
              <Textarea
                id="text"
                placeholder="What do you want to share?"
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
              />
            </div>
            {shareType === 'ARTICLE' && (
              <>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="url">Article URL</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com/article"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="title">Article Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter article title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="description">Article Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter article description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </>
            )}
            {shareType === 'IMAGE' && (
              <>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="image">Upload Image</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Label htmlFor="image" className="cursor-pointer flex items-center space-x-2 p-2 border rounded hover:bg-gray-100">
                      <Camera className="w-6 h-6" />
                      <span>{image ? image.name : 'Select an image'}</span>
                    </Label>
                  </div>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="imageTitle">Image Title</Label>
                  <Input
                    id="imageTitle"
                    placeholder="Enter image title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="imageDescription">Image Description</Label>
                  <Textarea
                    id="imageDescription"
                    placeholder="Enter image description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="submit" disabled={isSharing}>
            {isSharing ? 'Sharing...' : 'Share on LinkedIn'}
          </Button>
        </CardFooter>
      </form>
      {message && (
        <div className={`p-4 ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
          {message}
        </div>
      )}
    </Card>
  )
}