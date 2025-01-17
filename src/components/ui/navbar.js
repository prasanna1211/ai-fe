'use client'

import { useSession, signIn, signOut } from "next-auth/react"
import { useState, useEffect } from "react"

function getInitials(name) {
    if (!name) return "U"
    return name
        .split(" ")
        .map(word => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
}

export function Navbar({
    tokenCount
}) {
    const { data: session } = useSession()


    useEffect(() => {
        if (!session) {
            return
        }

        // Function to handle WebSocket messages
        const handleWebSocketMessage = (event) => {
            try {
                const data = JSON.parse(event.data)
                if (data.key === 'auth_success' && data.user) {
                    console.log('Received initial token count:', data.user.count)
                }
                if (data.key === 'token_update' && typeof data.count === 'number') {
                    console.log('Received token count update:', data.count)
                }
            } catch (error) {
                console.error('Error handling WebSocket message:', error)
            }
        }

        // Get the existing WebSocket from the page component
        const existingSocket = window.aiWebSocket
        if (existingSocket) {
            existingSocket.addEventListener('message', handleWebSocketMessage)
        }

        return () => {
            if (existingSocket) {
                existingSocket.removeEventListener('message', handleWebSocketMessage)
            }
        }
    }, [session])

    return (
        <div className="fixed top-0 left-0 right-0 h-14 bg-[#fcfcf9] border-b border-gray-200 z-20">
            <div className="max-w-3xl mx-auto h-full px-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <h1 className="text-lg font-semibold text-gray-900">AI Search Assistant</h1>
                </div>
                <div className="flex items-center space-x-4">
                    {session ? (
                        <>
                            <div className="text-sm text-gray-600 flex items-center space-x-1">
                                <span className="font-medium">Total Usage:</span>
                                <span>{tokenCount.toLocaleString()} tokens</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-sm font-medium text-gray-600">
                                        {getInitials(session.user?.name)}
                                    </span>
                                </div>
                                <button
                                    onClick={() => signOut()}
                                    className="text-sm text-gray-600 hover:text-gray-900"
                                >
                                    Sign out
                                </button>
                            </div>
                        </>
                    ) : (
                        <button
                            onClick={() => signIn("google")}
                            className="text-sm text-gray-600 hover:text-gray-900"
                        >
                            Sign in
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
} 