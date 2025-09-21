import React from "react";
import {Search, Filter} from "lucide-react"
import { SortOption } from "../types";
import { SortMenu, SortOptionType } from "./SortMenu";

export interface DesktopHeaderProps {
    searchQuery: string
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    sortBy: SortOption
    onSortChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
    sortOptions: SortOptionType[]
    onFilterToggle: () => void
    handleGoHome: () => void
}

export const DesktopHeader: React.FC<DesktopHeaderProps> = ({
    searchQuery,
    onSearchChange,
    sortBy,
    onSortChange,
    sortOptions,
    onFilterToggle,
    handleGoHome,
}) => {
    return (

      <header className="hidden lg:block bg-black bg-opacity-90 backdrop-blur-md border-b border-gray-800 px-6 py-4 sticky top-0 z-50">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center space-x-6">
                    <h1 onClick={handleGoHome}
                        className="text-2xl font-bold text-orange-500">
                        Hime<span className="text-white">Filter</span>
                    </h1>
                    <nav className="flex space-x-6">
                        <a href="#" className="text-white hover:text-orange-400">Browse</a>
                        <a href="#" className="text-gray-400 hover:text-white">My List</a>
                        <a href="#" className="text-gray-400 hover:text-white">New & Popular</a>
                    </nav>
                </div>

                {/* desktop header options */}
                <div className="flex items-center space-x-4">
                    {/* desktop search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search anime..."
                            value={searchQuery}
                            onChange={onSearchChange}
                            className="
                                w-80 pl-10 pr-4 py-2
                                bg-gray-800 border border-gray-700 rounded-lg
                                text-white placeholder-gray-400
                                focus:outline-none focus:border-orange-500
                                transition-colors
                            "
                        />
                    </div>
                    
                    {/* desktop sort */}
                    <SortMenu
                        sortBy={sortBy}
                        onSortChange={onSortChange}
                        options={sortOptions}
                        variant="desktop"
                    />

                    {/* desktop filter menu toggler */}
                    <button
                        onClick={onFilterToggle}
                        className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
                    >
                        <Filter className="w-4 h-4" />
                        <span>Filters</span>
                    </button>
                </div>
            </div>
        </header>
    )
}