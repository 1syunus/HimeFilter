import { useState, useCallback, useEffect } from "react";
import { useAnimeFilters } from "./useAnimeFilters";
import { useAnimePagination } from "./useAnimePagination";
import { usePageData } from "./usePageData";
import { useAnimeFetch } from "./useAnimeFetch";

export const useBrowsePage = () => {
    // state to set view mode
    const [viewMode, setViewMode] = useState<"default" | "browse">("default")

    const filters = useAnimeFilters()
    const pagination = useAnimePagination()
    const pageData = usePageData()

    // derived state to choose default list or filtered list
    const hasActiveQuery = useCallback((): boolean => {
        return !!filters.debouncedQuery ||
            Object.values(filters.activeFilters).some(v => Array.isArray(v) ? v.length > 0 : !!v)
    }, [filters.debouncedQuery, filters.activeFilters])

    const activeQuery = hasActiveQuery()

    const gridData = useAnimeFetch({
        activeFilters: filters.activeFilters,
        sortBy: filters.sortBy,
        debouncedQuery: filters.debouncedQuery,
        page: pagination.page,
        setHasMore: pagination.setHasMore,
        showNewSeriesFilter: filters.showNewSeriesFilter,
        hasActiveQuery: activeQuery,
    })

    // handlers
    // handler for view switch btn
    const handleBrowseAll = useCallback(() => {
        setViewMode("browse")
    }, [])

    // handler to return home
    const handleGoHome = useCallback(() => {
        filters.clearAllFilters()
        pagination.setPage(1)
    }, [filters, pagination])

    // side effects
    // switch to browse view on query
    useEffect(() => {
        if (hasActiveQuery()) {
            setViewMode("browse")
        }
    }, [hasActiveQuery])

    // reset pagination on filter change
    useEffect(() => {
        if (pagination.page > 1) {
            pagination.setPage(1)
        }
    }, [filters.activeFilters, filters.sortBy, filters.debouncedQuery, pagination.setPage])


    return {
        // state
        viewMode, hasActiveQuery,

        // static data
        featuredAnime: pageData.featuredAnime,
        continueWatchingList: pageData.continueWatchingList,
        apiFilterOptions: pageData.apiFilterOptions,

        // filter/sort state + handlers
        ...filters,

        // pagination state + handlers
        ...pagination,

        // grid state
        animeList: gridData.animeList,
        loading: pageData.initialLoading || gridData.loading,
        error: pageData.error || gridData.error,
        showNewSeriesFilter: filters.showNewSeriesFilter,

        // handlers
        handleBrowseAll, handleGoHome,
    }
}