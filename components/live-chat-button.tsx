"use client"

import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"

declare global {
  interface Window {
    Tawk_API?: Record<string, any>
  }
}

export default function LiveChatButton() {
  const handleOpenChat = () => {
    if (window.Tawk_API?.toggle) {
      window.Tawk_API.toggle()
    } else if (window.Tawk_API?.popupMaximize) {
      window.Tawk_API.popupMaximize()
    }
  }

  return (
    <Button
      onClick={handleOpenChat}
      className="w-full gap-2"
      variant="outline"
      size="lg"
    >
      <MessageSquare className="h-4 w-4" />
      Start Live Chat with Support
    </Button>
  )
}
