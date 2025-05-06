"use client"

import { usePostHog } from 'posthog-js/react'
import { useEffect, useCallback } from 'react'

export function usePostHogEvent() {
  const posthog = usePostHog()

  const captureEvent = useCallback((eventName: string, properties?: Record<string, any>) => {
    if (posthog && typeof window !== 'undefined') {
      // Add common properties
      const enhancedProperties = {
        ...properties,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      }

      // Add a small delay to ensure PostHog is ready
      setTimeout(() => {
        posthog.capture(eventName, enhancedProperties)
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`PostHog event captured: ${eventName}`, enhancedProperties)
        }
      }, 100)
    }
  }, [posthog])

  return { captureEvent }
} 