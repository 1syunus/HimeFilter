// global api ready flag and listener
declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void
    YT: any
  }
}

export {}