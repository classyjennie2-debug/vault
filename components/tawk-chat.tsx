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
      console.warn("[Tawk] NEXT_PUBLIC_TAWK_PROPERTY_ID not configured")
      resolve()
      return
    }

    // If already loaded, just resolve
    if (isTawkLoaded && window.Tawk_API) {
      console.log("[Tawk] Already loaded, showing widget")
      if (window.Tawk_API?.maximize) {
        window.Tawk_API.maximize()
      } else if (window.Tawk_API?.toggleWidget) {
        window.Tawk_API.toggleWidget()
      }
      resolve()
      return
    }

    try {
      // Initialize window properties for Tawk BEFORE loading script
      window.Tawk_API = window.Tawk_API || {}
      window.Tawk_LoadStart = new Date()

      // Create and append the Tawk script
      const script = document.createElement("script")
      script.async = true
      script.src = `https://embed.tawk.to/${tawkPropertyId}`
      script.charset = "UTF-8"
      script.setAttribute("crossorigin", "*")
      script.type = "text/javascript"
      
      script.onload = () => {
        console.log("[Tawk] Script loaded successfully")
        isTawkLoaded = true
        
        // Wait a bit for Tawk API to be ready, then show widget
        setTimeout(() => {
          if (window.Tawk_API?.maximize) {
            window.Tawk_API.maximize()
          } else if (window.Tawk_API?.toggleWidget) {
            window.Tawk_API.toggleWidget()
          }
          resolve()
        }, 500)
      }

      script.onerror = () => {
        console.error("[Tawk] Failed to load Tawk script")
        resolve()
      }

      document.body.appendChild(script)
      console.log("[Tawk] Script loading from:", script.src)
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
