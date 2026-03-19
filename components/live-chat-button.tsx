"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageSquare, Loader2, X } from "lucide-react"
import { loadCrispChat } from "./crisp-chat"

declare global {
  interface Window {
    $crisp?: any
  }
}

export default function LiveChatButton() {
  const [loading, setLoading] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)

  const handleToggleChat = async () => {
    setLoading(true)
    try {
      console.log("[Crisp] User clicked: Start Live Chat")
      
      // Load and initialize Crisp
      await loadCrispChat()
      
      // Crisp should now be open, update state
      setIsChatOpen(true)
      
      console.log("[Crisp] Live chat opened successfully")
    } catch (error) {
      console.error("[Crisp] Error opening chat:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCloseChat = () => {
    try {
      console.log("[Crisp] User clicked: Close Live Chat")
      
      // Close the chat
      if (window.$crisp && typeof window.$crisp.push === 'function') {
        window.$crisp.push(["do", "chat:close"])
      }
      
      setIsChatOpen(false)
      console.log("[Crisp] Chat closed")
    } catch (error) {
      console.error("[Crisp] Error closing chat:", error)
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
