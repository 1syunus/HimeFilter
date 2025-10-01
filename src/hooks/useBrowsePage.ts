import { useCallback } from "react";
import { useAnimeFilters } from "./useAnimeFilters";
import { useAnimePagination } from "./useAnimePagination";
import { usePageData } from "./usePageData";
import { useLazyCarousels } from "./useLazyCarousels";
import { useAnimeFetch } from "./useAnimeFetch";

export const useBrowsePage = () => {
    const {page, setPage, hasMore, setHasMore, handleLoadMore} = useAnimePagination()
    const filters = useAnimeFilters(setPage, setHasMore)
    const pageData = usePageData()
    const lazyCarousels = useLazyCarousels()

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
        page,
        setHasMore,
        showNewSeriesFilter: filters.showNewSeriesFilter,
        hasActiveQuery: activeQuery,
        isLoadMore: page > 1,
    })

    // handlers
    // handler to return home
    const handleGoHome = useCallback(() => {
        filters.clearAllFilters()
        setPage(1)
        setHasMore(true)
    }, [filters, setPage, setHasMore])

    return {
        // homepage
        featuredAnime: pageData.featuredAnime,
        continueWatchingList: pageData.continueWatchingList,
        topSeries: pageData.topSeries,
        apiFilterOptions: pageData.apiFilterOptions,
        initialLoading: pageData.initialLoading,
        initialError: pageData.error,

        // filter/sort state + handlers
        ...filters,

        // carousel state
        ...lazyCarousels,

        // pagination state + handlers
        page, hasMore, handleLoadMore,

        // grid state
        animeList: gridData.animeList,
        gridLoading: gridData.loading,
        gridError: gridData.error,
        showNewSeriesFilter: filters.showNewSeriesFilter,

        // derived
        hasActiveQuery,

        // handlers
        handleGoHome,
    }
}