"use client"

import { Bell, Zap, AlertCircle, CheckCircle, Info, X, RefreshCw, Check } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Notification } from "@/lib/types"

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [updatingNotification, setUpdatingNotification] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchNotifications = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/notifications")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.map((notif: any) => ({
          ...notif,
          isRead: Boolean(notif.isRead)
        })))
        setLastUpdated(new Date())
      } else {
        console.error("Failed to fetch notifications")
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
      setErrorMessage("Unable to load notifications right now.")
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch on initial mount
  useEffect(() => {
    fetchNotifications()
  }, [])

  // Poll only when the sheet is open (every 12s)
  useEffect(() => {
    if (!isOpen) return
    const interval = setInterval(() => {
      fetchNotifications()
    }, 12000)
    return () => clearInterval(interval)
  }, [isOpen])

  // Refetch whenever sheet opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  const unreadCount = notifications.filter((n) => !n.isRead).length
  const unreadNotifications = notifications.filter((n) => !n.isRead)
  const readNotifications = notifications.filter((n) => n.isRead)

  const markAllAsRead = async () => {
    if (notifications.length === 0) return
    setErrorMessage("")
    const ids = unreadNotifications.map((n) => n.id)
    // optimistic update
    setNotifications(prev => prev.map(n => ids.includes(n.id) ? { ...n, isRead: true } : n))
    try {
      await Promise.all(ids.map(id =>
        fetch(`/api/notifications/${id}/read`, { method: "PUT", headers: { "Content-Type": "application/json" } })
      ))
      await fetchNotifications()
    } catch (err) {
      setErrorMessage("Failed to mark all as read")
      // best-effort refetch
      fetchNotifications()
    }
  }

  const clearRead = () => {
    setNotifications(unreadNotifications)
  }

  const groupedNotifications = (items: Notification[]) => {
    const groups: Record<string, Notification[]> = {}
    items.forEach((n) => {
      const key = n.timestamp ? new Date(n.timestamp).toDateString() : "Other"
      groups[key] = groups[key] ? [...groups[key], n] : [n]
    })
    return Object.entries(groups)
  }

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    
    setUpdatingNotification(id)
    setErrorMessage("")
    
    // Immediately update local state to reflect the change
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ))
    
    try {
      const response = await fetch("/api/notifications/" + id + "/read", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMsg = errorData.error || "Failed to mark notification as read"
        console.error("API Error:", errorMsg)
        setErrorMessage(errorMsg)
        // Revert the local state if the API call fails
        setNotifications(prev => prev.map(n => 
          n.id === id ? { ...n, isRead: false } : n
        ))
      } else {
        // On success, refetch to confirm server state and catch any missed updates
        console.log("Notification marked as read - refetching to confirm")
        await new Promise(resolve => setTimeout(resolve, 200))
        await fetchNotifications()
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
      setErrorMessage("Network error - notification update failed")
      // Revert the local state on network error
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, isRead: false } : n
      ))
    } finally {
      setUpdatingNotification(null)
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
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => fetchNotifications()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              <span className="sr-only">Refresh</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mr-2"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close notifications</span>
            </Button>
          </div>
        </SheetHeader>

        {errorMessage && (
          <div className="px-6 py-3 bg-red-50 dark:bg-red-950/30 border-b border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-sm rounded-none">
            {errorMessage}
          </div>
        )}

        <Tabs defaultValue="unread" className="flex-1 flex flex-col">
          <div className="sticky top-16 z-10 mx-6 mt-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <div className="flex items-center justify-between px-3 py-2">
              <TabsList className="grid grid-cols-2 w-2/3">
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
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" disabled={unreadCount === 0 || isLoading} onClick={markAllAsRead} className="text-xs">
                  <Check className="h-3 w-3 mr-1" /> Mark all read
                </Button>
                <Button variant="ghost" size="sm" disabled={readNotifications.length === 0} onClick={clearRead} className="text-xs">
                  Clear read
                </Button>
              </div>
            </div>
          </div>

          <TabsContent value="unread" className="flex-1 overflow-y-auto">
            {unreadNotifications.length > 0 ? (
              <div className="divide-y divide-border/20">
                {groupedNotifications(unreadNotifications).map(([date, items]) => (
                  <div key={date} className="pb-2">
                    <p className="px-4 pt-3 text-[11px] uppercase tracking-wide text-muted-foreground/80">{date}</p>
                    {items.map((notification, idx) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        idx={idx}
                      />
                    ))}
                  </div>
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
                {groupedNotifications(readNotifications).map(([date, items]) => (
                  <div key={date} className="pb-2">
                    <p className="px-4 pt-3 text-[11px] uppercase tracking-wide text-muted-foreground/80">{date}</p>
                    {items.map((notification, idx) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        idx={idx}
                      />
                    ))}
                  </div>
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

        <div className="px-6 py-3 text-xs text-muted-foreground border-t border-border/30">
          {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : "Waiting for updates..."}
        </div>
      </SheetContent>
    </Sheet>
  )
}
