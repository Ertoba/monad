"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export function TopNav() {
  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 bg-[#111111]/90 backdrop-blur-sm border-b border-white/10 px-4 py-2 z-50"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-screen-xl mx-auto">
        <div className="flex justify-between items-center h-10">
          {/* Left side - empty for now */}
          <div className="w-10"></div>

          {/* Center - Ancient text */}
          <div className="text-center flex items-center gap-4">
            <span className="text-white/90 font-medium tracking-wider text-lg">𒋻𒋻𐏓𒐕𒀼𒋻𒈦𐎠𒆸𒋻𒋻𒁓</span>

            {/* Eye of Horus Logo */}
            <div className="relative group">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative w-8 h-8">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_7458-7WCTgYGSoizNY976WV4VEDKEQvm8vc.png"
                  alt="Eye of Horus"
                  width={32}
                  height={32}
                  className="object-contain filter brightness-0 invert group-hover:brightness-0 group-hover:invert transition-all duration-200"
                  priority
                />
                {/* Subtle glow effect on hover */}
                <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-40 transition-opacity bg-white/20 blur-md"></div>
              </motion.div>
            </div>
          </div>

          {/* Right side - balanced empty space */}
          <div className="w-10"></div>
        </div>
      </div>

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent pointer-events-none"></div>
    </motion.nav>
  )
}

