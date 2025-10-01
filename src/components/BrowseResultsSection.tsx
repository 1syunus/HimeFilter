import React from "react";
import { AnimeData } from "../types";
import { AnimeCard } from "./AnimeCard";

interface BrowseResultsSectionProps {
    animeList: AnimeData[]
    gridLoading: boolean
    hasMore: boolean
    onLoadMore: () => void
    title: string
    subtitle: string
}

export const BrowseResultsSection: React.FC<BrowseResultsSectionProps> = ({
    animeList, gridLoading, hasMore, onLoadMore, title, subtitle
}) => {
    if (animeList.length === 0 && !gridLoading) {
        return <div className="text-center p-8 text-gray-400">No results found.</div>
    }

    return (
        <>
            {/* section title */}
            <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{title}</h2>
                <p className="text-gray-400 text-sm">{subtitle}</p>
            </div>

            {/* results grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
                {animeList.map((anime: AnimeData) => (
                    <div key={anime.id} className="group cursor-pointer">
                        <AnimeCard anime={anime} />
                    </div>
                ))}
            </div>
            
            {/* load more btn/skeleton */}
            {animeList.length > 0 && (
                <div className="mt-8 sm:mt-12 text-center">
                    {gridLoading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="w-full aspect-[2/3] bg-gray-800 rounded-lg animate-pulse"></div>
                            ))}
                        </div>
                    ) : hasMore ? (
                        <button 
                            onClick={onLoadMore}
                            disabled={gridLoading}
                            className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
                        >
                            Load More Anime
                        </button>
                    ) : (
                        <></>
                    )}
                </div>
            )}
        </>
    )
}