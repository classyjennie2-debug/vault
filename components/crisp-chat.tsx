"use client"

declare global {
  interface Window {
    $crisp?: any
    CRISP_WEBSITE_ID?: string
  }
}

let isCrispLoaded = false
let scriptLoading = false

/**
 * Utility function to load Crisp chat script on-demand
 * Properly initializes variables BEFORE script loads
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

    // If already loaded and ready, just open it
    if (isCrispLoaded && window.$crisp && typeof window.$crisp.push === 'function') {
      console.log("[Crisp] Already loaded, opening chat")
      window.$crisp.push(["do", "chat:show"])
      window.$crisp.push(["do", "chat:open"])
      resolve()
      return
    }

    // If script is already loading, wait for it
    if (scriptLoading) {
      console.log("[Crisp] Script already loading, waiting...")
      const waitForLoad = setInterval(() => {
        if (isCrispLoaded && window.$crisp && typeof window.$crisp.push === 'function') {
          clearInterval(waitForLoad)
          console.log("[Crisp] Script loaded, opening chat")
          window.$crisp.push(["do", "chat:show"])
          window.$crisp.push(["do", "chat:open"])
          resolve()
        }
      }, 100)
      return
    }

    scriptLoading = true

    try {
      // IMPORTANT: Initialize Crisp variables BEFORE script loads
      // This is required for Crisp to work properly
      if (!window.$crisp) {
        window.$crisp = []
      }
      window.CRISP_WEBSITE_ID = crispWebsiteId

      console.log("[Crisp] Creating and loading script")

      // Create the script element
      const script = document.createElement("script")
      script.type = "text/javascript"
      script.src = "https://client.crisp.chat/l.js"
      script.async = true

      script.onload = () => {
        console.log("[Crisp] Script loaded successfully")
        isCrispLoaded = true
        scriptLoading = false

        // Wait a moment for Crisp API to initialize
        let attempts = 0
        const checkReady = setInterval(() => {
          attempts++
          
          if (window.$crisp && typeof window.$crisp.push === 'function') {
            clearInterval(checkReady)
            console.log("[Crisp] API ready, opening chat")
            window.$crisp.push(["do", "chat:show"])
            window.$crisp.push(["do", "chat:open"])
            resolve()
          } else if (attempts > 50) {
            // Timeout after 5 seconds
            clearInterval(checkReady)
            console.warn("[Crisp] Timeout waiting for API, resolving anyway")
            resolve()
          }
        }, 100)
      }

      script.onerror = () => {
        console.error("[Crisp] Failed to load script")
        scriptLoading = false
        resolve()
      }

      // Append script to document
      document.head.appendChild(script)
      console.log("[Crisp] Script appended to head")
    } catch (error) {
      console.error("[Crisp] Error loading chat:", error)
      scriptLoading = false
      resolve()
    }
  })
}

export default function CrispChat() {
  return null
}
