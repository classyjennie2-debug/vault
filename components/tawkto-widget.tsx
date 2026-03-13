'use client';

import { useEffect } from 'react';

export default function TawkToWidget() {
  useEffect(() => {
    // Initialize TawkTo only when explicitly called
    const initTawkTo = () => {
      const script = document.createElement('script');
      script.src = 'https://embed.tawk.to/YOUR_TAWK_ID/default';
      script.async = true;
      script.charset = 'UTF-8';
      script.onload = () => {
        // Hide widget by default
        if (window.Tawk_API) {
          window.Tawk_API.hideWidget();
        }
      };
      document.body.appendChild(script);
    };

    // Listen for custom event to show chat
    const handleStartChat = () => {
      if (window.Tawk_API) {
        window.Tawk_API.showWidget();
        window.Tawk_API.toggle();
      } else {
        // If script not loaded, load it first
        initTawkTo();
        setTimeout(() => {
          if (window.Tawk_API) {
            window.Tawk_API.showWidget();
            window.Tawk_API.toggle();
          }
        }, 500);
      }
    };

    // Make it globally accessible
    (window as any).startTawkChat = handleStartChat;

    return () => {
      delete (window as any).startTawkChat;
    };
  }, []);

  return null;
}
