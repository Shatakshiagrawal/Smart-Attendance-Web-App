"use client"

import type React from "react"
import { Toaster } from "react-hot-toast"
import { useEffect } from "react"
import { useAuth } from "@/components/AuthProvider"
import { useRouter, usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BarChart3, User, LogOut, GraduationCap, Home } from "lucide-react"
import Link from "next/link"

const navigation = [
  { name: "Dashboard", href: "/student/dashboard", icon: Home },
  { name: "Analytics", href: "/student/analytics", icon: BarChart3 },
  { name: "Profile", href: "/student/profile", icon: User },
]

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && (!user || user.role !== "student")) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || user.role !== "student") {
    return null
  }
  
  // FIX: Safely get user initials
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[1][0]}`;
    }
    return names[0].substring(0, 2);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Toaster position="top-right" />
        <Sidebar className="border-r border-border/50 hidden md:flex">
          <SidebarHeader className="border-b border-border/50 p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#00ABE4] rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">AttendEase</h2>
                <p className="text-xs text-muted-foreground">Student Portal</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-4">
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link
                        href={item.href}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                          isActive
                            ? "bg-[#00ABE4] text-white hover:bg-[#0ea5e9]"
                            : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarContent>
          <div className="mt-auto p-4 border-t border-border/50">
            <Button
              onClick={logout}
              className="w-full flex items-center justify-start gap-3 p-3 text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-colors"
              variant="ghost"
            >
              <LogOut className="w-5 h-5" />
              <span>Log out</span>
            </Button>
          </div>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex">
            <div className="flex h-16 items-center justify-between px-6 w-full">
              <div className="flex items-center space-x-4">
                <div className="hidden md:block">
                  <SidebarTrigger />
                </div>
                <h1 className="text-xl font-semibold text-foreground">Student Dashboard</h1>
              </div>

              <div className="flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-[#00ABE4] text-white">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 z-50" align="end">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">
                          {user.name}
                        </p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/student/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 bg-background pb-20 md:pb-6">{children}</main>

          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
            <div className="flex justify-around">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                      isActive ? "text-[#00ABE4]" : "text-gray-600"
                    }`}
                  >
                    <item.icon className="w-6 h-6" />
                    <span className="text-xs font-medium">{item.name}</span>
                  </Link>
                )
              })}
              <button
                onClick={logout}
                className="flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors text-red-500"
              >
                <LogOut className="w-6 h-6" />
                <span className="text-xs font-medium">Logout</span>
              </button>
            </div>
          </nav>
        </div>
      </div>
    </SidebarProvider>
  )
}