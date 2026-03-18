"use client"

import { useState, useEffect } from "react"
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

  // Listen for widget state changes from Tawk API
  useEffect(() => {
    const checkWidgetState = () => {
      if (window.Tawk_API?.isWidgetVisible) {
        const isVisible = window.Tawk_API.isWidgetVisible()
        setIsChatOpen(isVisible === true)
      }
    }

    // Check every 500ms to sync state with Tawk widget
    const interval = setInterval(checkWidgetState, 500)
    return () => clearInterval(interval)
  }, [])

  const handleToggleChat = async () => {
    if (isChatOpen) {
      // Close the chat
      try {
        if (window.Tawk_API?.minimizeWidget) {
          window.Tawk_API.minimizeWidget()
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
        console.log("Starting live chat load...")
        await loadTawkChat()
        
        // Wait for Tawk to be ready
        await new Promise(resolve => setTimeout(resolve, 500))
        
        console.log("Tawk API available:", !!window.Tawk_API)
        console.log("Tawk API methods:", window.Tawk_API ? Object.keys(window.Tawk_API) : "none")
        
        // Open the chat widget
        if (window.Tawk_API?.maximize) {
          window.Tawk_API.maximize()
          setIsChatOpen(true)
        } else if (window.Tawk_API?.maximizeWidget) {
          window.Tawk_API.maximizeWidget()
          setIsChatOpen(true)
        } else if (window.Tawk_API?.showWidget) {
          window.Tawk_API.showWidget()
          setIsChatOpen(true)
        } else {
          console.warn("No maximize method found on Tawk API. Available methods:", Object.keys(window.Tawk_API || {}))
          setIsChatOpen(true)
        }
      } catch (error) {
        console.error("Error loading chat:", error)
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
