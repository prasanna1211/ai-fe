'use client'

import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

export function FloatingSearchButton({ onClick, className }) {
    return (
        <Button
            onClick={onClick}
            className={cn(
                "fixed bottom-6 right-6 h-12 w-12 rounded-full bg-[#2d3748] hover:bg-[#1a202c] shadow-lg p-0 flex items-center justify-center transition-all duration-300 ease-in-out",
                className
            )}
        >
            <Search className="h-6 w-6" />
        </Button>
    )
} 