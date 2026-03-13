"use client"

import { useEffect, useRef } from "react"

declare global {
  interface Window {
    Tawk_API?: Record<string, any>
    Tawk_LoadStart?: Date
  }
}

export default function TawkChat() {
  const scriptLoadedRef = useRef(false)

  useEffect(() => {
    // Prevent multiple script loads
    if (scriptLoadedRef.current) return

    const initTawk = async () => {
      const tawkPropertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID

      if (!tawkPropertyId) {
        if (process.env.NODE_ENV === 'development') {
          console.warn("Tawk.to property ID not configured. Set NEXT_PUBLIC_TAWK_PROPERTY_ID in .env.local")
        }
        return
      }

      try {
        // Initialize window properties for Tawk (but DON'T auto-load the widget)
        if (!window.Tawk_API) {
          window.Tawk_API = {
            onLoad: function() {
              // Tawk has loaded
            },
            onStatusChange: function(status: string) {
              if (process.env.NODE_ENV === 'development') {
                console.log('Tawk status changed:', status)
              }
            }
          }
        }

        window.Tawk_LoadStart = new Date()

        // Create and append the Tawk script (but with hideOnLoad to hide it initially)
        const script = document.createElement("script")
        script.async = true
        script.src = `https://embed.tawk.to/${tawkPropertyId}/default`
        script.charset = "UTF-8"
        script.setAttribute("crossorigin", "*")
        script.type = "text/javascript"
        
        // Track script load state
        script.onload = () => {
          scriptLoadedRef.current = true
          // Hide the chat widget by default
          if (window.Tawk_API?.hideWidget) {
            window.Tawk_API.hideWidget()
          }
          if (process.env.NODE_ENV === 'development') {
            console.log('Tawk.to chat widget loaded (hidden by default)')
          }
        }

        script.onerror = () => {
          if (process.env.NODE_ENV === 'development') {
            console.warn('Failed to load Tawk.to chat widget')
          }
        }

        document.body.appendChild(script)

        return () => {
          // Cleanup: remove script on unmount
          if (script.parentNode) {
            try {
              script.parentNode.removeChild(script)
            } catch (error) {
              // Script might already be removed
            }
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error initializing Tawk.to:', error)
        }
      }
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initTawk, 500)

    return () => clearTimeout(timer)
  }, [])

  return null
}
