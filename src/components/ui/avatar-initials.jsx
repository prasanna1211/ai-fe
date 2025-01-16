'use client'

export function AvatarInitials({ name, className }) {
    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }

    return (
        <div className={`w-8 h-8 rounded-full bg-[#2d3748] text-white flex items-center justify-center text-sm font-medium ${className}`}>
            {getInitials(name)}
        </div>
    )
} 