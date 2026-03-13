"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageSquare, Loader2 } from "lucide-react"
import { loadTawkChat } from "./tawk-chat"

declare global {
  interface Window {
    Tawk_API?: Record<string, any>
  }
}

export default function LiveChatButton() {
  const [loading, setLoading] = useState(false)

  const handleOpenChat = async () => {
    setLoading(true)
    try {
      await loadTawkChat()
      // Open the chat widget
      if (window.Tawk_API?.toggle) {
        window.Tawk_API.toggle()
      } else if (window.Tawk_API?.popupMaximize) {
        window.Tawk_API.popupMaximize()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleOpenChat}
      className="w-full gap-2"
      variant="outline"
      size="lg"
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <MessageSquare className="h-4 w-4" />
      )}
      {loading ? "Loading Chat..." : "Start Live Chat with Support"}
    </Button>
  )
}
