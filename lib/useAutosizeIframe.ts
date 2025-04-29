/* lib/useAutosizeIframe.ts */
'use client';

import { useEffect } from 'react';

/** Notifies the parent window of the current document height */
export default function useAutosizeIframe(deps: unknown[] = []) {
  useEffect(() => {
    const postHeight = () => {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(
          { type: 'resize', height: document.body.scrollHeight },
          '*'
        );
      }
    };

    // initial fire
    postHeight();

    // fire on window resize
    window.addEventListener('resize', postHeight);

    // fire whenever the DOM mutates
    const obs = new MutationObserver(postHeight);
    obs.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    return () => {
      window.removeEventListener('resize', postHeight);
      obs.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);               // pass whatever should trigger a re-measurement
}
