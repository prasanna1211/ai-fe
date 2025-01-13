'use client'

import { useState, useEffect } from 'react'
import { cn } from "@/lib/utils"

export function ShellLoader({ text, className, inline = false, messageId }) {
    const [show, setShow] = useState(false)
    const [content, setContent] = useState('')
    const [hasLoaded, setHasLoaded] = useState(false)

    useEffect(() => {
        if (!text || hasLoaded) return

        // Reset state when text changes and hasn't been loaded before
        setShow(false)
        setContent('')

        // Show loading animation
        const loadTimer = setTimeout(() => {
            setShow(true)
            setContent(text)
            setHasLoaded(true)
        }, 300)

        return () => clearTimeout(loadTimer)
    }, [text, messageId, hasLoaded])

    const LoadingDots = () => (
        <span className="inline-flex space-x-2">
            <span className="h-2 w-2 rounded-full bg-gray-400 animate-pulse inline-block" />
            <span className="h-2 w-2 rounded-full bg-gray-400 animate-pulse delay-150 inline-block" />
            <span className="h-2 w-2 rounded-full bg-gray-400 animate-pulse delay-300 inline-block" />
        </span>
    )

    if (inline) {
        return (
            <span className={cn("transition-opacity duration-500 inline-flex items-center space-x-2",
                show ? "opacity-100" : "opacity-0"
            )}>
                {!show && !hasLoaded && <LoadingDots />}
                <span className={cn(
                    "transition-opacity duration-300",
                    show ? "opacity-100" : "opacity-0",
                    className
                )}>
                    {content}
                </span>
            </span>
        )
    }

    return (
        <div className={cn("transition-opacity duration-500", show ? "opacity-100" : "opacity-0")}>
            <div className="flex items-center space-x-2">
                {!show && !hasLoaded && <LoadingDots />}
                <span className={cn(
                    "transition-opacity duration-300",
                    show ? "opacity-100" : "opacity-0",
                    className
                )}>
                    {content}
                </span>
            </div>
        </div>
    )
} 