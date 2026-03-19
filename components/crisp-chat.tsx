"use client"

declare global {
  interface Window {
    $crisp?: any
    CRISP_WEBSITE_ID?: string
  }
}

let isCrispLoaded = false

/**
 * Utility function to load Crisp chat script on-demand
 * Called when user clicks "Start Live Chat"
 */
export function loadCrispChat() {
  return new Promise<void>((resolve) => {
    const crispWebsiteId = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID

    console.log("[Crisp] loadCrispChat called")
    console.log("[Crisp] Website ID:", crispWebsiteId)

    if (!crispWebsiteId) {
      console.warn("[Crisp] NEXT_PUBLIC_CRISP_WEBSITE_ID not configured")
      resolve()
      return
    }

    // If already loaded, just open it
    if (isCrispLoaded && window.$crisp) {
      console.log("[Crisp] Already loaded, opening widget")
      window.$crisp.push(["do", "chat:open"])
      resolve()
      return
    }

    try {
      // Initialize Crisp variables BEFORE loading script
      window.$crisp = []
      window.CRISP_WEBSITE_ID = crispWebsiteId

      // Create and append the Crisp script
      const script = document.createElement("script")
      script.async = true
      script.src = "https://client.crisp.chat/l.js"
      script.type = "text/javascript"
      
      console.log("[Crisp] Creating script tag")
      
      script.onload = () => {
        console.log("[Crisp] Script loaded successfully")
        isCrispLoaded = true
        
        // Wait for Crisp API to be ready
        let waitCount = 0
        const waitForCrispAPI = setInterval(() => {
          waitCount++
          
          // Check if Crisp API is ready
          if (window.$crisp && typeof window.$crisp.push === 'function') {
            clearInterval(waitForCrispAPI)
            console.log("[Crisp] API ready, opening chat")
            window.$crisp.push(["do", "chat:open"])
            resolve()
          } else if (waitCount > 20) {
            // Give up after 4 seconds
            clearInterval(waitForCrispAPI)
            console.warn("[Crisp] API not ready after 4 seconds")
            resolve()
          }
        }, 200)
      }

      script.onerror = () => {
        console.error("[Crisp] Failed to load Crisp script")
        resolve()
      }

      document.head.appendChild(script)
      console.log("[Crisp] Script appended to document head")
    } catch (error) {
      console.error("[Crisp] Error loading script:", error)
      resolve()
    }
  })
}

export default function CrispChat() {
  // This component is no longer needed since Crisp loads on-demand
  // Kept for compatibility
  return null
}
