"use client"

import { Bell, Zap, TrendingUp, AlertCircle, CheckCircle, Info } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { notifications as mockNotifications } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function NotificationBell() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [selectedNotification, setSelectedNotification] = useState<string | null>(
    null
  )
  const [isOpen, setIsOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.isRead).length
  const unreadNotifications = notifications.filter((n) => !n.isRead)
  const readNotifications = notifications.filter((n) => n.isRead)

  const handleMarkAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
  }

  const getNotificationColor = (
    type: "success" | "info" | "warning" | "error"
  ) => {
    switch (type) {
      case "success":
        return "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30 shadow-lg shadow-green-500/10"
      case "warning":
        return "bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30 shadow-lg shadow-orange-500/10"
      case "error":
        return "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30 shadow-lg shadow-red-500/10"
      case "info":
      default:
        return "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30 shadow-lg shadow-blue-500/10"
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

  const NotificationItem = ({ notification, idx }: { notification: any; idx: number }) => (
    <div
      className="p-4 border-b border-border/30 hover:bg-gradient-to-r hover:from-white/50 hover:to-slate-50/50 dark:hover:from-slate-800/50 dark:hover:to-slate-900/50 cursor-pointer transition-all duration-300 group animate-in fade-in slide-in-from-left duration-500"
      style={{ animationDelay: `${idx * 50}ms` }}
      onClick={() => {
        setSelectedNotification(notification.id)
        handleMarkAsRead(notification.id)
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
            {new Date(notification.timestamp).toLocaleString()}
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
          className="relative group hover:bg-accent/10 transition-all duration-300"
        >
          <div className="relative">
            <Bell className="h-5 w-5 group-hover:text-accent transition-colors duration-300" />
            {unreadCount > 0 && (
              <>
                {/* Pulse animation rings */}
                <div className="absolute inset-0 rounded-full animate-pulse">
                  <div className="absolute inset-0 rounded-full border-2 border-accent/30 -m-1" />
                </div>
                {/* Badge */}
                <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center h-5 w-5 text-xs font-bold leading-none text-white bg-gradient-to-br from-accent to-accent/80 rounded-full shadow-lg shadow-accent/50 animate-in bounce duration-500">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              </>
            )}
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-[420px] flex flex-col p-0">
        <SheetHeader className="border-b border-border/30 px-6 py-4 sticky top-0 z-10 bg-gradient-to-b from-card to-card/50 backdrop-blur-sm">
          <SheetTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-accent" />
            Notifications
          </SheetTitle>
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
