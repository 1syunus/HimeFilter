import React from "react"
import Image from "next/image"
import { AnimeData } from "../types"
import {Play, Star, Globe} from "lucide-react"

interface AnimeCardProps {
    anime: AnimeData
}

export const AnimeCard: React.FC<AnimeCardProps> = ({anime}) => {
    return (
        <a
            href={`https://www.crunchyroll.com/search?q=${encodeURIComponent(anime.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
        >
            <div className="relative overflow-hidden rounded-lg bg-gray-800 transition-transform duration-300 group-hover:scale-105">
                <div className="w-full aspect-[2/3] bg-gray-700">
                    <Image
                        src={anime.image}
                        alt={anime.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />
                </div>
                <div className="
                    absolute inset-0
                    bg-black bg-opacity-0 group-hover:bg-opacity-60
                    transition-all
                    flex items-center justify-center"
                >
                    <Play className="w-8 h-8 sm:w-12 sm:h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* contentType badge */}
                <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                    {anime.type}
                </div>
                
                {/* rating */}
                <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center">
                    <Star className="w-3 h-3 mr-1 fill-current text-yellow-400" />
                    {anime.rating}
                </div>
                
                {/* duration - mobile hidden */}
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded hidden sm:block">
                    {anime.duration}
                </div>
            </div>

            <div className="mt-2 sm:mt-3 space-y-1">
                <h3 className="font-semibold text-white group-hover:text-orange-400 transition-colors line-clamp-2 text-sm sm:text-base leading-tight">
                    {anime.title}
                </h3>
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-400">
                <span>{anime.episodes} ep{anime.episodes !== 1 ? "s" : ""}</span>
                <span>•</span>
                <span>{anime.year}</span>
                <span>•</span>
                <span className="flex items-center">
                    <Globe className="w-3 h-3 mr-1" />
                    {anime.audioLanguages.includes("English") ? "DUB" : "SUB"}
                </span>
                </div>
                <div className="flex flex-wrap gap-1">
                    {anime.genres.slice(0, 2).map((genre) => (
                        <span key={genre.id} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                            {genre.name}
                        </span>
                    ))}
                </div>
            </div>
        </a>
    )
}