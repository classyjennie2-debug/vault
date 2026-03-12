"use client"

import { useEffect } from "react"

declare global {
  interface Window {
    Tawk_API?: Record<string, any>
    Tawk_LoadStart?: Date
  }
}

export default function TawkChat() {
  useEffect(() => {
    // Initialize Tawk.to widget
    const tawkPropertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID
    
    if (!tawkPropertyId) {
      console.warn("Tawk.to property ID not set. Please set NEXT_PUBLIC_TAWK_PROPERTY_ID in .env.local")
      return
    }

    // Initialize window properties
    if (!window.Tawk_API) {
      window.Tawk_API = {}
    }
    window.Tawk_LoadStart = new Date()

    // Create and append the Tawk script
    const script = document.createElement("script")
    script.async = true
    script.src = `https://embed.tawk.to/${tawkPropertyId}/default`
    script.charset = "UTF-8"
    script.setAttribute("crossorigin", "*")
    
    document.body.appendChild(script)

    return () => {
      // Cleanup if needed
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  return null
}
