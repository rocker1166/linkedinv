'use client'

import { useState } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"

export default function LinkedInShareForm() {
  const [text, setText] = useState('')
  const [isSharing, setIsSharing] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSharing(true)
    setMessage('')

    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Successfully shared on LinkedIn!')
        setText('')
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

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Share on LinkedIn</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Input
                id="text"
                placeholder="What do you want to share?"
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="submit" disabled={isSharing}>
            {isSharing ? 'Sharing...' : 'Share'}
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