"use client"

import { useEffect } from "react"

declare global {
  interface Window {
    Tawk_API?: Record<string, any>
    Tawk_LoadStart?: Date
  }
}

/**
 * Utility function to load Tawk.to script on-demand
 * Called when user clicks "Start Live Chat"
 */
export function loadTawkChat() {
  return new Promise<void>((resolve) => {
    const tawkPropertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID

    if (!tawkPropertyId) {
      resolve()
      return
    }

    // If already loaded, just show it
    if (window.Tawk_API) {
      if (window.Tawk_API.showWidget) {
        window.Tawk_API.showWidget()
      }
      if (window.Tawk_API.toggle) {
        window.Tawk_API.toggle()
      } else if (window.Tawk_API.popupMaximize) {
        window.Tawk_API.popupMaximize()
      }
      resolve()
      return
    }

    try {
      // Initialize window properties for Tawk
      window.Tawk_API = {
        onLoad: function() {
          // Tawk has loaded - hide by default
          if (window.Tawk_API?.hideWidget) {
            window.Tawk_API.hideWidget()
          }
        },
        onStatusChange: function(status: string) {
          // Status changed
        }
      }

      window.Tawk_LoadStart = new Date()

      // Create and append the Tawk script
      const script = document.createElement("script")
      script.async = true
      script.src = `https://embed.tawk.to/${tawkPropertyId}/default`
      script.charset = "UTF-8"
      script.setAttribute("crossorigin", "*")
      script.type = "text/javascript"
      
      // Track script load state
      script.onload = () => {
        resolve()
      }

      script.onerror = () => {
        resolve()
      }

      document.body.appendChild(script)
    } catch (error) {
      resolve()
    }
  })
}

export default function TawkChat() {
  // This component is no longer needed since Tawk loads on-demand
  // Kept for compatibility
  return null
}
