let isAPILoaded = false
let apiLoadPromise: Promise<void> | null = null

export function loadYouTubeIframeAPI(): Promise<void> {
  if (isAPILoaded) return Promise.resolve()

  if (!apiLoadPromise) {
    apiLoadPromise = new Promise((resolve) => {
      if (window.YT && window.YT.Player) {
        isAPILoaded = true
        resolve()
      } else {
        const script = document.createElement("script")
        script.src = "https://www.youtube.com/iframe_api"
        document.body.appendChild(script)

        window.onYouTubeIframeAPIReady = () => {
          isAPILoaded = true
          resolve()
        }
      }
    })
  }

  return apiLoadPromise
}
