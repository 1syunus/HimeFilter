// src/hooks/useIsExtension.ts
"use client";
import { useEffect, useState } from "react";

export function useIsExtension(): boolean {
  const [isExtension, setIsExtension] = useState(false);

  useEffect(() => {
    try {
      const insideIframe = window.self !== window.top;
      setIsExtension(insideIframe);
    } catch {
      // Cross-origin iframes will throw, which means yes, we’re in an iframe
      setIsExtension(true);
    }
  }, []);

  return isExtension;
}
