"use client"

import Image from "next/image"

export function StaticLogo() {
  return (
    <div className="w-8 h-8 relative flex items-center justify-center">
      <Image
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_7284-6GUw4dZwEofvgfqzORAgzSJmvDw6kl.png"
        alt="Ancientmonad Logo"
        width={32}
        height={32}
        className="object-contain"
        priority
      />
    </div>
  )
}

