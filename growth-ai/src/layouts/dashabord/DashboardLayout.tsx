"use client"

import type React from "react"
import { useState, useEffect, useCallback, useContext } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  MessageSquare,
  Bell,
  User,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Settings,
} from "lucide-react"
import { Button } from "@/shadcn/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/shadcn/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shadcn/ui/dropdown-menu"
import { cn } from "@/shadcn/lib/utils"
import { useIsMobile } from "@/hooks/use-is-mobile"
import { AuthContext } from "@/sections/auth/context/AuthContext"
import { signOut } from "@/actions/auth"
import { useRouter } from "next/navigation"
import { getFilteredNavData } from "../role-based-nav"
import { cp } from "fs"
import { paths } from "@/routes/paths"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [dashboardExpanded, setDashboardExpanded] = useState(true)
  const isMobile = useIsMobile()

  const { user } = useContext(AuthContext) || {}
  const role = user?.role
  const filteredNavData = getFilteredNavData(role)

  const toggleDashboard = () => {
    setDashboardExpanded(!dashboardExpanded)
  }

  // Collapse sidebar by default on mobile
  useEffect(() => {
    if (isMobile) {
      setDashboardExpanded(false)
    } else {
      setDashboardExpanded(true)
    }
  }, [isMobile])

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Dashboard Menu - Collapsible */}
      <div
        className={cn(
          "h-full bg-[#0F0A19] flex flex-col border-r border-purple-primary/20 transition-all duration-300 ease-in-out fixed md:relative z-20",
          dashboardExpanded ? "w-64" : "w-16",
          isMobile && !dashboardExpanded && "-translate-x-full"
        )}
      >
        <div className="flex items-center h-16 px-4 border-b border-purple-primary/20">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-gradient-to-br from-purple-light to-purple-primary">
            <MessageSquare size={18} className="text-white" />
          </div>
          {dashboardExpanded && <h1 className="ml-3 text-lg font-semibold text-white">Growth</h1>}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto text-white/70 hover:text-white hover:bg-purple-light/30"
            onClick={toggleDashboard}
          >
            {dashboardExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </Button>
        </div>

        <nav className="flex flex-col gap-2 p-3 flex-1 overflow-y-auto">
          {filteredNavData.map((subheader) =>
            subheader.items.map((item) => {
              // Determine if this item has a valid path
              const itemPath =
          typeof item.path === "string" ? item.path : item.path?.root;
              const isDisabled = !itemPath;

              // If no path, render as disabled
              if (isDisabled) {
          return (
            <div
              key={item.title}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all",
                "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex-shrink-0 flex items-center justify-center text-white/70">
                {item.icon}
              </div>
              {dashboardExpanded && (
                <span className="text-sm truncate text-white/70">
            {item.title}
                </span>
              )}
            </div>
          );
              }

              // Otherwise, render as a normal NavItem
              return (
          <NavItem
            key={item.title}
            icon={item.icon}
            label={item.title}
            href={itemPath!}
            active={pathname === itemPath}
            expanded={dashboardExpanded}
          />
              );
            })
          )}
        </nav>

        {dashboardExpanded && (
          <div className="p-4 border-t border-purple-primary/20">
            <div className="flex items-center gap-3 px-2 py-2">
              <Avatar className="h-8 w-8 border border-purple-light/30">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.firstName +" " + user?.lastName}
                </p>
                <p className="text-xs text-white/50 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Header toggleSidebar={toggleDashboard} isMobile={isMobile} />
        <main className="flex-1 overflow-auto gradient-bg animate-fadeIn p-4 md:p-6">{children}</main>
      </div>

      {/* Mobile overlay when menu is open */}
      {isMobile && dashboardExpanded && (
        <div className="fixed inset-0 bg-black/50 z-10" onClick={() => setDashboardExpanded(false)} />
      )}
    </div>
  )
}

function NavItem({
  icon,
  label,
  href,
  active,
  expanded,
}: {
  icon: React.ReactNode
  label: string
  href: string
  active: boolean
  expanded: boolean
}) {
  return (
    <Link
          href={href}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all",
            active
              ? "bg-gradient-to-r from-purple-light to-purple-primary text-white font-medium"
              : "text-white/70 hover:text-white hover:bg-purple-light/10"
          )}
    >
      <div className={cn("flex-shrink-0 flex items-center justify-center", active ? "text-white" : "text-white/70")}>
        {icon}
      </div>
      {expanded && <span className="text-sm truncate">{label}</span>}
    </Link>
  )
}

function Header({ toggleSidebar, isMobile }: { toggleSidebar: () => void; isMobile: boolean }) {
  const { checkUserSession , user} = useContext(AuthContext) || {}
  const router = useRouter()

  const handleSettings = useCallback(() => {
    router.push(paths.dashboard.settings)
  }, [router])

  const handleLogout = useCallback(async () => {
    try {
      await signOut()
      await checkUserSession?.()
      router.push("/auth/login")
    } catch (error) {
      console.error(error)
    }
  }, [checkUserSession, router])

  return (
    <header className="border-b border-purple-primary/20 bg-[#0F0A19]">
      <div className="flex h-16 items-center justify-between px-4">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="text-white/70 hover:text-white hover:bg-purple-light/10"
            onClick={toggleSidebar}
          >
            <MessageSquare size={20} />
          </Button>
        )}
        <div className="flex-1 px-4">
          <h2 className="text-lg font-medium text-white">Dashboard</h2>
        </div>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8 border border-purple-light/30">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                  <AvatarFallback>
                    {user?.firstName?.charAt(0).toUpperCase() + user?.lastName?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-[#0F0A19] border border-purple-primary/20 rounded-md shadow-lg">
              <DropdownMenuLabel className="px-3">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
                <DropdownMenuItem className="px-3 py-2" onClick={handleSettings}>
                  <Settings className="mr-3 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="px-3 py-2" onClick={handleLogout}>
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
