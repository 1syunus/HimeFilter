import { useEffect, useRef, useState } from "react";

export interface UseYouTubePlayerOptions {
    hasVideo: boolean
    timeoutMs?: number
}

export function useYouTubePlayer({hasVideo, timeoutMs = 5000}: UseYouTubePlayerOptions) {
    // vid states
    const [ytPlayer, setYtPlayer] = useState<YT.Player | null>(null)
    const [isMuted, setIsMuted] = useState<boolean>(true)
    const [isPlaying, setIsPlaying] = useState<boolean>(true)
    const [videoError, setVideoError] = useState<boolean>(false)
    const [videoLoaded, setVideoLoaded] = useState<boolean>(false)
    const videoLoadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // useEffect for vid timeout
    useEffect(() => {
        if (videoLoadTimeoutRef.current) {
            clearTimeout(videoLoadTimeoutRef.current)
        }

        if (hasVideo && !videoLoaded) {
            videoLoadTimeoutRef.current = setTimeout(() => {
                console.warn("Hero video timed out loading. Falling back to image.")
                setVideoError(true)
                setVideoLoaded(true)
            }, timeoutMs)
        }

        // cleanup function
        return () => {
            if (videoLoadTimeoutRef.current) {
                clearTimeout(videoLoadTimeoutRef.current)
            }
        }
    }, [hasVideo, videoLoaded, timeoutMs])

    // load handler
    const handleVideoLoad = () => {
      // clear timeout on successful load
      if (videoLoadTimeoutRef.current) clearTimeout(videoLoadTimeoutRef.current)

      setTimeout(() => {
        setVideoLoaded(true)
      }, 500)

      const onYouTubeIframeAPIReady = () => {
        new window.YT.Player("hero-video", {
          events: {
            onReady: (event: YT.PlayerEvent) => {
                console.log("player ready")
                setYtPlayer(event.target)
                console.log("onReady: ytPlayer is", event.target)
                event.target.mute()
                setIsMuted(true)
            },
            onStateChange: (event: YT.OnStateChangeEvent) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true)
              } else if (event.data === window.YT.PlayerState.PAUSED) {
                setIsPlaying(false)
              }
            }
          },
        })
      }

      if (window.YT && window.YT.Player) {
        onYouTubeIframeAPIReady()
      } else {
        window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady
      }
    }
    // error handler
    const handleVideoError = () => {
        console.error("iframe failed to load or encountered an error.")
        setVideoError(true)
        // stop try loading
        setVideoLoaded(true)
        if (videoLoadTimeoutRef.current) clearTimeout(videoLoadTimeoutRef.current)
    }

    // play/pause
    const togglePlayPause = () => {
        if (!ytPlayer) return

        try {
            if (isPlaying) {
                ytPlayer.pauseVideo()
                console.log("Pause vid")
            } else {
                ytPlayer.playVideo()
                console.log("Play vid")
            }
        } catch (error) {
            console.error("Toggle play/pause error: ", error)
        }
    }

    // mute/unmute
    const toggleMute = () => {
        if (!ytPlayer) {
            setIsMuted(prev => !prev)
            return
        }

        if (isMuted) {
            ytPlayer.unMute()
            setIsMuted(false)
            console.log("Unmute vid")
        } else {
            ytPlayer.mute()
            setIsMuted(true)
            console.log("Unmute vid")
        }
    }

    return {
        ytPlayer, isMuted, videoError, videoLoaded,
        handleVideoLoad, handleVideoError, togglePlayPause, toggleMute,
    }
}