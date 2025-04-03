import Link from "next/link"
import {
  FileText,
  Code,
  Palette,
  Shield,
  Globe,
  Twitter,
  Github,
  DiscIcon as Discord,
  Youtube,
  Headphones,
} from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-white/10 py-6 mt-12 bg-black/20 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-6 text-gray-400">
          <Link href="/docs" className="flex items-center gap-2 hover:text-amber-400">
            <FileText className="h-4 w-4" />
            <span>DOCS</span>
          </Link>
          <Link href="/api" className="flex items-center gap-2 hover:text-amber-400">
            <Code className="h-4 w-4" />
            <span>API&SDK</span>
          </Link>
          <Link href="/brand" className="flex items-center gap-2 hover:text-amber-400">
            <Palette className="h-4 w-4" />
            <span>Brand Kit</span>
          </Link>
          <Link href="/audit" className="flex items-center gap-2 hover:text-amber-400">
            <Shield className="h-4 w-4" />
            <span>Audit</span>
          </Link>
          <Link href="/ecosystem" className="flex items-center gap-2 hover:text-amber-400">
            <Globe className="h-4 w-4" />
            <span>Ecosystem</span>
          </Link>
        </div>
        <div className="flex justify-center mt-6 gap-4">
          <Link href="https://twitter.com" className="text-gray-400 hover:text-amber-400">
            <Twitter className="h-5 w-5" />
          </Link>
          <Link href="https://github.com" className="text-gray-400 hover:text-amber-400">
            <Github className="h-5 w-5" />
          </Link>
          <Link href="https://discord.com" className="text-gray-400 hover:text-amber-400">
            <Discord className="h-5 w-5" />
          </Link>
          <Link href="https://youtube.com" className="text-gray-400 hover:text-amber-400">
            <Youtube className="h-5 w-5" />
          </Link>
          <Link href="https://support.com" className="text-gray-400 hover:text-amber-400">
            <Headphones className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </footer>
  )
}

