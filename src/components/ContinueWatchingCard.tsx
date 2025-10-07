import React from "react"
import Image from "next/image"
import { AnimeData } from "../types"
import { Play } from "lucide-react"

interface ContinueWatchingCardProps {
    anime: AnimeData
}

export const ContinueWatchingCard: React.FC<ContinueWatchingCardProps> = ({anime}) => {
    return (
        <div key={`continue-${anime.id}`} className="group cursor-pointer">
            <div className="relative overflow-hidden rounded-lg bg-gray-800">
                <div className="w-full relative aspect-video bg-gray-700">
                    <Image
                        src={anime.largeImage || anime.image}
                        alt={anime.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                </div>

                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center">
                    <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* mock progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600">
                    <div className="h-full bg-orange-500 w-3/4"></div>
                </div>

                {/* mock episode info */}
                <div className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-70 px-2 py-1 rounded">
                    S1 E{Math.floor(Math.random() * 12) + 1}
                </div>
            </div>

            <div className="mt-3 space-y-1">
                <h3 className="font-semibold text-white group-hover:text-orange-400 transition-colors line-clamp-1">
                    {anime.title}
                </h3>
                <p className="text-sm text-gray-400 line-clamp-2">
                    {anime.description}
                </p>
            </div>
        </div>
    )
}