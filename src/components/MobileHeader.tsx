import React from "react"
import {Menu, Search, X} from "lucide-react"

export interface MobileHeaderProps {
    onMobileMenuToggle: () => void
    isSearchExpanded: boolean
    onSearchExpand: (isExpanded: boolean) => void
    searchQuery: string
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onSearchClear: () => void
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
    onMobileMenuToggle,
    isSearchExpanded,
    onSearchExpand,
    searchQuery,
    onSearchChange,
    onSearchClear
}) => {
    return (
        <header className="lg:hidden bg-black bg-opacity-90 backdrop-blur-md border-b border-gray-800 px-4 py-3 sticky top-0 z-50">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={onMobileMenuToggle}
                        className="p-2 text-white hover:text-orange-400 transition-colors"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <h1 className="text-lg font-bold text-orange-500">
                        Hime<span className="text-white">Filter</span>
                    </h1>
                    </div>

                    {/* mobile search expand toggle */}
                    <div className="flex items-center space-x-2">
                    {!isSearchExpanded ? (
                        <button
                            onClick={() => onSearchExpand(true)}
                            className="p-2 text-white hover:text-orange-400 transition-colors"
                        >
                            <Search className="w-5 h-5" />
                        </button>
                    ) : (
                        <div className="flex items-center space-x-2">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="search..."
                                    value={searchQuery}
                                    onChange={onSearchChange}
                                    className="
                                        w-48 pl-3 pr-8 py-2
                                        bg-gray-800 border border-gray-700 rounded-lg
                                        text-white placeholder-gray-400
                                        focus:outline-none focus:border-orange-500
                                        text-sm
                                    "
                                    autoFocus
                                />
                                <button
                                    onClick={() => {
                                        onSearchExpand(false)
                                        onSearchClear()
                                    }}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                    </div>
            </div>
        </header>
    )
}