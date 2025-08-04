"use client"
import React, {useState, useEffect, useRef, useCallback, act} from "react"
import {Search, Filter, X, ChevronDown, Star, Globe, Play, Pause, Menu, Info, Plus, Volume2, VolumeX} from "lucide-react"
import { FilterOptions } from "@/types/index"
import { useDebounce } from "../components/hooks/useDebounce"
import { normalize } from "path"

// type defs
type SortOption = "newest" | "episodes" | "popular" | "alphabetical"

interface Genre {
  id: number
  name: string
}

interface ActiveFilters {
  contentType: string[]
  audioLanguages: string[]
  subtitleLanguages: string[]
  status: string[]
  year: string
  genres: {id: number; name: string}[]
}

interface AnimeData {
  id: number
  title: string
  description: string
  type: string
  audioLanguages: string[]
  subtitleLanguages: string[]
  status: string
  year: number
  episodes: number
  rating: number
  genres: Genre[]
  image: string
  largeImage?: string
  heroImage?: string
  trailerUrl?: string
  duration: string
}

interface FilterOptionsResponse {
  availableAudioLanguages: string[]
  availableSubtitleLanguages: string[]
  availableGenres: Genre[]
  contentTypes: string[]
  statusOptions: string[]
}

interface FilterSectionProps {
  title: string
  options: (string | Genre)[]
  category: keyof ActiveFilters
  activeFilters: ActiveFilters
  onFilterChange: (category: keyof ActiveFilters, value: string | Genre) => void
}


// global api ready flag and listener
declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void
    YT: any
  }
}
// if (typeof window !== "undefined") {
//   window.onYouTubeIframeAPIReady = () => {
//     console.log("GLOBAL: YT Iframe Api is ready")
//     const event = new Event("youtubeapiready")
//     window.dispatchEvent(event)
//   }
// }

