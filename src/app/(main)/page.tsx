"use client"
import React, {useState, useEffect, useRef, useCallback, act} from "react"
import {Search, Filter, X, ChevronDown, Star, Globe, Play, Pause, Menu, Info, Plus, Volume2, VolumeX} from "lucide-react"
import { AnimeData, SortOption, ActiveFilters, FilterOptionsResponse, FilterSectionProps, FilterOptions, FilterOption } from "@/types/index"
import { useDebounce } from "src/hooks/useDebounce"
import { useBrowsePage } from "src/hooks/useBrowsePage"
import { MobileHeader } from "@/components/MobileHeader"
import { DesktopHeader } from "@/components/DesktopHeader"
import { HeroSection } from "@/components/HeroSection"
import { ContinueWatchingSection } from "@/components/ContinueWatchingSection"
import { FilterDrawerContent } from "@/components/FilterDrawerContent"
import { SortMenu } from "@/components/SortMenu"
import { AnimeCard } from "@/components/AnimeCard"
import { BottomMobileNav } from "@/components/BottomMobileNav"
import { sortOptions } from "@/lib/constants/sortOptions"
import Image from "next/image"
import { normalize } from "path"

const App: React.FC = () => {
  const {
    featuredAnime, continueWatchingList, apiFilterOptions, animeList, loading, error, hasActiveQuery, showNewSeriesFilter,
    activeFilters, sortBy, searchQuery, yearInput, handleFilterChange, clearAllFilters, handleSortChange,
    handleSearchChange, setYearInput, setSearchQuery, removeActiveFilter, page, hasMore, handleLoadMore, setPage,
  } = useBrowsePage()

  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false)
  const [isSearchExpanded, setIsSearchExpanded] = useState<boolean>(false)
  const [heroMuted, setHeroMuted] = useState<boolean>(true)
  // const [heroPlaying, setHeroPlaying]  = useState<boolean>(false)
  const [ytPlayer, setYtPlayer] = useState<any>(null)
  const [isPlaying, setIsPlaying] = useState<boolean>(true)
  const [videoError, setVideoError] = useState<boolean>(false)
  const [videoLoaded, setVideoLoaded] = useState<boolean>(false)
  const videoLoadTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const filterOptions = {
    contentType: apiFilterOptions.contentTypes,
    audioLanguage: apiFilterOptions.availableAudioLanguages,
    subtitleLanguage: apiFilterOptions.availableSubtitleLanguages,
    status: apiFilterOptions.statusOptions,
    genres: apiFilterOptions.availableGenres,
    timeframes: apiFilterOptions.timeframeOptions
  }

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

  // video handlers
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
                  {/* new filter drawer componenent */}
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
                {/* new filter drawer component */}
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
          {hasActiveQuery() && (
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
                  {/* continue watching */}
                  <ContinueWatchingSection animeList={continueWatchingList} />

                  {/* section title */}
                  <div className="mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Browse Titles</h2>
                    <p className="text-gray-400 text-sm">Discover your next favorite series</p>
                  </div>

                  {/* results grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
                    {animeList.map((anime: AnimeData) => (
                      <div key={anime.id} className="group cursor-pointer">
                        <AnimeCard anime={anime} />
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
                </>
            )} 
          </div>
        </div>

        {/* bottom mobile navigation */}
        <BottomMobileNav />
      </div>
    )
  }
export default App