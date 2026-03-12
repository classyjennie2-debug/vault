"use client"

import Link from "next/link"
import { Settings, HelpCircle, LogOut, ChevronDown } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UserMenuProps {
  user: {
    name: string
    email: string
    avatar: string
  }
}

export function UserMenu({ user }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 h-10 px-2 hover:bg-secondary/50 transition-colors"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-secondary text-foreground text-xs font-semibold">
              {user.avatar}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col items-start">
            <p className="text-xs font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground ml-1 transition-transform group-data-[state=open]:rotate-180" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48 sm:w-56 mt-2 mx-2">
        {/* User Info */}
        <DropdownMenuLabel className="flex flex-col py-2">
          <p className="text-sm font-medium text-foreground">{user.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Menu Items */}
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-2 cursor-pointer"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="/dashboard/support"
              className="flex items-center gap-2 cursor-pointer"
            >
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
              <span>Support</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Sign Out */}
        <DropdownMenuItem asChild>
          <Link
            href="/"
            className="flex items-center gap-2 cursor-pointer text-red-600 dark:text-red-400 font-medium"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
