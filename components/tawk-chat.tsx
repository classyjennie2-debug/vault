"use client"

declare global {
  interface Window {
    Tawk_API?: Record<string, any>
    Tawk_LoadStart?: Date
  }
}

let isTawkLoaded = false

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

    // If already loaded, just resolve
    if (isTawkLoaded && window.Tawk_API) {
      resolve()
      return
    }

    try {
      // Initialize window properties for Tawk
      window.Tawk_API = {
        onLoad: function() {
          console.log("[Tawk] Loaded successfully")
          isTawkLoaded = true
        },
        onStatusChange: function(status: string) {
          console.log("[Tawk] Status changed to:", status)
        },
        onAgentJoin: function(data: any) {
          console.log("[Tawk] Agent joined:", data)
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
      
      script.onload = () => {
        isTawkLoaded = true
        resolve()
      }

      script.onerror = () => {
        resolve()
      }

      document.body.appendChild(script)
    } catch (error) {
      console.error("[Tawk] Error loading script:", error)
      resolve()
    }
  })
}

export default function TawkChat() {
  // This component is no longer needed since Tawk loads on-demand
  // Kept for compatibility
  return null
}
