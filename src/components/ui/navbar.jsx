'use client'

import { useSession } from "next-auth/react"
import { LoginButton } from "./login-button"
import { AvatarInitials } from "./avatar-initials"

export function Navbar() {
    const { data: session } = useSession()

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#fcfcf9] border-b border-gray-200">
            <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <span className="font-semibold text-gray-900">AI Planner</span>
                </div>
                <div className="flex items-center space-x-4">
                    {session && (
                        <div className="flex items-center space-x-3">
                            <AvatarInitials name={session.user.name} />
                        </div>
                    )}
                    <LoginButton />
                </div>
            </div>
        </nav>
    )
} 