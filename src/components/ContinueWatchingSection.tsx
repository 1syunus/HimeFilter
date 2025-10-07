import React from "react"
import { AnimeData } from "../types"
import { ContinueWatchingCard } from "./ContinueWatchingCard"

interface ContinueWatchingSectionProps {
    animeList: AnimeData[]
}

export const ContinueWatchingSection: React.FC<ContinueWatchingSectionProps> = ({animeList}) => {
    if (!animeList || animeList.length === 0) return null

    return (
        <section className="mb-12 sm:mb-16">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Continue Watching</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {animeList.map(anime => (
                    <ContinueWatchingCard key={`continue-${anime.id}`} anime={anime} />
                ))}
            </div>
        </section>
    )
}