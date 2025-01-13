'use client'

import { useState, useEffect } from 'react'

export function TypeWriter({ text, className }) {
    const [displayedText, setDisplayedText] = useState('')
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        if (!text) return

        if (currentIndex < text.length) {
            const timer = setTimeout(() => {
                setDisplayedText(prev => prev + text[currentIndex])
                setCurrentIndex(prev => prev + 1)
            }, 20) // Adjust speed here (lower = faster)

            return () => clearTimeout(timer)
        }
    }, [text, currentIndex])

    // Reset when text changes
    useEffect(() => {
        setDisplayedText('')
        setCurrentIndex(0)
    }, [text])

    return <span className={className}>{displayedText}</span>
} 