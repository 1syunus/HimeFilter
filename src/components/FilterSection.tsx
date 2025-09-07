import React from "react"
import { ActiveFilters, FilterOption, FilterSectionProps } from "../types"

interface ExtendedFilterSectionProps extends FilterSectionProps {
  variant: "mobile" | "desktop"
}

export const FilterSection: React.FC<FilterSectionProps> = ({
    title, options, category, activeFilters, onFilterChange
  }) => (
    <div className="mb-6">
      <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">{title}</h3>
      <div className="space-y-2">
        {options.map((option) => {
          const isActive = Array.isArray(activeFilters[category])
            ? activeFilters[category].includes(option.value)
            : activeFilters[category] === option.value
            
          return (
            <label key={option.value} className="flex items-center cursor-pointer group">
              <input
              type="checkbox"
              checked={isActive}
              onChange={() => onFilterChange(category, option.value)}
              className="sr-only"
              />
              <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center transition-all
              ${isActive
                ? "bg-orange-500 border-orange-500"
                : "border-gray-400 group-hover:border-orange-400"
              }`}>
                {isActive && (
                  <div className="w-2 h-2 bg-white rounded-sm"></div>
                )}
              </div>
                {option.label}
              <span className="text-gray-300 text-sm group-hover:text-white transition colors">
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )