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

    console.log("🔵 [Tawk] loadTawkChat called")
    console.log("🔵 [Tawk] Property ID:", tawkPropertyId)

    if (!tawkPropertyId) {
      console.warn("🔴 [Tawk] NEXT_PUBLIC_TAWK_PROPERTY_ID not configured")
      resolve()
      return
    }

    // If already loaded, just resolve and show if not visible
    if (isTawkLoaded && window.Tawk_API) {
      console.log("🔵 [Tawk] Already loaded, maximizing widget")
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
      
      console.log("🔵 [Tawk] Creating script tag for:", script.src)
      
      script.onload = () => {
        console.log("🔵 [Tawk] Script loaded successfully")
        isTawkLoaded = true
        
        // Wait for Tawk API to be initialized by the script
        let waitCount = 0
        const waitForTawkAPI = setInterval(() => {
          waitCount++
          console.log(`🔵 [Tawk] Waiting for API initialization... attempt ${waitCount}`)
          
          if (window.Tawk_API && (window.Tawk_API.maximize || window.Tawk_API.toggleWidget)) {
            clearInterval(waitForTawkAPI)
            console.log("🔵 [Tawk] API ready, showing widget")
            
            if (window.Tawk_API.maximize) {
              window.Tawk_API.maximize()
            } else if (window.Tawk_API.toggleWidget) {
              window.Tawk_API.toggleWidget()
            }
            resolve()
          } else if (waitCount > 15) {
            clearInterval(waitForTawkAPI)
            console.warn("🟡 [Tawk] API not ready after waiting, resolving anyway")
            resolve()
          }
        }, 200)
      }

      script.onerror = () => {
        console.error("🔴 [Tawk] Failed to load Tawk script from:", script.src)
        resolve()
      }

      document.body.appendChild(script)
      console.log("🔵 [Tawk] Script appended to document")
    } catch (error) {
      console.error("🔴 [Tawk] Error loading script:", error)
      resolve()
    }
  })
}

export default function TawkChat() {
  // This component is no longer needed since Tawk loads on-demand
  // Kept for compatibility
  return null
}
