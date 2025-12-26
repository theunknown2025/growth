import Link from "next/link"
import { Button } from "@/shadcn/ui/button"
import { ArrowLeft, Home, Search } from "lucide-react"
import BrandLogo from "@/components/logo/brand-logo"

export default function NotFoundView() {
  return (
    <div className="min-h-screen bg-[#0F0A19] flex flex-col">
      <header className="flex h-16 items-center px-4 lg:px-8 border-b border-purple-primary/20 bg-[#0F0A19]">
        <Link href="/" className="flex items-center gap-2">
          <BrandLogo />
          <span className="font-bold text-xl text-white">Growth</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 gradient-bg">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="relative mx-auto w-40 h-40">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-light/30 to-purple-primary/30 rounded-full animate-pulse"></div>
            <div className="absolute inset-4 bg-[#0F0A19]/80 rounded-full flex items-center justify-center">
              <span className="text-8xl font-bold bg-gradient-to-br from-purple-light to-white bg-clip-text text-transparent">
                404
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-white">Page not found</h1>
            <p className="text-white/60">The page you're looking for doesn't exist or has been moved.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="gap-2 bg-gradient-to-r from-purple-light to-purple-primary hover:opacity-90"
            >
              <Link href="/">
                <Home className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t border-purple-primary/20 py-4 px-4 lg:px-8 bg-[#0F0A19]">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/60">© 2025 Growth. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-white/60 hover:text-white">
              Help Center
            </Link>
            <Link href="#" className="text-sm text-white/60 hover:text-white">
              Contact Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

