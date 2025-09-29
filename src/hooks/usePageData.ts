import { useState, useEffect, useRef } from "react";
import { AnimeData, FilterOptionsResponse } from "../types";

export const usePageData = () => {
    const didRunOnce = useRef(false)

    // store hero
    const [featuredAnime, setFeaturedAnime] = useState<AnimeData | null>(null)

    // store continue watching
    const [continueWatchingList, setContinueWatchingList] = useState<AnimeData[]>([])

    // store top carousel
    const [topSeries, setTopSeries] = useState<AnimeData[]>([])

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
            const [topRes, filtersRes, ] = await Promise.all([
                fetch("/api/anime/top?limit=24", {signal}),
                fetch("/api/filters", {signal}),
            ])

            if(!topRes.ok) {
                throw new Error(`Failed to fetch top anime data ${topRes.statusText}`)
            }

            if(!filtersRes.ok) {
                throw new Error(`Failed to fetch filter options ${filtersRes.statusText}`)
            }

            const topData: AnimeData[] = await topRes.json()

            const filtersData: FilterOptionsResponse = await filtersRes.json()

            setApiFilterOptions(filtersData)
            // featured: 1st item
            if (topData && topData.length > 0) {
                setFeaturedAnime(topData[0])
                setContinueWatchingList(topData.slice(0, 3))
                setTopSeries(topData)
            }
   
            } catch (err: unknown) {
                if (err instanceof Error && err.name !== "AbortError") {
                    setError(err.message)
                } 
                console.error("Failed to fetch initial data:", err)
            } finally {
                setInitialLoading(false)
            }
        }
            fetchInitialData()
            return () => controller.abort()
    }, [])

    return {
        featuredAnime,
        continueWatchingList,
        topSeries,
        apiFilterOptions,
        initialLoading, error
    }
    
}