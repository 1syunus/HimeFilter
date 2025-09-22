import { useState, useEffect, useRef } from "react";
import { AnimeData, FilterOptionsResponse } from "../types";

export const usePageData = () => {
    const didRunOnce = useRef(false)

    // store hero
    const [featuredAnime, setFeaturedAnime] = useState<AnimeData | null>(null)

    // store continue watching
    const [continueWatchingList, setContinueWatchingList] = useState<AnimeData[]>([])

    // store filter options
    const [apiFilterOptions, setApiFilterOptions] = useState<FilterOptionsResponse>({
        availableAudioLanguages: [],
        availableSubtitleLanguages: [],
        availableGenres: [],
        contentTypes: [],
        statusOptions: [],
        timeframeOptions: [],
    })

    // loading state for default view and initial page render
    const [initialLoading, setInitialLoading] = useState(true)

    // error state
    const [error, setError] = useState<string | null>(null)

    // const [isReady, setIsReady] = useState(false)

    // fetch initial data
    useEffect(() => {
        if (didRunOnce.current) return
        didRunOnce.current = true

        const controller = new AbortController()
        const signal = controller.signal

        const fetchInitialData = async () => {
            setInitialLoading(true)
            setError(null)
        
            try {
            // fetch filter options
            const [topAnimeResponse, filtersResponse] = await Promise.all([
                fetch("/api/anime/top", {signal}),
                fetch("/api/filters", {signal})
            ])

            if(!topAnimeResponse.ok) {
                throw new Error(`Failed to fetch top anime data ${topAnimeResponse.statusText}`)
            }
            if(!filtersResponse.ok) {
                throw new Error(`Failed to fetch filter options ${filtersResponse.statusText}`)
            }

            const topAnimeData: AnimeData[] = await topAnimeResponse.json()
            const filtersData: FilterOptionsResponse = await filtersResponse.json()

            setApiFilterOptions(filtersData)
            // featured: 1st item
            if (topAnimeData && topAnimeData.length > 0) {
                setFeaturedAnime(topAnimeData[0])
                setContinueWatchingList(topAnimeData.slice(0, 3))
            }
            } catch (err: unknown) {
                if (err instanceof Error && err.name !== "AbortError") {
                    setError(err.message)
                } 
                console.error("Failed to fetch initial data:", err)
            } finally {
                setInitialLoading(false)
                // setIsReady(true)
            }
        }
            fetchInitialData()
            return () => controller.abort()
    }, [])

    return {featuredAnime, continueWatchingList, apiFilterOptions, initialLoading, error}
    
}