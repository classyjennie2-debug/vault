"use client"

declare global {
  interface Window {
    $crisp?: any
    CRISP_WEBSITE_ID?: string
  }
}

let isCrispLoaded = false

/**
 * Utility function to open Crisp chat
 * Script is preloaded in the main layout for faster access
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

    // Initialize Crisp variables if not already set
    if (!window.$crisp) {
      window.$crisp = []
    }
    if (!window.CRISP_WEBSITE_ID) {
      window.CRISP_WEBSITE_ID = crispWebsiteId
    }

    // Wait for Crisp API to become available
    let waitCount = 0
    const maxWaitTime = 30 // 6 seconds max wait
    
    const checkCrispReady = setInterval(() => {
      waitCount++
      
      // Check if Crisp API is ready
      if (window.$crisp && typeof window.$crisp.push === 'function') {
        clearInterval(checkCrispReady)
        console.log("[Crisp] API ready, opening chat")
        window.$crisp.push(["do", "chat:show"])
        window.$crisp.push(["do", "chat:open"])
        isCrispLoaded = true
        resolve()
      } else if (waitCount > maxWaitTime) {
        // Give up after 6 seconds
        clearInterval(checkCrispReady)
        console.warn("[Crisp] API not ready after 6 seconds, attempting anyway")
        if (window.$crisp && typeof window.$crisp.push === 'function') {
          window.$crisp.push(["do", "chat:show"])
          window.$crisp.push(["do", "chat:open"])
        }
        isCrispLoaded = true
        resolve()
      }
    }, 200)
  })
}

export default function CrispChat() {
  // This component is no longer needed since Crisp loads on-demand
  // Kept for compatibility
  return null
}
