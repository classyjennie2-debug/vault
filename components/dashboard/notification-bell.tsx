"use client"

import { Bell, Zap, AlertCircle, CheckCircle, Info, X } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useEffect, useState, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Notification } from "@/lib/types"

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/notifications")
      if (response.ok) {
        const data = await response.json()
        
        // Set the notifications with isRead properly formatted from server
        setNotifications(data.map((notif: any) => ({
          ...notif,
          isRead: Boolean(notif.isRead)
        })))
      } else {
        console.error("Failed to fetch notifications")
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch on initial mount and set up polling
  useEffect(() => {
    fetchNotifications()
    
    // Set up polling every 10 seconds to keep state fresh
    const interval = setInterval(() => {
      fetchNotifications()
    }, 10000)
    
    return () => clearInterval(interval)
  }, [])

  const unreadCount = notifications.filter((n) => !n.isRead).length
  const unreadNotifications = notifications.filter((n) => !n.isRead)
  const readNotifications = notifications.filter((n) => n.isRead)

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    
    // Optimistically update local state immediately
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
    
    // Sync to server
    try {
      const response = await fetch("/api/notifications/" + id + "/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
      
      if (!response.ok) {
        console.error("Failed to mark notification as read")
        // On failure, refetch to get actual state from server
        await fetchNotifications()
      }
      // On success, the update has been persisted to database
    } catch (error) {
      console.error("Error marking notification as read:", error)
      // On error, refetch to get actual state from server
      await fetchNotifications()
    }
  }

  const getNotificationColor = (
    type: "success" | "info" | "warning" | "error"
  ) => {
    switch (type) {
      case "success":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
      case "warning":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
      case "error":
        return "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20"
      case "info":
      default:
        return "bg-primary/10 text-primary border-primary/20"
    }
  }

  const getNotificationIcon = (type: "success" | "info" | "warning" | "error") => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5" />
      case "warning":
        return <AlertCircle className="h-5 w-5" />
      case "error":
        return <AlertCircle className="h-5 w-5" />
      case "info":
      default:
        return <Info className="h-5 w-5" />
    }
  }

  const NotificationItem = ({ notification, idx }: { notification: Notification; idx: number }) => (
    <div
      className="p-4 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-all duration-300 group animate-in fade-in slide-in-from-left duration-500"
      style={{ animationDelay: `${idx * 50}ms` }}
      onClick={(e) => {
        handleMarkAsRead(notification.id, e)
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg font-bold transition-all duration-300 group-hover:scale-110 border ${getNotificationColor(notification.type)}`}
        >
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-card-foreground group-hover:text-accent transition-colors truncate">
              {notification.title}
            </p>
            {!notification.isRead && (
              <div className="h-2 w-2 rounded-full bg-accent flex-shrink-0 shadow-lg shadow-accent/50 animate-pulse" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 group-hover:text-muted-foreground/80">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground/60 mt-2">
            {notification.timestamp ? new Date(notification.timestamp).toLocaleString() : "Recently"}
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative group h-9 w-9 sm:h-11 sm:w-11 bg-gradient-to-br from-amber-500/5 to-amber-500/0 hover:from-amber-500/15 hover:to-amber-500/5 hover:shadow-md shadow-sm transition-all duration-200 hover:scale-105 rounded-lg border border-amber-500/10 hover:border-amber-500/30"
        >
          <div className="relative">
            <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 dark:text-amber-400 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors duration-200" />
            {unreadCount > 0 && (
              <>
                <div className="absolute inset-0 rounded-full animate-pulse">
                  <div className="absolute inset-0 rounded-full border-2 border-red-500/30 -m-1" />
                </div>
                <span className="absolute -top-2 -right-2 inline-flex items-center justify-center h-6 w-6 text-xs font-bold leading-none text-white bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-lg shadow-red-500/40 animate-pulse ring-2 ring-white dark:ring-slate-900">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              </>
            )}
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-[420px] flex flex-col p-0">
        <SheetHeader className="border-b border-border/30 px-6 py-4 sticky top-0 z-10 bg-gradient-to-b from-card to-card/50 backdrop-blur-sm flex flex-row items-center justify-between">
          <SheetTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-accent" />
            Notifications
          </SheetTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 -mr-2"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close notifications</span>
          </Button>
        </SheetHeader>

        <Tabs defaultValue="unread" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 sticky top-16 z-10 mx-6 mt-4 bg-slate-100 dark:bg-slate-800">
            <TabsTrigger value="unread" className="text-xs font-semibold">
              Unread{" "}
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full flex items-center justify-center p-0 text-[10px]">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="read" className="text-xs font-semibold">
              Read ({readNotifications.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="unread" className="flex-1 overflow-y-auto">
            {unreadNotifications.length > 0 ? (
              <div className="divide-y divide-border/20">
                {unreadNotifications.map((notification, idx) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    idx={idx}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center gap-3">
                <Bell className="h-12 w-12 text-muted-foreground/30" />
                <p className="text-muted-foreground font-medium">No unread notifications</p>
                <p className="text-xs text-muted-foreground/70">You're all caught up!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="read" className="flex-1 overflow-y-auto">
            {readNotifications.length > 0 ? (
              <div className="divide-y divide-border/20">
                {readNotifications.map((notification, idx) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    idx={idx}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center gap-3">
                <Bell className="h-12 w-12 text-muted-foreground/30" />
                <p className="text-muted-foreground font-medium">No read notifications</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
