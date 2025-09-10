"use client"
import React, {useState, useEffect, useRef, useCallback, act} from "react"
import {Search, Filter, X, ChevronDown, Star, Globe, Play, Pause, Menu, Info, Plus, Volume2, VolumeX} from "lucide-react"
import { AnimeData, SortOption, ActiveFilters, FilterOptionsResponse, FilterSectionProps, FilterOptions, FilterOption } from "@/types/index"
import { useDebounce } from "src/hooks/useDebounce"
import { MobileHeader } from "@/components/MobileHeader"
import { DesktopHeader } from "@/components/DesktopHeader"
import { HeroSection } from "@/components/HeroSection"
import { FilterDrawerContent } from "@/components/FilterDrawerContent"
import { SortMenu } from "@/components/SortMenu"
import { sortOptions } from "@/lib/constants/sortOptions"
import Image from "next/image"
import { normalize } from "path"

const App: React.FC = () => {
  const   [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    contentType: [],
    audioLanguages: [],
    subtitleLanguages: [],
    status: [],
    year: "",
    genres: [],
    season: ""
  })

  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [yearInput, setYearInput] = useState<string>("")
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
  const debouncedYear = useDebounce(yearInput, 700)

  // state for api data
  const [animeList, setAnimeList] = useState<AnimeData[]>([])
    // store hero
  const [featuredAnime, setFeaturedAnime] = useState<AnimeData | null>(null)
  // continue watching
  const [continueWatchingList, setContinueWatchingList] = useState<AnimeData[]>([])
  const [apiFilterOptions, setApiFilterOptions] = useState<FilterOptionsResponse>({
    availableAudioLanguages: [],
    availableSubtitleLanguages: [],
    availableGenres: [],
    contentTypes: [],
    statusOptions: [],
    timeframeOptions: [],
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
    genres: apiFilterOptions.availableGenres,
    timeframes: apiFilterOptions.timeframeOptions
  }

  const hasActiveFilter = useCallback((): boolean => {
    return Object.values(activeFilters).some(arr =>
      Array.isArray(arr) ? arr.length > 0 : arr !== ""
    )
  }, [activeFilters])

  // dating
  const currentYear = new Date().getFullYear().toString()
  const showNewSeriesFilter = !activeFilters.year || activeFilters.year === currentYear

  // build queryParams from activeFilters + sort
  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams()
    params.append("page", page.toString())
    // params.append("limit", "24")

    // add search query if exists
    if (debouncedQuery) {
      params.append("q", debouncedQuery)
    }

    const isYearFilterActive = !!activeFilters.year
    switch (sortBy) {
      case "newest":
        params.append("order_by", "start_date")
        params.append("sort", "desc")
        break
      
      case "popular":
        params.append("order_by", "score")
        params.append("sort", "desc")
        break
      // case "season":
      //   if (!isYearFilterActive) {
      //   const now = new Date()
      //   const year = now.getFullYear()
      //   const month = now.getMonth()
      //   let seasonStartDate: string, seasonEndDate: string

      //   if (month >= 0 && month <=2) {
      //     seasonStartDate = `${year}-01-01`
      //     seasonEndDate = `${year}-03-31`
      //   } else if (month >= 3 && month <=5) {
      //     seasonStartDate = `${year}-04-01`
      //     seasonEndDate = `${year}-06-30`
      //   } else if (month >= 6 && month <=8) {
      //     seasonStartDate = `${year}-07-01`
      //     seasonEndDate = `${year}-09-30`
      //   } else {
      //     seasonStartDate = `${year}-10-01`
      //     seasonEndDate = `${year}-12-31`
      //   }
      //   params.append("start_date", seasonStartDate)
      //   params.append("end_date", seasonEndDate)
      // }
      //   params.append("order_by", "start_date")
      //   params.append("sort", "desc")
      //   break
      case "alphabetical":
        params.append("order_by", "title")
        params.append("sort", "asc")
        break
    }
        const getCurrentSeason = () => {
          const now = new Date()
          const year = now.getFullYear()
          const month = now.getMonth()
          let seasonStartDate: string, seasonEndDate: string

          if (month >= 0 && month <=2) {
            seasonStartDate = `${year}-01-01`
            seasonEndDate = `${year}-03-31`
          } else if (month >= 3 && month <=5) {
            seasonStartDate = `${year}-04-01`
            seasonEndDate = `${year}-06-30`
          } else if (month >= 6 && month <=8) {
            seasonStartDate = `${year}-07-01`
            seasonEndDate = `${year}-09-30`
          } else {
            seasonStartDate = `${year}-10-01`
            seasonEndDate = `${year}-12-31`
          }
          return {seasonStartDate, seasonEndDate}
        }
  
    Object.entries(activeFilters).forEach(([key, value]) => {
      let paramKey = key
      if (key === "contentType") {
        paramKey = "type"
      }

      if (Array.isArray(value) && value.length > 0 ) {
        params.append(paramKey, value.join(","))
      } else if (typeof value === "string" && value) {
          if (key === "year") {
            params.append("start_date", `${value}-01-01`)
            params.append("end_date", `${value}-12-31`)
          }
          if (key === "season" && value === "this-season") {
            if (showNewSeriesFilter) {
              const {seasonStartDate, seasonEndDate} = getCurrentSeason()
              params.append("start_date", seasonStartDate)
              params.append("end_date", seasonEndDate)
            }
          }
      }

    })
   
    return params
  }, [activeFilters, sortBy, debouncedQuery, page])

  // reset to default grid
  const fetchBrowseData = useCallback(async (options: {signal: AbortSignal}) => {
    const {signal} = options
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/browse", {signal})
      if (!response.ok) {
        throw new Error(`Failed to fetch browse data: ${response.statusText}`)
      }
      const browseData: AnimeData[] = await response.json()
      // const uniqueBrowseData = deduplicateAnime(browseData)
      setAnimeList(browseData)
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        console.log("Browse fetch aborted")
        return
      }
      if (err instanceof Error) setError(err.message)
        else setError("An unknown error occured while resetting.")
    } finally {
      setLoading(false)
    }
  }, [])

  // fetch based on current state
  const fetchFilteredAndSearchedAnime = useCallback(async (options: {isLoadMore?: boolean; signal:AbortSignal}) => {
    const {isLoadMore = false, signal} = options
    setLoading(true)
    setError(null)

    const apiUrl = "/api/anime"
    const currentQueryParams = buildQueryParams().toString()

    try {
      const response = await fetch(`${apiUrl}?${currentQueryParams}`, {signal})
      if (response.headers.get("Content-Type")?.includes("application/json") === false) {
        const text = await response.text()
        throw new Error(`Expected JSON, but recieved HTML/Text. Status: ${response.status}. Response: ${text.substring(0, 200)}...`)
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`API error: ${response.status} - ${errorData.message || response.statusText}`)
      }
      const data: AnimeData[] = await response.json()
      setAnimeList(prev => (isLoadMore ? [...prev, ...data] : data))
      setHasMore(data.length > 0)
    } catch (err: unknown) {
      console.log("Failed to fetch anime:", err)
      if (err instanceof Error && err.name === "AbortError") {
        console.log("Fetch Aborted")
        return
      }
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
  }, [buildQueryParams])

  // pagination
  const handleLoadMore = useCallback(() => {
    if (!loading) {
      setPage(prevPage => prevPage + 1)
    }
  }, [loading])

  // data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true)
      setError(null)
      try {
        // fetch filter options
        const [browseResponse, filtersResponse] = await Promise.all([
          fetch("/api/browse"),
          fetch("/api/filters")
        ])
        if(!browseResponse.ok) {
          throw new Error(`Failed to fetch filter options ${filtersResponse.statusText}`)
        }
        if(!filtersResponse.ok) {
          throw new Error(`Failed to fetch filter options ${filtersResponse.statusText}`)
        }

        const browseData: AnimeData[] = await browseResponse.json()
        const filtersData: FilterOptionsResponse = await filtersResponse.json()
        setApiFilterOptions(filtersData)

        // featured: 1st item
        if (browseData && browseData.length > 0) {
          setFeaturedAnime(browseData[0])
          setAnimeList(browseData)
          setContinueWatchingList(browseData.slice(0, 3))
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

  // watch for cls error
  const isInitialMount = useRef(true)
  useEffect(() => {    
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    const controller = new AbortController()
    const shouldReset = !debouncedQuery && !hasActiveFilter()

    if (shouldReset) {
      console.log("RESETTING to DEFAULT VIEW")
      fetchBrowseData({signal: controller.signal})
    } else {
      console.log("FETCHING FILTERED/SEARCHED")
      const isLoadMore = page > 1
      fetchFilteredAndSearchedAnime({isLoadMore, signal: controller.signal})
    }

    // cleanup
    return () => {
      console.log("Cleanup: aborting prev fetch")
      controller.abort()
    }
    
  }, [activeFilters, debouncedQuery, page, sortBy, fetchBrowseData, hasActiveFilter, fetchFilteredAndSearchedAnime])

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

  // useEffect for debounced year input
  useEffect(() => {
    setActiveFilters(currentFilters => ({
      ...currentFilters,
      year: debouncedYear
    }))
  }, [debouncedYear])

  // handler functions
  const handleFilterChange = (category: keyof ActiveFilters, value: string): void => {
    setActiveFilters(prev => {
      // unified string handling
      if (Array.isArray(prev[category])) {
        const stringArray = prev[category] as string[]
        const exists = stringArray.includes(value)

        return {
          ...prev,
          [category]: exists
            ? stringArray.filter(item => item !== value)
            : [...stringArray, value]
        }
      } else {
        const currentValue = prev[category] as string
        return {
          ...prev,
          [category]: currentValue === value ? "" : value
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
      genres: [],
      season: "",
    })
    setSearchQuery("")
    setYearInput("")
    setSortBy("newest")
    setPage(1)
  }
  
  // in App for now
  // const FilterSection: React.FC<FilterSectionProps> = ({
  //   title, options, category, activeFilters, onFilterChange
  // }) => (
  //   <div className="mb-6">
  //     <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">{title}</h3>
  //     <div className="space-y-2">
  //       {options.map((option) => {
  //         const isActive = Array.isArray(activeFilters[category])
  //           ? activeFilters[category].includes(option.value)
  //           : activeFilters[category] === option.value
            
  //         return (
  //           <label key={option.value} className="flex items-center cursor-pointer group">
  //             <input
  //             type="checkbox"
  //             checked={isActive}
  //             onChange={() => onFilterChange(category, option.value)}
  //             className="sr-only"
  //             />
  //             <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center transition-all
  //             ${isActive
  //               ? "bg-orange-500 border-orange-500"
  //               : "border-gray-400 group-hover:border-orange-400"
  //             }`}>
  //               {isActive && (
  //                 <div className="w-2 h-2 bg-white rounded-sm"></div>
  //               )}
  //             </div>
  //               {option.label}
  //             <span className="text-gray-300 text-sm group-hover:text-white transition colors">
  //             </span>
  //           </label>
  //         )
  //       })}
  //     </div>
  //   </div>
  // )

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setSortBy(e.target.value as SortOption)
    setPage(1)
    setHasMore(true)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value)
  }

  const removeActiveFilter = (category: keyof ActiveFilters, value?: string): void => {
    if (value) {
      handleFilterChange(category, value)
    } else {
      setActiveFilters(prev => ({
        ...prev,
        [category]: Array.isArray(prev[category]) ? [] : ""
      }))
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

  const handleVideoLoad = () => {
      // clear timeout on successful load
      if (videoLoadTimeoutRef.current) {
        clearTimeout(videoLoadTimeoutRef.current)
      }
      setTimeout(() => {
        setVideoLoaded(true)
      }, 500)

      const onYouTubeIframeAPIReady = () => {
        const player = new window.YT.Player("hero-video", {
          events: {
            onReady: (event:any) => {
              console.log("player ready")
              setYtPlayer(event.target)
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
    console.log("ytPlayer:", ytPlayer)
    console.log("isMuted?:", ytPlayer?.isMuted?.())
    console.log("getPlayerState:", ytPlayer?.getPlayerState?.())

    if (!ytPlayer) {
      console.log("yTplayer not ready for mute/unmute")
      setHeroMuted(prev => !prev)
      return
    }
      if (heroMuted) {
        ytPlayer.unMute()
        setHeroMuted(false)
        console.log("Unmute vid")
      } else {
        ytPlayer.mute()
        setHeroMuted(true)
        console.log("Unmute vid")
      }
     }

  const toggleHeroPlayPause = () => {
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
  }

// main return
  return (
    <div className="min-h-screen bg-black text-white">
      {/* mobile header */}
      <MobileHeader
        onMobileMenuToggle={() => setIsMobileMenuOpen(prev => !prev)}
        isSearchExpanded={isSearchExpanded}
        onSearchExpand={setIsSearchExpanded}
        searchQuery={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        onSearchClear={() => setSearchQuery("")}
      />
        
      {/* desktop header */}
      <DesktopHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        sortOptions={sortOptions}
        onFilterToggle={() => setIsFilterOpen(prev => !prev)}
      />

      {/* hero section */}
      {featuredAnime && ( 
        <HeroSection
          featuredAnime={featuredAnime}
          videoLoaded={videoLoaded}
          heroMuted={heroMuted}
          toggleHeroAudio={toggleHeroAudio}
          toggleHeroPlayPause={toggleHeroPlayPause}
          handleVideoLoad={handleVideoLoad}
          handleVideoError={handleVideoError}
          videoError={videoError}
        />
      )}

        <div className="flex relative">
          {/* mobile filter drawer */}
          {isMobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-50 mobile-menu">
              <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
              <div className="absolute left-0 top-0 h-full w-70 bg-gray-900 opacity-85 transform transition-transform duration-300 overflow-y-auto">
                <div className="p-6">
                  {/* new FilterMenu componenent */}
                  <FilterDrawerContent
                    variant="mobile"
                    activeFilters={activeFilters}
                    filterOptions={filterOptions}
                    yearInput={yearInput}
                    showNewSeriesFilter={showNewSeriesFilter}
                    onFilterChange={handleFilterChange}
                    onClearFilters={clearAllFilters}
                    onYearChange={setYearInput}
                    onClose={() => setIsMobileMenuOpen(false)}
                  />
                  {/* new mobile sort */}
                  <SortMenu
                    sortBy={sortBy}
                    onSortChange={handleSortChange}
                    options={sortOptions}
                    variant="mobile"
                  />
                </div>
              </div>
            </div>
          )}

          {/* desktop filter sidebar */}
          <div className={`hidden lg:block bg-gray-900 border-l border-gray-800 transition-all duration-300 order-2
            ${isFilterOpen ? "w-80" : "w-0 overflow-hidden"}`
          }>
            {isFilterOpen && (
              <div className="p-6 h-full overflow-y-auto">
                {/* new FilterMenu component */}
                <FilterDrawerContent
                  variant="desktop"
                  activeFilters={activeFilters}
                  filterOptions={filterOptions}
                  onFilterChange={handleFilterChange}
                  onClearFilters={clearAllFilters}
                  onYearChange={setYearInput}
                  yearInput={yearInput}
                  showNewSeriesFilter={showNewSeriesFilter}
                />
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
                Array.isArray(values) ? values.map((value) => {
                  let displayLabel = value
                  if (category === "genres") {
                    const match = apiFilterOptions.availableGenres.find(g => g.value === value)
                    if (match) displayLabel = match.label
                  }
                  
                return (

                  <div key={`${category}-${value}`}
                    className="
                      bg-gray-700
                      text-white
                      px-3 py-1 
                      rounded-full 
                      text-sm
                      flex items-center
                      ">
                    {displayLabel}
                    <X
                      className="w-4 h-4 ml-2 cursor-pointer hover:text-orange-400"
                      onClick={() => removeActiveFilter(category as keyof ActiveFilters, value)}
                    />
                  </div>
                )}) : values && (
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
                    <AnimeCard key={anime.id} anime={anime} />
                  </div>
                ))}
              </div>
              
              {/* load more btn */}
              {animeList.length > 0 && !loading && hasMore && (
                <div className="mt-8 sm:mt-12 text-center">
                  <button 
                    onClick={handleLoadMore}
                    className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    Load More Anime
                  </button>
                </div>
              )}

              {/* continue watching */}
              <div className="mt-12 sm:mt-16">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Continue Watching</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {continueWatchingList.map((anime: AnimeData) => (
                    <div key={`continue-${anime.id}`} className="group cursor-pointer">
                      <div className="relative overflow-hidden rounded-lg bg-gray-800">
                        <div className="w-full aspect-video bg-gray-700">
                          <Image
                            src={anime.largeImage || anime.image}
                            alt={anime.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
              {/* old trending now */}
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