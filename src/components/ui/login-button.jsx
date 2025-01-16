'use client'

import { signIn, signOut, useSession } from "next-auth/react"
import { Button } from "./button"

export function LoginButton() {
    const { data: session } = useSession()

    if (session) {
        return (
            <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="text-gray-600 hover:text-gray-900"
            >
                Sign out
            </Button>
        )
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={() => signIn('google')}
            className="text-gray-600 hover:text-gray-900"
        >
            Sign in
        </Button>
    )
} 