'use client'

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ShellLoader } from "@/components/ui/shell-loader"
import { ArrowRight } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import ReactMarkdown from 'react-markdown'
import { FloatingSearchButton } from "@/components/ui/floating-search-button"
import { cn } from "@/lib/utils"

export default () => {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const wsRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [isSearchExpanded, setIsSearchExpanded] = useState(true)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    wsRef.current = new WebSocket(wsUrl)

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
          <div key={index} className="mb-3 bg-[#fcfcf9]">
            <div className="py-2">
              <h3 className="text-[1.2rem] font-medium text-gray-900 mb-1.5">
                <ShellLoader text={message.title} inline messageId={`${index}-title`} />
              </h3>
              {message.steps.map((step, i) => (
                <p key={i} className="text-[1rem] text-gray-700 mb-1">
                  <ShellLoader text={step} inline messageId={`${index}-step-${i}`} />
                </p>
              ))}
            </div>
          </div>
        )

      case 'renderCurrentStepTitle':
        return (
          <div key={index} className="mb-3 bg-[#fcfcf9]">
            <div className="py-2">
              <p className="text-[1rem] text-gray-700">
                <span className="font-medium text-gray-900 italic">
                  <ShellLoader text={message.header} inline messageId={`${index}-header`} />
                </span>
                <ShellLoader text={message.value} inline messageId={`${index}-value`} />
              </p>
            </div>
          </div>
        )

      case 'renderStepResult':
        const paragraphs = message.resultTitle.split('\n').filter(p => p.trim());

        return (
          <div key={index} className="mb-3 bg-[#fcfcf9]">
            <div className="py-2">
              <div className="text-[1rem] text-gray-700">
                <span className="font-bold text-gray-900">
                  <ShellLoader text={message.step} inline messageId={`${index}-step`} />
                </span>
                <div className="prose prose-base max-w-none prose-p:text-[1rem] prose-p:text-gray-700">
                  {paragraphs.map((paragraph, pIndex) => (
                    <p key={pIndex}>
                      <ShellLoader
                        text={paragraph}
                        inline
                        messageId={`${index}-result-${pIndex}`}
                      />
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 'renderLog':
        return (
          <div key={index} className="mb-3 bg-[#fcfcf9]">
            <div className="py-2">
              <p className="text-[1rem] text-gray-700 italic">
                <ShellLoader text={message.log} inline messageId={`${index}-log`} />
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY.current + 10) {
        setIsSearchExpanded(false)
      } else if (currentScrollY < lastScrollY.current) {
        setIsSearchExpanded(true)
      }

      lastScrollY.current = currentScrollY
    }

    let timeoutId;
    const debouncedHandleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 10);
    };

    window.addEventListener('scroll', debouncedHandleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', debouncedHandleScroll)
      clearTimeout(timeoutId)
    }
  }, [])

  const toggleSearch = () => {
    setIsSearchExpanded(prev => !prev)
  }

  return (
    <div className="min-h-screen bg-[#fcfcf9]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div
          className={cn(
            "fixed top-0 left-0 right-0 bg-[#fcfcf9] z-10 transition-all duration-300 ease-in-out",
            isSearchExpanded
              ? "h-[160px] pt-4 px-4"
              : "h-[60px] pt-2 px-4"
          )}
        >
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <Textarea
                placeholder="Ask any question..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                className={cn(
                  "min-h-[60px] resize-none rounded-xl border border-gray-200 bg-[#fcfcf9] px-4 py-3 text-base focus:border-gray-300 focus:ring-0 focus:ring-offset-0 pr-16 transition-all duration-300",
                  isSearchExpanded ? "h-32" : "h-[40px]"
                )}
              />
              <div className={cn(
                "absolute left-4 transition-all duration-300 flex items-center space-x-2",
                isSearchExpanded ? "bottom-3" : "bottom-2"
              )}>
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-xs text-gray-600">
                  {connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <Button
                onClick={handleSend}
                disabled={!connected || !message}
                className={cn(
                  "absolute right-3 rounded-full bg-[#2d3748] hover:bg-[#1a202c] p-0 flex items-center justify-center transition-all duration-300",
                  isSearchExpanded
                    ? "bottom-3 h-10 w-10"
                    : "bottom-2 h-7 w-7"
                )}
              >
                <ArrowRight className={isSearchExpanded ? "h-5 w-5" : "h-4 w-4"} />
              </Button>
            </div>
          </div>
        </div>

        <FloatingSearchButton
          onClick={toggleSearch}
          className={cn(
            "transition-all duration-300",
            isSearchExpanded ? "opacity-0 scale-90 pointer-events-none" : "opacity-100 scale-100"
          )}
        />

        <div className="mt-32 space-y-6">
          {messages.map((msg, index) => renderMessage(msg, index))}
        </div>
      </div>
    </div>
  )
}
