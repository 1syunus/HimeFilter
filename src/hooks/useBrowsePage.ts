import { useCallback, useEffect } from "react";
import { useAnimeFilters } from "./useAnimeFilters";
import { useAnimePagination } from "./useAnimePagination";
import { usePageData } from "./usePageData";
import { useAnimeFetch } from "./useAnimeFetch";

export const useBrowsePage = () => {
    const filters = useAnimeFilters()
    const pagination = useAnimePagination()
    const pageData = usePageData()
    const gridData = useAnimeFetch({
        activeFilters: filters.activeFilters,
        sortBy: filters.sortBy,
        debouncedQuery: filters.debouncedQuery,
        page: pagination.page,
        setHasMore: pagination.setHasMore,
        showNewSeriesFilter: filters.showNewSeriesFilter,
    })

    // reset pagination on filter change
    useEffect(() => {
        if (pagination.page > 1) {
            pagination.setPage(1)
        }
    }, [filters.activeFilters, filters.sortBy, filters.debouncedQuery, pagination.setPage])

    // derived state to choose default list or filtered list
    const hasActiveQuery = useCallback((): boolean => {
        return !!filters.debouncedQuery ||
            Object.values(filters.activeFilters).some(v => Array.isArray(v) ? v.length > 0 : !!v)
    }, [filters.debouncedQuery, filters.activeFilters])


    return {
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
        hasActiveQuery,
    }
}