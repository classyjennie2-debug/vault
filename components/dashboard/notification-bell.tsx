"use client"

import { Bell, X, Trash2 } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import type { Notification } from "@/lib/types"

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications")
      if (response.ok) {
        const data = await response.json()
        const normalized = Array.isArray(data) ? data.map((raw: any) => ({
          id: String(raw.id ?? ""),
          userId: String(raw.userId ?? ""),
          title: String(raw.title ?? ""),
          message: String(raw.message ?? ""),
          type: (["success", "info", "warning", "error"].includes(raw.type) ? raw.type : "info") as any,
          isRead: Boolean(raw.isRead),
          timestamp: String(raw.timestamp ?? new Date().toISOString()),
          actionUrl: raw.actionUrl ? String(raw.actionUrl) : undefined,
        })) : []
        setNotifications(normalized)
        const newUnreadCount = normalized.filter((n: any) => !n.isRead).length
        setUnreadCount(newUnreadCount)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 15000)
    return () => clearInterval(interval)
  }, [])

  const handleSheetOpen = async (open: boolean) => {
    setIsOpen(open)
    
    if (open) {
      // Mark all as read and reset count when opening
      const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id)
      
      if (unreadIds.length > 0) {
        for (const id of unreadIds) {
          try {
            await fetch(`/api/notifications/${id}/read`, { method: "PUT" })
          } catch (err) {
            console.error("Error marking notification as read:", err)
          }
        }
        
        // Update local state
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        setUnreadCount(0)
      }
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/delete`, { method: "DELETE" })
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (error) {
      console.error("Error deleting notification:", error)
    }
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      success: "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-400",
      warning: "bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-400",
      error: "bg-red-500/15 border-red-500/30 text-red-700 dark:text-red-400",
      info: "bg-blue-500/15 border-blue-500/30 text-blue-700 dark:text-blue-400",
    }
    return colors[type] || colors.info
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification)
    setModalOpen(true)
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={handleSheetOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative group h-9 w-9 sm:h-11 sm:w-11 rounded-lg"
          >
            <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-5 w-5 text-xs font-bold text-white bg-red-500 rounded-full">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </SheetTrigger>

        <SheetContent className="w-full sm:w-[420px] flex flex-col p-0">
          <SheetHeader className="border-b px-6 py-4 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <SheetTitle>Notifications</SheetTitle>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {notifications.length} {notifications.length === 1 ? "item" : "items"}
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close notifications"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center gap-2">
                <Bell className="h-12 w-12 text-muted-foreground/20" />
                <p className="text-muted-foreground text-sm">No notifications yet</p>
                <p className="text-muted-foreground/60 text-xs">You'll see updates here</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification, idx) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-accent/30 transition-colors animate-in fade-in slide-in-from-top duration-300 cursor-pointer`}
                    style={{ animationDelay: `${idx * 50}ms` }}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3 items-start">
                      <div className={`p-2 rounded-lg text-sm font-semibold border flex-shrink-0 ${getTypeColor(notification.type)}`}>
                        {notification.type === "success" && "✓"}
                        {notification.type === "warning" && "⚠"}
                        {notification.type === "error" && "✕"}
                        {notification.type === "info" && "ℹ"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-foreground line-clamp-1">
                          {notification.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground/50 mt-2">
                          {formatTime(notification.timestamp)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notification.id)
                        }}
                        className="flex-shrink-0 text-muted-foreground hover:text-destructive transition-colors p-1"
                        aria-label="Delete notification"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="border-t px-6 py-3 text-xs text-muted-foreground/60 text-center">
              Pull to refresh
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Notification Detail Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className={`p-2 rounded-lg text-sm font-semibold border ${getTypeColor(selectedNotification?.type || "info")}`}>
                {selectedNotification?.type === "success" && "✓"}
                {selectedNotification?.type === "warning" && "⚠"}
                {selectedNotification?.type === "error" && "✕"}
                {selectedNotification?.type === "info" && "ℹ"}
              </div>
              <span>{selectedNotification?.title}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="text-sm text-foreground whitespace-pre-wrap">
              {selectedNotification?.message}
            </div>
            <div className="text-xs text-muted-foreground">
              {selectedNotification?.timestamp && formatTime(selectedNotification.timestamp)}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (selectedNotification) {
                  deleteNotification(selectedNotification.id)
                  setModalOpen(false)
                }
              }}
              className="w-full"
            >
              Delete
            </Button>
            <DialogClose asChild>
              <Button className="w-full">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
