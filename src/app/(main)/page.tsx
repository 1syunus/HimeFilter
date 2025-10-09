"use client"
import React, { useEffect, useRef, useState } from "react"
import { AnimeData } from "@/types/index"
import { useBrowsePage } from "src/hooks/useBrowsePage"
import { MobileHeader } from "@/components/MobileHeader"
import { DesktopHeader } from "@/components/DesktopHeader"
import { HeroSection } from "@/components/HeroSection"
import { ContinueWatchingSection } from "@/components/ContinueWatchingSection"
import { AnimeCarousel } from "@/components/AnimeCarousel"
import { ActiveFiltersBar } from "@/components/ActiveFiltersBar"
import { BrowseResultsSection } from "@/components/BrowseResultsSection"
import { FilterDrawerContent } from "@/components/FilterDrawerContent"
import { SortMenu } from "@/components/SortMenu"
import { BottomMobileNav } from "@/components/BottomMobileNav"
import { sortOptions } from "@/lib/constants/sortOptions"
import { ModalData } from "@/types/modal"
import { AnimeCardModal } from "@/components/AnimeCardModal"
import { useIsExtension } from "@/lib/isExtension"

const App: React.FC = () => {
  const {
    featuredAnime, continueWatchingList,
    topSeries, now, fanFavorites, lastSeason, movies, shounen, sliceOfLife, classics, loadingStates,
    nowRef, fanFavRef, lastSeasonRef, moviesRef, shounenRef, sliceOfLifeRef, classicsRef,
    apiFilterOptions,
    animeList, initialLoading, initialError, gridLoading, hasActiveQuery, showNewSeriesFilter,
    activeFilters, sortBy, searchQuery, yearInput,
    handleFilterChange, clearAllFilters, handleSortChange,
    handleSearchChange, setYearInput, setSearchQuery, removeActiveFilter, hasMore, handleLoadMore, handleGoHome,
  } = useBrowsePage()

  const extensionMode = useIsExtension()

  const [modalData, setModalData] = useState<ModalData | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false)
  const [isSearchExpanded, setIsSearchExpanded] = useState<boolean>(false)

  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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

  // modal handlers
  const handleCardEnter = (anime: AnimeData, rect: DOMRect) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)

    hoverTimeoutRef.current = setTimeout(() => {
      setModalData({anime, rect})
    }, 1200)
  }

  const handleCardLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
  }

  const handleCloseModal = () => {
    setModalData(null)
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
        handleGoHome={handleGoHome}
      />
        
      {/* desktop header */}
      <DesktopHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        sortOptions={sortOptions}
        onFilterToggle={() => setIsFilterOpen(prev => !prev)}
        handleGoHome={handleGoHome}
      />

      {/* hero section */}
      {!extensionMode && featuredAnime && ( 
        <HeroSection
          featuredAnime={featuredAnime}
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
            ${isFilterOpen ? "w-80" : "w-0 overflow-hidden"}`}
          >
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
          <div className="flex-1 p-4 sm:p-6 order-1 min-w-0">
          
            {/* active filters display */}
            {hasActiveQuery() && (
              <ActiveFiltersBar
                activeFilters={activeFilters}
                apiFilterOptions={apiFilterOptions}
                searchQuery={searchQuery}
                onRemoveFilter={removeActiveFilter}
                onClearSearch={() => setSearchQuery("")}
              />
            )}

            {/* conditional rendering */}
            {(initialLoading || gridLoading) && !animeList.length ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
                <p className="ml-4 text-lg">Loading anime and filters...</p>
              </div>
            ) : initialError ? (
              <div className="flex justify-center items-center h-48 text-red-500">
                <p className="text-lg">Error: {initialError}</p>
                <p className="ml-2">Please make sure your backend server is running and accessible.</p>
              </div>
            ) : hasActiveQuery() ? (
                  <BrowseResultsSection
                    animeList={animeList}
                    gridLoading={gridLoading}
                    hasMore={hasMore}
                    onLoadMore={handleLoadMore}
                    onCardEnter={handleCardEnter}
                    onCardLeave={handleCardLeave}
                    title="Browse Titles"
                    subtitle="Discover your next favorite series"
                  />
              ) : ( <div className="mx-auto px-4 py-6 max-w-7xl">
                      <div className="space-y-12">
                      {/* continue watching section */}
                      {!extensionMode && <ContinueWatchingSection animeList={continueWatchingList} />}

                      <div>
                        <AnimeCarousel
                          title="Top Rated Series"
                          items={topSeries}
                          onCardEnter={handleCardEnter}
                          onCardLeave={handleCardLeave}
                           />

                        <div ref={nowRef} className="w-full min-h-[350px]">
                          <AnimeCarousel
                              title="Don't miss this Season"
                              items={now}
                              loading={loadingStates.now}
                              onCardEnter={handleCardEnter}
                              onCardLeave={handleCardLeave}
                            />
                        </div>

                        <div ref={fanFavRef} className="w-full min-h-[350px]">
                          <AnimeCarousel
                            title="Fan Favorites"
                            items={fanFavorites}
                            loading={loadingStates.fanFavorites}
                            onCardEnter={handleCardEnter}
                            onCardLeave={handleCardLeave}
                          />
                        </div>

                        <div ref={moviesRef} className="w-full min-h-[350px]">
                          <AnimeCarousel
                            title="Movies We Love"
                            items={movies}
                            loading={loadingStates.movies}
                            onCardEnter={handleCardEnter}
                            onCardLeave={handleCardLeave}
                          />
                        </div>

                        <div ref={lastSeasonRef} className="w-full min-h-[350px]">
                          <AnimeCarousel
                            title="Last Time On..."
                            items={lastSeason}
                            loading={loadingStates.lastSeason}
                            onCardEnter={handleCardEnter}
                            onCardLeave={handleCardLeave}
                          />
                        </div>
                        
                        <div ref={shounenRef} className="w-full min-h-[350px]">
                          <AnimeCarousel
                            title="Shounen"
                            items={shounen}
                            loading={loadingStates.shounen}
                            onCardEnter={handleCardEnter}
                            onCardLeave={handleCardLeave}
                          />
                        </div>
                        
                        <div ref={sliceOfLifeRef} className="w-full min-h-[350px]">
                          <AnimeCarousel
                            title="Slice of Life"
                            items={sliceOfLife}
                            loading={loadingStates.sliceOfLife}
                            onCardEnter={handleCardEnter}
                            onCardLeave={handleCardLeave}
                            />
                        </div>

                        <div ref={classicsRef} className="w-full min-h-[350px]">
                          <AnimeCarousel
                            title="The Classics"
                            items={classics}
                            loading={loadingStates.classics}
                            onCardEnter={handleCardEnter}
                            onCardLeave={handleCardLeave}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              } 
          </div>
        </div>

      {/* bottom mobile navigation */}
      {!extensionMode && <BottomMobileNav />}
      {/* top level modal render */}
      {modalData && (
        <AnimeCardModal anime={modalData.anime} cardRect={modalData.rect} onClose={handleCloseModal} />
      )}
    </div>
  )
}
export default App