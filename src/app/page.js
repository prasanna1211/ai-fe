'use client'

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState, useEffect, useRef } from "react"
import ReactMarkdown from 'react-markdown'

export default () => {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const wsRef = useRef(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    wsRef.current = new WebSocket('ws://localhost:3001')

    wsRef.current.onopen = () => {
      console.log('Connected to WebSocket server')
      setConnected(true)
    }

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      console.log('Received:', data)

      if (data.key) {
        setMessages(prev => [...prev, data])
      }
    }

    wsRef.current.onclose = () => {
      console.log('Disconnected from WebSocket server')
      setConnected(false)
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  const handleSend = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && message) {
      const searchMessage = {
        searchText: message
      }
      wsRef.current.send(JSON.stringify(searchMessage))
      setMessage('')
    }
  }

  const renderMessage = (message, index) => {
    switch (message.key) {
      case 'renderListSteps':
        return (
          <Card key={index} className="mb-4">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2">{message.title}</h3>
              {message.steps.map((step, i) => (
                <p key={i} className="text-sm text-gray-600 mb-1">{step}</p>
              ))}
            </CardContent>
          </Card>
        )

      case 'renderCurrentStepTitle':
        return (
          <Card key={index} className="mb-4">
            <CardContent className="pt-6">
              <p className="text-sm">
                <span className="font-medium">{message.header}</span>
                {message.value}
              </p>
            </CardContent>
          </Card>
        )

      case 'renderStepResult':
        return (
          <Card key={index} className="mb-4">
            <CardContent className="pt-6">
              <div className="text-sm">
                <span className="font-medium">{message.step} </span>
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>
                    {message.resultTitle}
                  </ReactMarkdown>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 'renderLog':
        return (
          <Card key={index} className="mb-4 bg-gray-50">
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">{message.log}</p>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-7xl mx-auto my-0 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-500">
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        <Textarea
          placeholder="Type your message here."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
        />

        <Button
          onClick={handleSend}
          disabled={!connected || !message}
        >
          Send message
        </Button>

        <ScrollArea className="h-[600px] rounded-md border p-4">
          <div className="space-y-4">
            {messages.map((msg, index) => renderMessage(msg, index))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
