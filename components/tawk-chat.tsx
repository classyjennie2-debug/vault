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

    console.log("[Tawk] loadTawkChat called")
    console.log("[Tawk] Property ID:", tawkPropertyId)

    if (!tawkPropertyId) {
      console.warn("[Tawk] NEXT_PUBLIC_TAWK_PROPERTY_ID not configured")
      resolve()
      return
    }

    // If already loaded, just open it
    if (isTawkLoaded && window.Tawk_API) {
      console.log("[Tawk] Already loaded, opening widget")
      console.log("[Tawk] Available methods:", Object.keys(window.Tawk_API).filter(k => typeof window.Tawk_API![k] === 'function'))
      
      if (typeof window.Tawk_API.toggle === 'function') {
        window.Tawk_API.toggle()
      }
      resolve()
      return
    }

    try {
      // Initialize window properties for Tawk BEFORE loading script
      if (!window.Tawk_API) {
        window.Tawk_API = {}
      }
      window.Tawk_LoadStart = new Date()

      // Create and append the Tawk script
      const script = document.createElement("script")
      script.async = true
      script.src = `https://embed.tawk.to/${tawkPropertyId}`
      script.charset = "UTF-8"
      script.setAttribute("crossorigin", "*")
      script.type = "text/javascript"
      
      console.log("[Tawk] Creating script tag for:", script.src)
      
      script.onload = () => {
        console.log("[Tawk] Script loaded successfully")
        isTawkLoaded = true
        
        // The Tawk script auto-initializes. Just wait a moment and then open it
        let waitCount = 0
        const waitForTawkAPI = setInterval(() => {
          waitCount++
          
          // Check if the actual toggle method exists
          if (window.Tawk_API && typeof window.Tawk_API.toggle === 'function') {
            clearInterval(waitForTawkAPI)
            console.log("[Tawk] API ready with toggle method")
            console.log("[Tawk] Calling toggle() to open widget")
            window.Tawk_API.toggle()
            resolve()
          } else if (waitCount > 20) {
            // Give up after 4 seconds
            clearInterval(waitForTawkAPI)
            if (window.Tawk_API) {
              console.warn("[Tawk] API exists but toggle not ready, available:", Object.keys(window.Tawk_API).filter(k => typeof window.Tawk_API![k] === 'function'))
            } else {
              console.warn("[Tawk] API not initialized after 4 seconds")
            }
            resolve()
          }
        }, 200)
      }

      script.onerror = () => {
        console.error("[Tawk] Failed to load Tawk script from:", script.src)
        resolve()
      }

      document.body.appendChild(script)
      console.log("[Tawk] Script appended to document")
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
