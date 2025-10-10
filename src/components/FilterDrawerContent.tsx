import React from "react"
import {X, Filter} from "lucide-react"
import { FilterSection } from "./FilterSection"
import { ActiveFilters, FilterOption } from "../types"
import { toFilterOptions } from "@/lib/langUtils"

// props from page
export interface FilterDrawerContentProps {
    activeFilters: ActiveFilters
    filterOptions: {
        contentType: FilterOption[]
        audioLanguage:string[]
        subtitleLanguage:string[]
        status: FilterOption[]
        genres: FilterOption[]
        timeframes: FilterOption[]
    }
    yearInput: string
    showNewSeriesFilter: boolean
    onFilterChange: (category: keyof ActiveFilters, value: string) => void
    onClearFilters: () => void
    onClose?: () => void
    onYearChange: (value: string) => void
    variant: "mobile" | "desktop"
}

// internal component for shared filters
const FilterBlock: React.FC<FilterDrawerContentProps> = ({
    activeFilters, filterOptions, yearInput, showNewSeriesFilter, onFilterChange, onYearChange, variant
}) => {

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            const key = e.key
            if (e.ctrlKey || e.metaKey || 
                ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(key)
            ) {
                return
            }

            if (!/\d/.test(key) || (e.shiftKey && key !== ' ')) { 
                e.preventDefault()
            }
        }

    return (
    <div className="space-y-6">
        <FilterSection 
            title="Content Type"
            options={filterOptions.contentType}
            category="contentType"
            activeFilters={activeFilters}
            onFilterChange={onFilterChange}
        />
        <div className="border-t border-gray-700 pt-6">
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">
                {variant === "mobile" ? "Language" : "Language Options"}
            </h3>
            <FilterSection
                title={variant === "mobile" ? "Audio" : "Audio Language"}
                options={toFilterOptions(filterOptions.audioLanguage)}
                category="audioLanguages"
                activeFilters={activeFilters}
                onFilterChange={onFilterChange}
            />
            <FilterSection
                title={variant === "mobile" ? "Subtitles" : "Subtitle Language"}
                options={toFilterOptions(filterOptions.subtitleLanguage)}
                category="subtitleLanguages"
                activeFilters={activeFilters}
                onFilterChange={onFilterChange}
            />
        </div>
        <FilterSection
            title="Status"
            options={filterOptions.status}
            category="status"
            activeFilters={activeFilters}
            onFilterChange={onFilterChange}
        />
        {showNewSeriesFilter && (
            <FilterSection
                title="New Series"
                options={filterOptions.timeframes}
                category="season"
                activeFilters={activeFilters}
                onFilterChange={onFilterChange}
            />
        )}
        <FilterSection
            title="Genres"
            options={filterOptions.genres}
            category="genres"
            activeFilters={activeFilters}
            onFilterChange={onFilterChange}
        />
        <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">
                {variant === "mobile" ? "Year" : "Release Year"}
            </h3>
            <input
                type="number"
                placeholder="e.g., 2024"
                value={yearInput}
                onChange={(e) => onYearChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="
                    w-full px-3 py-2
                    bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400
                    focus:outline-none focus:border-orange-500
                "
            />
        </div>
    </div>
)}

export const FilterDrawerContent: React.FC<FilterDrawerContentProps> = (props) => {
    const {onClose, onClearFilters, variant = "desktop"} = props

    // mobile variant
    if (variant === "mobile") {
        return (
            <>
                {/* mobile header */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-semibold text-white pl-10">Filters</h2>
                    <Filter className="w-5 h-5 text-orange-500" />
                </div>

                {/* mobile clear all */}
                <button
                    onClick={onClearFilters}
                    className="w-full mb-6 text-sm text-gray-400 hover:text-orange-400 transition-colors text-left"
                >
                    Clear All Filters
                </button>
                <FilterBlock {...props} />               
            </>
        )
    }

    // desktiop variant
    return (
        <>
            {/* desktop header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                    <Filter className="w-5 h-5 text-orange-500" />
                    <h2 className="text-lg font-semibold text-white">Filters</h2>
                </div>
                <button
                    onClick={onClearFilters}
                    className="text-sm text-gray-400 hover:text-orange-400 transition-colors"
                >
                    Clear All
                </button>
            </div>
            <FilterBlock {...props} />
        </>
    )
}
