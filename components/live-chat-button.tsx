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
      try {
        if (window.Tawk_API?.minimize) {
          window.Tawk_API.minimize()
        } else if (window.Tawk_API?.hideWidget) {
          window.Tawk_API.hideWidget()
        }
        setIsChatOpen(false)
      } catch (error) {
        console.error("Error closing chat:", error)
      }
    } else {
      // Open the chat
      setLoading(true)
      try {
        console.log("🔵 User clicked: Start Live Chat")
        await loadTawkChat()
        
        // Wait for Tawk API to fully initialize
        let attempt = 0
        while (!window.Tawk_API && attempt < 10) {
          await new Promise(resolve => setTimeout(resolve, 200))
          attempt++
        }
        
        console.log("🔵 Tawk API ready:", !!window.Tawk_API)
        
        if (window.Tawk_API) {
          console.log("🔵 Available Tawk methods:", Object.keys(window.Tawk_API).slice(0, 10))
          
          // Try different maximize methods
          if (typeof window.Tawk_API.maximize === 'function') {
            console.log("🔵 Calling maximize()")
            window.Tawk_API.maximize()
          } else if (typeof window.Tawk_API.toggleWidget === 'function') {
            console.log("🔵 Calling toggleWidget()")
            window.Tawk_API.toggleWidget()
          } else if (typeof window.Tawk_API.showWidget === 'function') {
            console.log("🔵 Calling showWidget()")
            window.Tawk_API.showWidget()
          } else {
            console.warn("🔴 No show method found on Tawk API")
            // Force show anyway
            if (window.Tawk_API.API) {
              window.Tawk_API.API.toggle()
            }
          }
        }
        
        setIsChatOpen(true)
      } catch (error) {
        console.error("🔴 Error loading chat:", error)
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
