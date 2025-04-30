'use client';

import { useEffect, RefObject } from 'react';

/**
 * Hook that listens for resize messages from an iframe and adjusts its height
 * Works in conjunction with useAutosizeIframe
 */
export default function useIframeResizer(iframeRef: RefObject<HTMLIFrameElement | null>) {
  useEffect(() => {
    if (!iframeRef.current) return;

    const handleMessage = (event: MessageEvent) => {
      // Make sure the message is a resize event
      if (event.data && event.data.type === 'resize' && typeof event.data.height === 'number') {
        // Set the iframe height to the received height
        if (iframeRef.current) {
          iframeRef.current.style.height = `${event.data.height}px`;
        }
      }
    };

    // Add the message event listener
    window.addEventListener('message', handleMessage);

    // Clean up
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [iframeRef]);
} 