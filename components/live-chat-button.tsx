"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageSquare, Loader2, X } from "lucide-react"
import { loadTawkChat } from "./tawk-chat"

declare global {
  interface Window {
    Tawk_API?: Record<string, any>
  }
}

export default function LiveChatButton() {
  const [loading, setLoading] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)

  const handleToggleChat = async () => {
    setLoading(true)
    try {
      console.log("[Tawk] User clicked: Start Live Chat")
      
      // Load and initialize Tawk
      await loadTawkChat()
      
      // Tawk should now be open, update state
      setIsChatOpen(true)
      
      console.log("[Tawk] Live chat toggled successfully")
    } catch (error) {
      console.error("[Tawk] Error toggling chat:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCloseChat = () => {
    try {
      console.log("[Tawk] User clicked: Close Live Chat")
      
      // Close the chat by toggling it again
      if (window.Tawk_API && typeof window.Tawk_API.toggle === 'function') {
        window.Tawk_API.toggle()
      }
      
      setIsChatOpen(false)
      console.log("[Tawk] Chat closed")
    } catch (error) {
      console.error("[Tawk] Error closing chat:", error)
      setIsChatOpen(false)
    }
  }

  const handleClick = () => {
    if (isChatOpen) {
      handleCloseChat()
    } else {
      handleToggleChat()
    }
  }

  return (
    <Button
      onClick={handleClick}
      className="w-full gap-2"
      variant={isChatOpen ? "destructive" : "outline"}
      size="lg"
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isChatOpen ? (
        <X className="h-4 w-4" />
      ) : (
        <MessageSquare className="h-4 w-4" />
      )}
      {loading ? "Loading Chat..." : isChatOpen ? "Close Live Support" : "Start Live Chat with Support"}
    </Button>
  )
}
