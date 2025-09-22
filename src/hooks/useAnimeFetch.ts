import { useEffect, useCallback, useState } from "react";
import { AnimeData, ActiveFilters, SortOption } from "../types";
import { getCurrentSeason } from "@/lib/dateUtils";

interface UseAnimeFetchProps {
    activeFilters: ActiveFilters
    sortBy: SortOption
    debouncedQuery: string
    page: number
    setHasMore: (hasMore: boolean) => void
    showNewSeriesFilter: boolean
    hasActiveQuery: boolean
}

export const useAnimeFetch = ({
    activeFilters, sortBy, debouncedQuery, page, setHasMore, showNewSeriesFilter, hasActiveQuery}: UseAnimeFetchProps) => {
        const [animeList, setAnimeList] = useState<AnimeData[]>([])
        const [loading, setLoading] = useState<boolean>(true)
        const [error, setError] = useState<string | null>(null)

        // query builder
        const buildQueryParams = useCallback(() => {
          const params = new URLSearchParams()
          params.append("page", page.toString())
      
          // add search query if exists
          if (debouncedQuery) {
            params.append("q", debouncedQuery)
          }
        
          // const isYearFilterActive = !!activeFilters.year
          switch (sortBy) {
            case "newest":
              params.append("order_by", "start_date")
              params.append("sort", "desc")
              break
            
            case "popular":
              params.append("order_by", "score")
              params.append("sort", "desc")
              break

            case "alphabetical":
              params.append("order_by", "title")
              params.append("sort", "asc")
              break
          }
        
          Object.entries(activeFilters).forEach(([key, value]) => {
            let paramKey = key
            if (key === "contentType") {paramKey = "type"}
      
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
        }, [activeFilters, sortBy, debouncedQuery, page, showNewSeriesFilter])

          // perform fetch
          useEffect(() => {
            const controller = new AbortController()
            const signal = controller.signal

            const fetchData = async () => {
                setLoading(true)
                setError(null)

                const params = buildQueryParams()

                // no fetch on page load
                if (page === 1 && !hasActiveQuery) {
                    setAnimeList([])
                    setLoading(false)
                    return
                  }

                try {
                    const response = await fetch(`/api/anime?${params.toString()}`, { signal })
                    if (!response.ok) throw new Error(`API error: ${response.statusText}`)
                        
                    const data: AnimeData[] = await response.json()
                    setAnimeList(prev => (page > 1 ? [...prev, ...data] : data))
                    setHasMore(data.length > 0)
                } catch (err: unknown) {
                    if (err instanceof Error && err.name !== "AbortError") {
                        setError(err.message)
                    }
                } finally {
                    setLoading(false)
                }
            }

            fetchData()

            return () => controller.abort()
          }, [sortBy, hasActiveQuery, page, buildQueryParams, setHasMore])
          
          return {animeList, loading, error, showNewSeriesFilter, setAnimeList}
    }