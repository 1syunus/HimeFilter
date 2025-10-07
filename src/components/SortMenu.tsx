import React from "react"
import { ChevronDown } from "lucide-react"

export interface SortOptionType {
  label: string
  value: string
}

interface SortMenuProps {
  sortBy: string
  onSortChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: SortOptionType[]
  variant?: "mobile" | "desktop"
}

export const SortMenu: React.FC<SortMenuProps> = ({
  sortBy,
  onSortChange,
  options,
  variant = "desktop",
}) => {
  // mobile variant
  if (variant === "mobile") {
    return (
      <div className="mt-8 border-t border-gray-700 pt-6">
        <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Sort By</h3>
        <select
          value={sortBy}
          onChange={onSortChange}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    )
  }

  // desktop variant (inside header)
  return (
    <div className="relative">
      <select
        value={sortBy}
        onChange={onSortChange}
        className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500 appearance-none pr-8 cursor-pointer"
      >
        {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
    </div>
  )
}