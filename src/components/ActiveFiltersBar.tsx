import React from "react";
import { ActiveFilters, FilterOptionsResponse } from "../types";
import { X } from "lucide-react";

interface ActiveFiltersBarProps {
    activeFilters: ActiveFilters
    apiFilterOptions: FilterOptionsResponse
    searchQuery: string
    onRemoveFilter: (category: keyof ActiveFilters, value?: string) => void
    onClearSearch: () => void
}

export const ActiveFiltersBar: React.FC<ActiveFiltersBarProps> = ({
    activeFilters, apiFilterOptions, searchQuery, onRemoveFilter, onClearSearch,
}) => {
    return (
        <div className="mb-6 flex flex-wrap gap-2">
            {searchQuery && (
                <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm flex items-center">
                    Search: &quot;{searchQuery}&quot;
                    <X className="w-4 h-4 ml-2 cursor-pointer" onClick={() => onClearSearch()} />
                </div>
            )}

            {Object.entries(activeFilters).map(([category, values]) => 
                Array.isArray(values) ? values.map((value) => {
                    let displayLabel = value
                    if (category === "genres") {
                    const match = apiFilterOptions.availableGenres.find(g => g.value === value)
                    if (match) displayLabel = match.label
                    }

                    return (
                        <div key={`${category}-${value}`}
                            className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm flex items-center">
                            {displayLabel}
                            <X
                                className="w-4 h-4 ml-2 cursor-pointer hover:text-orange-400"
                                onClick={() => onRemoveFilter(category as keyof ActiveFilters, value)}
                            />
                        </div>
                    )
                })
                : values && (
                    <div key={category} className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm flex items-center">
                        {category} : {typeof values === "string" ? values : values.name}
                        <X
                            className="w-4 h-4 ml-2 cursor-pointer hover:text-orange-400"
                            onClick={() => onRemoveFilter(category as keyof ActiveFilters, values)}
                        />
                    </div>
                )
            )}
        </div>
    )
}