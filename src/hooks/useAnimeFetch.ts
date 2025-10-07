import { useEffect, useCallback, useState } from "react";
import { AnimeData, ActiveFilters, SortOption } from "../types";

interface UseAnimeFetchProps {
    activeFilters: ActiveFilters
    sortBy: SortOption
    debouncedQuery: string
    page: number
    setHasMore: (hasMore: boolean) => void
    showNewSeriesFilter: boolean
}

// dating helpers
// const currentYear = new Date().getFullYear().toString()
// const showNewSeriesFilter = !activeFilters.year || activeFilters.year === currentYear

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

export const useAnimeFetch = ({
    activeFilters, sortBy, debouncedQuery, page, setHasMore, showNewSeriesFilter}: UseAnimeFetchProps) => {
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
                if (page === 1 && !debouncedQuery && !Object.values(activeFilters).some(v => 
                    Array.isArray(v) ? v.length > 0: v
                  )) 
                {
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
          }, [activeFilters, sortBy, debouncedQuery, page, buildQueryParams, setHasMore])
          
          return {animeList, loading, error, showNewSeriesFilter, setAnimeList}
    }