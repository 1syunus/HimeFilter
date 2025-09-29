import {useEffect, useState, useCallback} from "react"
import { useDebounce } from "./useDebounce"
import { ActiveFilters, SortOption } from "../types"

const initialFilters: ActiveFilters = {
    contentType: [], audioLanguages: [], subtitleLanguages: [], status: [], year: "", genres: [], season: ""
}

export const useAnimeFilters = () => {
    const [activeFilters, setActiveFilters] = useState<ActiveFilters>(initialFilters)
    const [searchQuery, setSearchQuery] = useState<string>("")
    const [yearInput, setYearInput] = useState<string>("")
    const [sortBy, setSortBy] = useState<SortOption>("newest")

    const debouncedQuery = useDebounce(searchQuery, 300)
    const debouncedYear = useDebounce(yearInput, 700)

    // useEffect for updating debounced year input
    useEffect(() => {
      setActiveFilters(currentFilters => ({
        ...currentFilters,
        year: debouncedYear
      }))
    }, [debouncedYear])

    // clear filters on search
    useEffect(() => {
      if (debouncedQuery) {
        setActiveFilters(initialFilters)
        setYearInput("")
      }
    }, [debouncedQuery])

    // derived state
      // dating helpers
    const currentYear = new Date().getFullYear().toString()
    const showNewSeriesFilter = !activeFilters.year || activeFilters.year === currentYear

    // handle changing filters
    const handleFilterChange = useCallback((category: keyof ActiveFilters, value: string): void => {
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
    }, [])

    // individual active filter remover 
    const removeActiveFilter = useCallback((category: keyof ActiveFilters, value?: string): void => {
      if (value) {
        handleFilterChange(category, value)
      } else {
        setActiveFilters(prev => ({
          ...prev,
          [category]: Array.isArray(prev[category]) ? [] : ""
        }))
      }
    }, [handleFilterChange])

    // handle clearing all active filters
    const clearAllFilters = useCallback((): void => {
      setActiveFilters(initialFilters)
      setSearchQuery("")
      setYearInput("")
      setSortBy("newest")
    }, [])

    // sorting handler
    const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>): void => {
      setSortBy(e.target.value as SortOption)
    }, [])

    // search handler
    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
      setSearchQuery(e.target.value)
    }, [])
    
    return {
      activeFilters, searchQuery, yearInput, sortBy, debouncedQuery, showNewSeriesFilter,
      handleFilterChange, removeActiveFilter, clearAllFilters, handleSortChange, handleSearchChange, 
      setYearInput, setSearchQuery
    }
}