// deduplication function
const deduplicateAnime = (animeList: AnimeData[]): AnimeData[] => {
  const seenTitles = new Set<string>()
  const uniqueAnime: AnimeData[] = []

  for (const anime of animeList) {
    const normalizedTitle = anime.title
      .replace(/[:'].*Season \d+| OVA| Movie| Part \d+/gi, '')
      .replace(/\s*\(\d{4}\)\s*$/g, '')
      .trim()
      .toLowerCase()

    if (!seenTitles.has(normalizedTitle)) {
      seenTitles.add(normalizedTitle)
      uniqueAnime.push(anime)
    }
  }

  return uniqueAnime
}


const App: React.FC = () => {
  const   [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    contentType: [],
    audioLanguages: [],
    subtitleLanguages: [],
    status: [],
    year: "",
    genres: []
  })

  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>("")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [isSearchExpanded, setIsSearchExpanded] = useState<boolean>(false)
  const [heroMuted, setHeroMuted] = useState<boolean>(true)
  // const [heroPlaying, setHeroPlaying]  = useState<boolean>(false)
  const [ytPlayer, setYtPlayer] = useState<any>(null)
  const [isPlaying, setIsPlaying] = useState<boolean>(true)
  const [videoError, setVideoError] = useState<boolean>(false)
  const [videoLoaded, setVideoLoaded] = useState<boolean>(false)
  const videoLoadTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const debouncedQuery = useDebounce(searchQuery, 300)

  // ref for player instance
  // const playerRef = useRef<any>(null)
  // // ref for iframe
  // const iframeContainerRef = useRef<HTMLDivElement>(null)
  // const [youTubeApiReady, setYouTubeApiReady] = useState<boolean>(false)

  // state for api data
  const [animeList, setAnimeList] = useState<AnimeData[]>([])
    // store hero
  const [featuredAnime, setFeaturedAnime] = useState<AnimeData | null>(null)
  const [apiFilterOptions, setApiFilterOptions] = useState<FilterOptionsResponse>({
    availableAudioLanguages: [],
    availableSubtitleLanguages: [],
    availableGenres: [],
    contentTypes: [],
    statusOptions: []
  })
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // pagination state
const [page, setPage] = useState<number>(1)
const [hasMore, setHasMore] = useState<boolean>(true)


  const filterOptions = {
    contentType: apiFilterOptions.contentTypes,
    audioLanguage: apiFilterOptions.availableAudioLanguages,
    subtitleLanguage: apiFilterOptions.availableSubtitleLanguages,
    status: apiFilterOptions.statusOptions,
    genres: apiFilterOptions.availableGenres
  }

    const hasActiveFilter = useCallback((): boolean => {
    return Object.values(activeFilters).some(arr =>
      Array.isArray(arr) ? arr.length > 0 : arr !== ""
    ) || searchQuery !== ""
  }, [activeFilters, searchQuery])

  // load iframe api script
  // useEffect(() => {
  //   const handleYouTubeApiReady = () => {
  //     setYouTubeApiReady(true)
  //     console.log("React Component: YouTube API ready signal received.")
  //   } 

  //   if (typeof window !== "undefined") {
  //     if (window.YT && window.YT.Player) {
  //       setYouTubeApiReady(true)
  //       console.log("React Component: YouTube API already available on mount.")
  //     } else {
  //       const tag = document.createElement("script")
  //       tag.src = "https://www.youtube.com/iframe_api"
  //       const firstScriptTag = document.getElementsByTagName("script")[0]
  //       if (firstScriptTag && firstScriptTag.parentNode) {
  //         firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
  //       } else {
  //         // fallback
  //         document.body.appendChild(tag)
  //       }
  //     }
  //     window.addEventListener("youtubeapiready", handleYouTubeApiReady)
  //   } 
  //   return () => {
  //     if (typeof window !== "undefined") {
  //       window.removeEventListener("youtubeapiready", handleYouTubeApiReady)
  //     }
  //   }
  // }, [])

  // // effect to handle feturedAnime changes and reset video states
  // useEffect(() => {
  //   setVideoError(false)
  //   setVideoLoaded(false)
  //   setHeroPlaying(false)
  //   if (videoLoadTimeoutRef.current) {
  //     clearTimeout(videoLoadTimeoutRef.current)
  //   }

  //   if (featuredAnime && !featuredAnime.trailerUrl) {
  //     console.log("No trailer url. Falling back to image")
  //     setVideoError(true)
  //     setVideoLoaded(true)
  //     setHeroPlaying(false)
  //   }
  // }, [featuredAnime])

  // // initialize player
  // useEffect(() => {
  //   setVideoError(false)
  //   setVideoLoaded(false)
  //   setHeroPlaying(false)
  //   if (videoLoadTimeoutRef.current) {
  //     clearTimeout(videoLoadTimeoutRef.current)
  //   }

  //   console.log(`Player Init Effect Check: youTubeApiReady=${youTubeApiReady}, featuredAnime.trailerUrl=${!!featuredAnime?.trailerUrl}, iframeContainerRef.current=${!!iframeContainerRef.current}`)
  //   if (youTubeApiReady && featuredAnime?.trailerUrl && iframeContainerRef.current) {
  //     const videoIdMatch = featuredAnime.trailerUrl.match(/(?:youtube\.com\/(?:embed\/|v\/)|youtu\.be\/)([\w-]{11})/)
  //     const videoId = videoIdMatch ? videoIdMatch[1] : null

  //     if (videoId) {
  //       // destroy existing player
  //       if (playerRef.current) {
  //         playerRef.current.destroy()
  //       }

  //       playerRef.current = new window.YT.Player(iframeContainerRef.current, {
  //         videoId: videoId,
  //         playerVars: {
  //           autoplay: 1,
  //           controls: 0,
  //           mute: heroMuted ? 1 : 0,
  //           loop: 1,
  //           playlist: videoId,
  //           modestbranding: 1,
  //           rel: 0,
  //           iv_load_policy: 3,
  //           disablekb: 1,
  //           fs: 0,
  //         },
  //         events: {
  //           "onReady": (event: any) => {
  //             console.log("YouTube player ready:", event.target.getVideoData().title)
  //             if (heroMuted) {
  //               event.target.mute()
  //             } else {
  //               event.target.unMute()
  //             }
  //             event.target.playVideo()
  //             setHeroPlaying(true)
  //             setVideoLoaded(true)
  //             if(videoLoadTimeoutRef.current) {
  //               clearTimeout(videoLoadTimeoutRef.current)
  //             }
  //           },
  //           "onStateChange": (event: any) => {
  //             if (event.data === window.YT.PlayerState.PLAYING) {
  //               setHeroPlaying(true)
  //               setVideoLoaded(true)
  //               if (videoLoadTimeoutRef.current) {
  //                 clearTimeout(videoLoadTimeoutRef.current)
  //               }
  //             } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
  //               setHeroPlaying(false)
  //             } else if (event.data === window.YT.PlayerState.BUFFERING) {
  //               setVideoLoaded(false)
  //             }
  //           },
  //           "onError": (event: any) => {
  //             console.error("YouTube Player Error:", event.data)
  //             // force fallback
  //             setVideoError(true)
  //             // hide spinner
  //             setVideoLoaded(true)
  //             setHeroPlaying(false)
  //             if (videoLoadTimeoutRef.current) {
  //               clearTimeout(videoLoadTimeoutRef.current)
  //             }
  //           }
  //         }
  //       })
  //     } else {
  //       console.warn("Player Init: Could not extract YouTube video ID from URL:", featuredAnime.trailerUrl)
  //       setVideoError(true)
  //       setVideoLoaded(true)
  //       setHeroPlaying(false)
  //     }
  //   } else {
  //     if (playerRef.current) {
  //       playerRef.current.destroy()
  //       playerRef.current = null
  //     }
  //   }
  // }, [youTubeApiReady, featuredAnime, heroMuted])

  // build queryParams from activeFilters + sort
  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams()
    params.append("page", page.toString())

    // check if in pure default (i.e., no filters, no query, no unique sort order)
    const isAbsoluteBrowseDefault = !hasActiveFilter() && sortBy === "newest"
    // otherwise
    if (!isAbsoluteBrowseDefault) {
      const isFilteredWithFrontendDefaultSort = (hasActiveFilter() || debouncedQuery !== "") && sortBy === "newest"

      if (!isFilteredWithFrontendDefaultSort) {
        switch (sortBy) {
          case "newest":
            params.append("order_by", "start_date")
            params.append("sort", "desc")
            break
          case "popular":
            params.append("order_by", "popularity")
            params.append("sort", "desc")
            break
          case "episodes":
            params.append("order_by", "episodes")
            params.append("sort", "desc")
            break 
          case "alphabetical":
            params.append("order_by", "title")
            params.append("sort", "asc")
            break
        }
      }
    }
    Object.entries(activeFilters).forEach(([filterType, filterValue]) => {
      if (Array.isArray(filterValue)) {
        // handle array based filters
        // genre case
        if (filterType === "genres") {
          (filterValue as Genre[]).forEach((val) => {
            console.log("Appending genre ID to params:", val.id)
            params.append("genres", val.id.toString())
          })
        } else {
          filterValue.forEach((val) => {
            if (val) {
              console.log(`Appending ${filterType}:`, val)
              params.append(filterType, val)}
          })
        }
      } else if (typeof filterValue === "string") {
        // handle string based filters
        if (filterValue && filterValue !== "undefined" && filterValue !== "") {
          // map frontend names to backend names
          if (filterType === "contentType") {
            params.append("type", filterValue)
          } else if (filterType === "status") {
            params.append("status", filterValue)
          } else if (filterType === "year") {
            params.append("start_date", `${filterValue}-01-01`)
          } else {
            params.append(filterType, filterValue)
          }
        }
      }
    })
    // searchQuery logic
    if (debouncedQuery) {
      params.append("q", debouncedQuery)
    }
    return params.toString()
  }, [activeFilters, sortBy, debouncedQuery, page])

  // fetch based on current state
  const fetchFilteredAndSearchedAnime = useCallback(async (isLoadMore: boolean = false) => {
    setLoading(true)
    setError(null)

    let apiUrl = "/api/browse"
    let currentQueryParams = buildQueryParams()

    if (debouncedQuery) {
      apiUrl = "/api/search"
      currentQueryParams = `q=${encodeURIComponent(debouncedQuery)}&page=${page}&limit=24`
    }

    try {
      const response = await fetch(`${apiUrl}?${currentQueryParams}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`API error: ${response.status} - ${errorData.message || response.statusText}`)
      }
      const data: AnimeData[] = await response.json()
      const uniqueData = deduplicateAnime(data)

      setAnimeList(prev => (isLoadMore ? [...prev, ...uniqueData] : uniqueData))
      setHasMore(data.length > 0)
    } catch (err: unknown) {
      console.log("Failed to fetch anime:", err)
      if (err instanceof Error) {
        setError(err.message)
      } else if (typeof err === "string") {
        setError(err)
      } else {
        setError("An unknown error occurred.")
      }
    } finally {
      setLoading(false)
    }
  }, [debouncedQuery, page, buildQueryParams])

  // data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true)
      setError(null)
      try {
        // fetch filter options
        const filtersResponse = await fetch("/api/filters")
        if(!filtersResponse.ok) {
          throw new Error(`Failed to fetch filter options ${filtersResponse.statusText}`)
        }
        const filtersData: FilterOptionsResponse = await filtersResponse.json()
        setApiFilterOptions(filtersData)

        // fetch browse anime
        // initial load sans search queries/filters
        const browseResponse = await fetch("/api/browse")
        if (!browseResponse.ok) {
          throw new Error(`Failed to fetch anime list ${browseResponse.statusText}`)
        }
        const browseData: AnimeData[] = await browseResponse.json()
        const uniqueBrowseData = deduplicateAnime(browseData)
        setAnimeList(uniqueBrowseData)
        // setAnimeList(browseData)

        // featured: 1st item
        if (uniqueBrowseData.length > 0) {
          setFeaturedAnime(uniqueBrowseData[0])
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError("An unknown error occurred while fetching data.")
        }
        console.error("Failed to fetch initial data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchInitialData()
  }, [])

  // refetch after load
  // useEffect(() => {
    // this version keeps initial loading perfect but causes infinite loop + glitch on refetch
  //   if (!loading && (page > 1 || hasActiveFilter())) {
  //   fetchFilteredAndSearchedAnime(page > 1)
  //   } else if (!loading && page === 1 && !hasActiveFilter() && animeList.length === 0) {
  //     fetchFilteredAndSearchedAnime(false)
  //   }
  // }, [activeFilters, searchQuery, sortBy, page, loading, hasActiveFilter, fetchFilteredAndSearchedAnime, animeList.length])
  useEffect(() => {
    // this version causes cls error on initial load
    const isLoadMore = page > 1
    fetchFilteredAndSearchedAnime(isLoadMore)
  }, [activeFilters, debouncedQuery, page, sortBy, fetchFilteredAndSearchedAnime])

  // mobile menu close functionality
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen && !(event.target as Element).closest(".mobile-menu")) {
        const clickX = event.clientX
        const windowWidth = window.innerWidth
        if (clickX < windowWidth - 20) {
          setIsMobileMenuOpen(false)
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isMobileMenuOpen])

  // useEffect for Hero timeout
  useEffect(() => {
    if (videoLoadTimeoutRef.current) {
      clearTimeout(videoLoadTimeoutRef.current)
    }

    if (featuredAnime?.trailerUrl && !videoLoaded){
      videoLoadTimeoutRef.current = setTimeout(() => {
        console.warn("Hero video timed out loading. Falling back to anime image.")
        setVideoError(true)
        setVideoLoaded(true)
      }, 5000)
    }

    // cleanup function
    return () => {
      if (videoLoadTimeoutRef.current) {
        clearTimeout(videoLoadTimeoutRef.current)
      }
    }
  }, [featuredAnime, videoLoaded])

  // // useEffect for debounced search
  // useEffect(() => {
  //   // skip debounce on initial load
  //   if (searchQuery === "") {
  //     // reset/reload on clear search
  //     setPage(1)
  //     setHasMore(true)
  //     return
  //   }
    
  //   // timeout
  //   const handler = setTimeout(() => {
  //     setPage(1)
  //     setHasMore(true)
  //   }, 500)

  //   // cleanup
  //   return () => {
  //     clearTimeout(handler)
  //   }
  // }, [searchQuery])
  // useEffect(() => {
  //   const handler = setTimeout(() => {
  //     setDebouncedSearchQuery(searchQuery)
  //   }, 500)

  //   return () => {
  //     clearTimeout(handler)
  //   }
  // }, [searchQuery])

  // handler functions
  const handleFilterChange = (category: keyof ActiveFilters, value: string | Genre): void => {
    setActiveFilters(prev => {
      // handle genres (object)
      if (category === "genres") {
        const genre = value as Genre
        const exists = prev.genres.some(g => g.id === genre.id)

        return {
          ...prev,
          genres: exists
            ? prev.genres.filter(g => g.id !== genre.id)
            : [...prev.genres, genre]
        }
      }
      // non-genre handling (string)
      if (Array.isArray(prev[category])) {
        console.log("[handleFilterChange] Non-genre filter:", { category, value })
        const stringValue =
          typeof value === "string"
            ? value
            : value && "id" in value
              ? value.id.toString()
              : ""
        const stringArray = prev[category] as string[]

        return {
          ...prev,
          [category]: stringArray.includes(stringValue)
          ? stringArray.filter(item => item !== stringValue)
          : [...stringArray, stringValue]
        }
      } else {
        return {
          ...prev,
          [category]: typeof value === "string" ? value : value.name
        }
      }
    })
    setPage(1)
    setHasMore(true)
  }

  const clearAllFilters = (): void => {
    setActiveFilters({
      contentType: [],
      audioLanguages: [],
      subtitleLanguages: [],
      status: [],
      year: "",
      genres: []
    })
    setSearchQuery("")
    setPage(1)
  }
  
  // in App for now
  const FilterSection: React.FC<FilterSectionProps> = ({
    title, options, category, activeFilters, onFilterChange
  }) => (
    <div className="mb-6">
      <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">{title}</h3>
      <div className="space-y-2">
        {options.map((option) => {
          const optionValue = typeof option === "string"
          ? option
          : (option as Genre).id.toString()

          const optionLabel = typeof option === "string"
          ? option
          : (option as Genre).name

          const isActive = 
          category === "genres"
          ? (activeFilters.genres as Genre[]).some(
            g => g.id === (option as Genre).id
          )
          : Array.isArray(activeFilters[category])
          ? (activeFilters[category] as number[]).includes(
              typeof option === "string" ? parseInt(option, 10) : option.id
            )
          : false

          return (
            <label key={optionValue} className="flex items-center cursor-pointer group">
              <input
              type="checkbox"
              checked={isActive}
              onChange={() => onFilterChange(category, 
                typeof option === "string"
                ? option
                : {
                  id: (option as Genre).id,
                  name: (option as Genre).name
                })}
              className="sr-only"
              />
              <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center transition-all
              ${isActive
                ? "bg-orange-500 border-orange-500"
                : "border-gray-400 group-hover:border-orange-400"
              }`}>
                {isActive && (
                  <div className="w-2 h-2 bg-white rounded-sm"></div>
                )}
              </div>
              <span className="text-gray-300 text-sm group-hover:text-white transition colors">
                {optionLabel}
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setSortBy(e.target.value as SortOption)
    setPage(1)
    setHasMore(true)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value)
  }

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setActiveFilters(prev => ({...prev, year: e.target.value}))
    setPage(1)
    setHasMore(true)
  }

  const removeActiveFilter = (category: keyof ActiveFilters, value?: string): void => {
    if (value) {
      handleFilterChange(category, value)
    } else {
      setActiveFilters(prev => ({...prev, [category]: ""}))
    }
  }



    // video control handler
      // TOOD: update for iframe
  const handleVideoError = () => {
    console.error("Hero iframe failed to load or encountered an error.")
    setVideoError(true)
    // stop try loading
    setVideoLoaded(true)
    // // not playing
    // setHeroPlaying(false)
    if (videoLoadTimeoutRef.current) {
      clearTimeout(videoLoadTimeoutRef.current)
    }
  }

  // const handleIframeLoad = () => {
  //   console.log("Iframe container div loaded, waiting for yt player api to init player...")
  // }

  const handleVideoLoad = () => {
      // setVideoLoaded(true)
      // clear timeout on successful load
      if (videoLoadTimeoutRef.current) {
        clearTimeout(videoLoadTimeoutRef.current)
      }
      setTimeout(() => {
        setVideoLoaded(true)
      }, 500)
      // console.log("Iframe loaded, waiting for YT Player API")

      const onYouTubeIframeAPIReady = () => {
        const player = new window.YT.Player("hero-video", {
          events: {
            onReady: (event:any) => {
              console.log("player ready")
              setYtPlayer(event.target)
              // if (heroMuted) {
              //   event.target.mute()
              // } else {
              //   event.target.unMute()
              // }
              console.log("onReady: ytPlayer is", event.target)

              setHeroMuted(true)
            },
            onStateChange: (event: any) => {
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const toggleHeroAudio = () => {
    // console.log("toggle called, ytplayer:", ytPlayer)
    // TODO: Update for YouTube embed :'(
    // const video = document.getElementById("hero-video") as HTMLVideoElement
    // if (video) {
    //   video.muted = !video.muted
    //   setHeroMuted(video.muted)
    // }
    // setHeroMuted(prev => !prev)
    // if (playerRef.current) {
    //   if (heroMuted) {
    //     playerRef.current.unMute()
    //   } else {
    //     playerRef.current.mute()
    //   }
      // setHeroMuted(prev => !prev)
    // }
    console.log("ytPlayer:", ytPlayer)
console.log("isMuted?:", ytPlayer?.isMuted?.())
console.log("getPlayerState:", ytPlayer?.getPlayerState?.())

    if (!ytPlayer) {
      console.log("yTplayer not ready for mute/unmute")
      setHeroMuted(prev => !prev)
      return
    }

    // try {
      if (heroMuted) {
        ytPlayer.unMute()
        setHeroMuted(false)
        console.log("Unmute vid")
      } else {
        ytPlayer.mute()
        setHeroMuted(true)
        console.log("Unmute vid")
      }
    // } catch (error) {
    //   console.error("Error toggling: ", error)
    //   setHeroMuted(prev => !prev)
    // }
    // const isCurrentlyMuted = ytPlayer.isMuted()
    // if (isCurrentlyMuted) {
    //   ytPlayer.unMute()
    //   setHeroMuted(false)
    // } else {
    //   ytPlayer.mute()
    //   setHeroMuted(true)
    // }
  }

  const toggleHeroPlayPause = () => {
    // if (playerRef.current) {
    //   if (heroPlaying) {
    //     playerRef.current.pauseVideo()
    //   } else {
    //     playerRef.current.playVideo()
    //   }
    //   setHeroPlaying(prev => !prev)
    // }
    console.log("Toggle play/pause called, ytPlayer:", ytPlayer)
    if (!ytPlayer) {
      console.log("Player not ready")
      return
    }

    try {
      if (isPlaying) {
        ytPlayer.pauseVideo()
        console.log("Pause vid")
      } else {
        ytPlayer.playVideo()
        console.log("Play vid")
      }
    } catch (error) {
      console.error("Error toggling: ", error)
    }
    // const state = ytPlayer.getPlayerState()

    // if (state === 1) {
    //   ytPlayer.pauseVideo()
    //   setIsPlaying(false)
    // } else if (state === 2 || state === 0) {
    //   ytPlayer.playVideo()
    //   setIsPlaying(true)
    // }
  }

// main return
  return (
    <div className="min-h-screen bg-black text-white">
      {/* mobile header */}
      <div className="
      lg:hidden
      bg-black bg-opacity-90 backdrop-blur-md
      border-b border-gray-800
      px-4 py-3
      sticky top-0 z-50
      ">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-white hover:text-orange-400 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-orange-500">Hime<span className="
            text-white">Filter</span>
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            {/* mobile search toggle */}
            {!isSearchExpanded ? (
              <button
              onClick={() => setIsSearchExpanded(true)}
              className="p-2 text-white hover:text-orange-400 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="search..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="
                      w-48
                      pl-3 pr-8 py-2
                      bg-gray-800
                      border border-gray-700 rounded-lg
                      text-white placeholder-gray-400
                      focus:outline-none focus:border-orange-500 text-sm
                    "
                    autoFocus
                    />
                    <button
                    onClick={() => {
                      setIsSearchExpanded(false)
                      setSearchQuery("")
                    }}
                    className="absolute right-2 top-1/2
                    transform -translate-y-1/2
                    text-gray-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* desktop header */}
      <header className="
          hidden
          lg:block
          bg-black bg-opacity-90 backdrop-blur-md
          border-b border-gray-800
          px-6 py-4
          sticky top-0 z-50
        ">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-6">
              <h1 className="text-2xl font-bold text-orange-500">Hime<span className="
                text-white">Filter</span>
              </h1>
                <nav className="flex space-x-6">
                  <a href="#" className="text-white hover:text-orange-400 transition-colors">Browse</a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">My List</a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">New & Popular</a>
                </nav>
            </div>

            <div className="flex items-center space-x-4">
              {/* desktop search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2
                  transform -translate-y-1/2
                  text-gray-400
                  w-4 h-4
                  " />
                  <input
                  type="text"
                  placeholder="Search anime..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="
                    w-80
                    pl-10 pr-4 py-2
                    bg-gray-800
                    border border-gray-700 rounded-lg
                    text-white placeholder-gray-400
                    focus:outline-none focus:border-orange-500 transition-colors
                  "
                />
              </div>

              {/* desktop sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="
                  bg-gray-800
                  border border-gray-700 rounded-lg
                  px-4 py-2
                  text-white
                  focus:outline-none focus:border-orange-500 appearance-none
                  pr-8
                  ">
                    <option value="newest">New This Week</option>
                    <option value="episodes">Latest Episodes</option>
                    <option value="popular">Most Popular</option>
                    <option value="alphabetical">A-Z</option>
                  </select>
                  <ChevronDown className="
                  absolute
                  right-2 top-1/2
                  transform -translate-y-1/2
                  text-gray-400
                  w-4 h-4
                  pointer-events-none" />
              </div>

              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="
                flex items-center
                space-x-2
                bg-gray-800 hover:bg-gray-700
                px-4 py-2
                rounded-lg
                transition-colors
                ">
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                </button>
            </div>
          </div>
        </header>

        {/* Netflix-style hero */}
        {featuredAnime && (
        <section className="relative h-[50v] sm:h-[60v] lg:h[80v] overflow-hidden">
            <div className="absolute inset-0 z-20 pointer-events-none">
              <div 
                onClick={toggleHeroPlayPause}
                className="absolute inset-0 cursor-pointer pointer-events-auto"
              />
            </div> 
          
          {/* video bg */}
          {featuredAnime.trailerUrl && !videoError ? (


            <iframe
              key={featuredAnime.trailerUrl}
              id="hero-video"
              className="absolute inset-0 w-full h-full pointer-events-none"
              src={`${featuredAnime.trailerUrl.split('?')[0]}?autoplay=1&mute=1&enablejsapi=1&controls=0&loop=1&playlist=${featuredAnime.trailerUrl.split('/').pop()?.split('?')[0]}&modestbranding=1&rel=0&iv_load_policy=3`}
              style={{border: "none"}}
              allow="autoplay; encrypted-media"
              allowFullScreen
              title={featuredAnime.title + " Trailer"}
              onLoad={handleVideoLoad}
              onError={handleVideoError}
            ></iframe>
          ) : (
            // fallack image
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${featuredAnime.heroImage || featuredAnime.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center"                
              }}
            />
          )}
          
          {/* gradient overlays !! important */}
          <div className="absolute inset-0 bg-gradient-to-r from black via black/70 to transparent z-10 pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-r from black via transparent to transparent z-10 pointer-events-none"></div>
          
          {/* video loading icon */}
          {!videoLoaded && featuredAnime.trailerUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          )}    

          <div className="relative z-30 h-full flex items-center px-4 sm:px-6 lg:px-12 pointer-events-none">
            <div className="max-w-2xl space-y-4 sm:space-y-6">
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">
                  {featuredAnime.status}
                </span>
                <span>{featuredAnime.year}</span>
                <span>•</span>
                <span>{featuredAnime.episodes}</span>
                <span>•</span>
                <div className="flex items-center">
                  <Star className="w-3 h-3 mr-1 fil-current text-yellow-400" />
                  {featuredAnime.rating}
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight">
                {featuredAnime.title}
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-gray-300 leading-relaxed max-w-xl">
                {featuredAnime.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {featuredAnime.genres.slice(0, 3).map((genre) => (
                  <span key={genre.id} className="text-xs bg-gray-800/80 text-gray-300 px-3 py-1 rounded-full">
                    {genre.name}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2 pointer-events-auto">
                <button className="
                flex items-center justify-center space-x-2
                bg-white text-black
                px-6 py-3
                rounded-lg
                font-semibold
                hover:bg-gray-200 transition colors
                ">
                  <Play className="w-5 h-5 fill-current" />
                  <span>Watch Now</span>
                </button>

                <button className="
                    flex items-center justify-center 
                    space-x-2
                    bg-gray-600/80
                    text-white
                    px-6 py-3
                    rounded-lg font-semibold
                    hover:bg-gray-600 transition-colors
                    ">
                      <Info className="w-5 h-5" />
                      <span>More Info</span>
                    </button>

                    <button className="flex items-center justify-center
                      space-x-2
                      bg-gray-800/80
                      text-white
                      px-4 py-3
                      rounded-lg
                      hover:bg-gray-700 transition-colors
                      ">
                        <Plus className="w-5 h-5" />
                    </button>
              </div>
            </div>
          </div>

          {/* audio controls */}
          {featuredAnime.trailerUrl && (
              // <div className="
              //   absolute
              //   top-4 sm:top-auto sm:bottom-4 right-4
              //   flex items-center space-x-2
              //   ">
              //   <button
              //     onClick={toggleHeroPlayPause}
              //     className="
              //       bg-gray-800/80 hover:bg-gray-700
              //       text-white
              //       p-2 sm:p-3
              //       rounded-full 
              //       transition-colors
              //     "
              //   >                  
              //     {heroPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5" />}
              //     <span>{heroPlaying ? "Pause" : "Play"}</span>
              // </button>
          <button
          onClick={toggleHeroAudio}
          className="
            absolute
            top-4 sm:top-auto sm:bottom-4 right-4 z-30
            bg-gray-800/80 hover:bg-gray-700
            text-white
            p-2 sm:p-3
            rounded-full 
            transition-colors
            pointer-events-auto
            "
          >
            {heroMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
            // </div>
          )}             
        </section>
        )}

        <div className="flex relative">
          {/* mobile filter drawer */}
          {isMobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-50 mobile-menu">
              <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}>
              </div>
              <div className="absolute left-0 top-0 h-full w-70 bg-gray-900 transform transition-transform duration-300 overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                    <X className="w-5 h-5" />
                  </button>
                  <h2 className="text-lg font-semibold text-white pl-10">Filters</h2>
                  <Filter className="w-5 h-5 text-orange-500" />
                </div>
              
              <button
                onClick={clearAllFilters}
                className="w-full
                mb-6
                text-sm text-gray-400 hover:text-orange-400 transition-colors text-left
                ">
                  Clear All Filters
              </button>

              <div className="space-y-6">
                <FilterSection
                  title="Content Type"
                  options={filterOptions.contentType}
                  category="contentType"
                  activeFilters={activeFilters}
                  onFilterChange={handleFilterChange}
                />

                <div className="border-t border-gray-700 pt-6">
                  <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Language</h3>
                  <FilterSection
                    title="Audio"
                    options={filterOptions.audioLanguage}
                    category="audioLanguages"
                    activeFilters={activeFilters}
                    onFilterChange={handleFilterChange}
                  />
                  <FilterSection
                    title="Subtitles"
                    options={filterOptions.subtitleLanguage}
                    category="subtitleLanguages"
                    activeFilters={activeFilters}
                    onFilterChange={handleFilterChange}
                  />
                </div>

                <FilterSection
                    title="Status"
                    options={filterOptions.status}
                    category="status"
                    activeFilters={activeFilters}
                    onFilterChange={handleFilterChange}
                />
                <FilterSection
                    title="Genres"
                    options={filterOptions.genres}
                    category="genres"
                    activeFilters={activeFilters}
                    onFilterChange={handleFilterChange}
                />

                <div>
                    <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Year</h3>
                    <input
                      type="number"
                      placeholder="e.g., 2024"
                      value={activeFilters.year}
                      onChange={handleYearChange}
                      className="
                        w-full
                        px-3 py-2
                        bg-gray-800
                        border border-gray-700 rounded-lg
                        text-white placeholder-gray-400
                        focus:outline-none focus:border-orange-500
                        appearance-none
                        [&::-webkit-inner-spin-button]:appearance-none
                        [&::-webkit-outer-spin-button]:appearance-none
                        "
                    />
                </div>
              </div>

              {/* mobile sort */}
              <div className="mt-8 border-t border-gray-700 pt-6">
                <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="
                    w-full
                    bg-gray-800
                    border border-gray-700 rounded-lg
                    px-3 py-2
                    text-white
                    focus:outline-none focus:border-orange-500"
                >
                  <option value="newest">New This Week</option>
                  <option value="episodes">Latest Episodes</option>
                  <option value="popular">Most Popular</option>
                  <option value="alphabetical">A-Z</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* desktop filter sidebar */}
        <div className={`hidden lg:block bg-gray-900 border-l border-gray-800 transition-all duration-300 order-2 ${
          isFilterOpen ? "w-80" : "w-0 overflow-hidden"
        }`}>
          {isFilterOpen && (
            <div className="p-6 h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-orange-500" />
                  <h2 className="text-lg font-semibold text-white">Filters</h2>
                </div>
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-gray-400 hover:text-orange-400 transition-colors"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-6">
                <FilterSection
                  title="Content Type"
                  options={filterOptions.contentType}
                  category="contentType"
                  activeFilters={activeFilters}
                  onFilterChange={handleFilterChange}
                />

                <div className="border-t border-gray-700 pt-6">
                  <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Language Options</h3>
                  <FilterSection
                    title="Audio Language"
                    options={filterOptions.audioLanguage}
                    category="audioLanguages"
                    activeFilters={activeFilters}
                    onFilterChange={handleFilterChange}
                  />
                  <FilterSection
                    title="Subtitle Language"
                    options={filterOptions.subtitleLanguage}
                    category="subtitleLanguages"
                    activeFilters={activeFilters}
                    onFilterChange={handleFilterChange}
                  />
                </div>

                <FilterSection
                    title="Status"
                    options={filterOptions.status}
                    category="status"
                    activeFilters={activeFilters}
                    onFilterChange={handleFilterChange}
                />
                <FilterSection
                    title="Genres"
                    options={filterOptions.genres}
                    category="genres"
                    activeFilters={activeFilters}
                    onFilterChange={handleFilterChange}
                />

                <div>
                  <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Release Year</h3>
                    <input
                      type="number"
                      placeholder="e.g., 2024"
                      value={activeFilters.year}
                      onChange={handleYearChange}
                      className="
                        w-full
                        px-3 py-2
                        bg-gray-800
                        border border-gray-700 rounded-lg
                        text-white placeholder-gray-400
                        focus:outline-none focus:border-orange-500
                        appearance-none
                        [&::-webkit-inner-spin-button]:appearance-none
                        [&::-webkit-outer-spin-button]:appearance-none
                        "
                      />
                  </div>
                </div>
              </div>
          )}
        </div>

        {/* main content */}
        <div className="flex-1 p-4 sm:p-6 order-1">
          {/* active filters display */}
          {hasActiveFilter() && (
            <div className="mb-6 flex flex-wrap gap-2">
              {searchQuery && (
                <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm flex items-center">
                  Search: &quot;{searchQuery}&quot;
                  <X className="w-4 h-4 ml-2 cursor-pointer" onClick={() => setSearchQuery("")} />
                </div>
              )}
              {Object.entries(activeFilters).map(([category, values]) => 
                Array.isArray(values) ? values.map((value) => (
                  <div key={`${category}-${typeof value === "string" ? value : value.id}`}
                    className="
                      bg-gray-700
                      text-white
                      px-3 py-1 
                      rounded-full 
                      text-sm
                      flex items-center
                      ">
                    {typeof value === "string" ? value : value.name}
                    <X
                      className="w-4 h-4 ml-2 cursor-pointer hover:text-orange-400"
                      onClick={() => removeActiveFilter(category as keyof ActiveFilters, value)}
                    />
                  </div>
                )) : values && (
                  <div key={category} className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm flex items-center">
                    {category} : {typeof values === "string" ? values : values.name}
                    <X
                      className="w-4 h-4 ml-2 cursor-pointer hover:text-orange-400"
                      onClick={() => removeActiveFilter(category as keyof ActiveFilters, values)}
                    />
                  </div>
                )
              )}
            </div>
          )}

          {/* conditional rendering */}
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
              <p className="ml-4 text-lg">Loading anime and filters...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-48 text-red-500">
              <p className="text-lg">Error: {error}</p>
              <p className="ml-2">Please make sure your backend server is running and accessible.</p>
            </div>
          ) : (
            <>
              {/* section title */}
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Browse Titles</h2>
                <p className="text-gray-400 text-sm">Discover your next favorite series</p>
              </div>

              {/* results grid - mobile */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
                {animeList.map((anime: AnimeData) => (
                  <div key={anime.id} className="group cursor-pointer">
                    <div className="relative overflow-hidden rounded-lg bg-gray-800 transition-transform duration-300 group-hover:scale-105">
                      <div className="w-full aspect-[2/3] bg-gray-700">
                      {/* TODO: update for Nextjs */}
                        <img
                          src={anime.image}
                          alt={anime.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="
                        absolute inset-0
                        bg-black bg-opacity-0 group-hover:bg-opacity-60
                        transition-all
                        flex items-center justify-center
                        ">
                        <Play className="w-8 h-8 sm:w-12 sm:h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>         

                      {/* contentType badge */}
                      <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                        {anime.type}
                      </div>

                      {/* rating */}
                      <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center">
                        <Star className="w-3 h-3 mr-1 fill-current text-yellow-400" />
                        {anime.rating}
                      </div>

                      {/* duration - mobile hidden */}
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded hidden sm:block">
                        {anime.duration}
                      </div>
                    </div>

                    <div className="mt-2 sm:mt-3 space-y-1">
                      <h3 className="font-semibold text-white group-hover:text-orange-400 transition-colors line-clamp-2 text-sm sm:text-base leading-tight">
                        {anime.title}
                      </h3>
                      <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-400">
                        <span>{anime.episodes} ep{anime.episodes !== 1 ? "s" : ""}</span>
                        <span>•</span>
                        <span>{anime.year}</span>
                        <span>•</span>
                        <span className="flex items-center">
                          <Globe className="w-3 h-3 mr-1" />
                          {anime.audioLanguages.includes("English") ? "DUB" : "SUB"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {anime.genres.slice(0, 2).map((genre) => (
                          <span key={genre.id} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                            {genre.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              

              {/* load more btn */}
              {animeList.length > 0 && (
                <div className="mt-8 sm:mt-12 text-center">
                  <button className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors">
                    Load More Anime
                  </button>
                </div>
              )}

              {/* continue watching */}
              <div className="mt-12 sm:mt-16">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Continue Watching</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {animeList.slice(0, 3).map((anime: AnimeData) => (
                    <div key={`continue-${anime.id}`} className="group cursor-pointer">
                      <div className="relative overflow-hidden rounded-lg bg-gray-800">
                        <div className="w-full aspect-video bg-gray-700">
                          <img
                            src={anime.largeImage || anime.image}
                            alt={anime.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center">
                          <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        {/* progress bar (still mock) */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600">
                          <div className="h-full bg-orange-500 w-3/4"></div>
                        </div>

                        {/* episode info (still mock) */}
                        <div className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-70 px-2 py-1 rounded">
                          S1 E{Math.floor(Math.random() * 12) + 1}
                        </div>
                      </div>

                      <div className="mt-3 space-y-1">
                        <h3 className="font-semibold text-white group-hover:text-orange-400 transition-colors line-clamp-1">
                          {anime.title}
                        </h3>
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {anime.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* trending now */}
              <div className="mt-12 sm:mt-16">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Trending Now</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
                  {/* fake trending but real data through slice+reverse */}
                  {animeList.slice().reverse().map((anime: AnimeData, index: number) => (
                    <div key={`trending-${anime.id}`} className="group-cursor-pointer">
                      <div className="relative overflow-hidden rounded-lg bg-gray-800 transition-transform duration-300 group-hover:scale-105">
                        <div className="w-full aspect-[2/3] bg-gray-700">
                          <img
                            src={anime.image}
                            alt={anime.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="
                          absolute
                          inset-0
                          bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all
                          flex items-center justify-center
                          ">
                            <Play className="
                              w-8 h-8 sm:w-12 sm:h-12
                              text-white
                              opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        {/* trending number */}
                        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                          #{index +1}
                        </div>

                        {/* rating */}
                        <div className="
                          absolute
                          top-2 right-2
                          bg-black bg-opacity-70
                          text-white text-xs
                          px-2 py-1
                          rounded
                          flex items-center
                          ">
                            <Star className="w-3 h-3 mr-1 fill-current text-yellow-400" />
                            {anime.rating}
                        </div>
                      </div>

                      <div className="mt-2 sm:mt-3 space-y-1">
                        <h3 className="
                          font-semibold text-white group-hover:text-orange-400 transition-colors
                          line-clamp-2
                          text-sm sm:text-base
                          leading tight
                          ">
                            {anime.title}
                          </h3>
                          <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-400">
                            <span>{anime.episodes} ep{anime.episodes !== 1 ? "s" : ""}</span>
                            <span>•</span>
                            <span>{anime.year}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )} 
          </div>
        </div>

        {/* bottom mobile navigation */}
        <div className="
          lg:hidden
          fixed
          bottom-0 left-0 right-0
          bg-gray-900
          border-t border-gray-800
          px-4 py-3 z-40
          ">
            <div className="flex justify-around items-center">
              <button className="flex flex-col items-center space-y-1 text-orange-500">
                <div className="w-6 h-6 bg-orange-500 rounded"></div>
                <span className="text-xs">Browse</span>
              </button>
              <button className="flex flex-col items-center space-y-1 text-gray-400">
                <div className="w-6 h-6 bg-gray-600 rounded"></div>
                <span className="text-xs">My List</span>
              </button>
              <button className="flex flex-col items-center space-y-1 text-gray-400">
                <div className="w-6 h-6 bg-gray-600 rounded"></div>
                <span className="text-xs">New</span>
              </button>
              <button className="flex flex-col items-center space-y-1 text-gray-400">
                <div className="w-6 h-6 bg-gray-600 rounded"></div>
                <span className="text-xs">Profile</span>
              </button>
            </div>
        </div>
        {/* bottom padding mobile */}
        <div className="lg:hidden h-20"></div>
      </div>
    )
  }
export default App