"use client";
import { useEffect, useState } from "react";

export function useIsExtension(): boolean {
  const [isExtension, setIsExtension] = useState(false)

  useEffect(() => {
    try {
      const insideIframe = window.self !== window.top
      setIsExtension(insideIframe)
    } catch {
      setIsExtension(true)
    }
  }, [])

  return isExtension
}
