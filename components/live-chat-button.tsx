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
    if (isChatOpen) {
      // Close the chat
      if (window.Tawk_API?.hideWidget) {
        window.Tawk_API.hideWidget()
      }
      setIsChatOpen(false)
    } else {
      // Open the chat
      setLoading(true)
      try {
        await loadTawkChat()
        // Open the chat widget
        if (window.Tawk_API?.showWidget) {
          window.Tawk_API.showWidget()
        }
        if (window.Tawk_API?.toggle) {
          window.Tawk_API.toggle()
        } else if (window.Tawk_API?.popupMaximize) {
          window.Tawk_API.popupMaximize()
        }
        setIsChatOpen(true)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <Button
      onClick={handleToggleChat}
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
