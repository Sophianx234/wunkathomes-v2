"use client"

import { useState } from "react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  MoreVerticalCircle01Icon, 
  Logout01Icon, 
  Settings01Icon,
  Loading03Icon
} from "@hugeicons/core-free-icons"
import Link from "next/link"
import { logoutAction } from "@/actions/user/auth.action"

// IMPORT YOUR LOGOUT ACTION HERE

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async (e: Event) => {
    // Prevent the dropdown from instantly closing so the user sees the loading state
    e.preventDefault() 
    setIsLoggingOut(true)
    
    // Trigger the server action
    await logoutAction()
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg ">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
              <HugeiconsIcon icon={MoreVerticalCircle01Icon} strokeWidth={2} className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg shadow-sm border-zinc-200/60"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator className="bg-zinc-100/50" />
            
            <DropdownMenuGroup>
              <Link href="/admin/settings" className="w-full">
                <DropdownMenuItem className="cursor-pointer text-zinc-700 hover:text-zinc-900 focus:bg-zinc-50">
                  <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} className="mr-2" />
                  Settings 
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            
            <DropdownMenuSeparator className="bg-zinc-100/50" />
            
            {/* INLINE LOADING LOGOUT BUTTON */}
            <DropdownMenuItem 
              onSelect={handleLogout}
              disabled={isLoggingOut}
              className={`cursor-pointer ${
                isLoggingOut 
                  ? "text-zinc-400 focus:bg-transparent pointer-events-none" 
                  : "text-rose-600 focus:bg-rose-50 focus:text-rose-700"
              }`}
            >
              {isLoggingOut ? (
                <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="mr-2 animate-spin" />
              ) : (
                <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} className="mr-2" />
              )}
              {isLoggingOut ? "Logging out..." : "Log out"}
            </DropdownMenuItem>
            
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
