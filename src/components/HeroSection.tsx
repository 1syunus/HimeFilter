import React from "react"
import { AnimeData } from "../types"
import { useYouTubePlayer } from "src/hooks/useYouTubePlayer"
import {Star, Play, Info, Plus, VolumeX, Volume2} from "lucide-react"

export interface HeroSectionProps {
    featuredAnime: AnimeData
}

export const HeroSection: React.FC<HeroSectionProps> = ({featuredAnime}) => {
    const {
        isMuted, videoError, videoLoaded, handleVideoLoad, handleVideoError, toggleMute, togglePlayPause,
    } = useYouTubePlayer({
        hasVideo: Boolean(featuredAnime.trailerUrl),
    })


    return (

        <section className="relative h-[50v] sm:h-[60v] lg:h[80v] overflow-hidden">
            {/* click overlay for play/pause */}
            <div className="absolute inset-0 z-20 pointer-events-none">
              <div 
                onClick={togglePlayPause}
                className="absolute inset-0 cursor-pointer pointer-events-auto"
              />
            </div>

            {/* vid bg */}
            {featuredAnime.trailerUrl && !videoError ? (
                <iframe
                    key={featuredAnime.trailerUrl}
                    id="hero-video"
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    src={`${featuredAnime.trailerUrl.split('?')[0]}?autoplay=1&mute=1&enablejsapi=1&controls=0&loop=1&playlist=${featuredAnime.trailerUrl.split('/').pop()?.split('?')[0]}&modestbranding=1&rel=0&iv_load_policy=3`}
                    style={{border: "none"}}
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title={`${featuredAnime.title} Trailer`}
                    onLoad={handleVideoLoad}
                    onError={handleVideoError}
                ></iframe>
            ) : (
                // fallback img
                    <div 
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{
                            backgroundImage: `url(${featuredAnime.heroImage || featuredAnime.image})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center"                
                        }}
                    />
                )}

            {/* gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/30 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent z-10 pointer-events-none"></div>

            {/* video loading icon */}
            {!videoLoaded && featuredAnime.trailerUrl && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                </div>
            )}

            {/* vid info */}
            <div className="relative z-30 h-full flex flex-col justify-end px-4 sm:px-6 lg:px-12 pointer-events-none">
                <div className="max-w-2xl space-y-4 sm:space-y-6">
                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                        <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">
                            {featuredAnime.status}
                        </span>
                        <span>{featuredAnime.year}</span>
                        <span>•</span>
                        <span>{featuredAnime.episodes}</span>
                        <span>•</span>
                        <div className="flex items-center">
                            <Star className="w-3 h-3 mr-1 fil-current text-yellow-400" />
                            {featuredAnime.rating}
                        </div>
                    </div>

                    <h1 className="text-2xl sm:text-4xl lg:text-6xl font-bold leading-tight">
                        {featuredAnime.title}
                    </h1>

                    <p className="text-xs sm:text-base lg:text-lg text-gray-200 leading-relaxed max-w-xl line-clamp-3 sm:line-clamp-none">
                        {featuredAnime.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                        {featuredAnime.genres.slice(0, 3).map((genre) => (
                            <span key={genre.id} className="text-xs bg-gray-800/80 text-gray-300 px-3 py-1 rounded-full">
                                {genre.name}
                            </span>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2 items-center sm:items-end pointer-events-auto">
                        <a
                            href={`https://www.crunchyroll.com/search?q=${encodeURIComponent(featuredAnime.title)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center space-x-2
                                w-[90%] sm:w-auto
                                bg-white text-black
                                px-6 py-3
                                rounded-lg
                                font-semibold
                                opacity-70 sm:opacity-100
                                hover:bg-gray-200 transition colors
                                cursor-pointer
                            "
                        >
                            <Play className="w-5 h-5 fill-current" />
                            Watch Now
                        </a>

                        <button className="
                            flex items-center justify-center space-x-2 
                            w-[90%] sm:w-auto
                            bg-gray-600/80 text-white
                            px-4 sm:px-6 py-3 rounded-lg font-semibold
                            opacity-70 sm:opacity-100
                            hover:bg-gray-600 transition-colors
                            "
                        >
                            <Info className="w-5 h-5" />
                            <span>More Info</span>
                        </button>

                        <button className="
                            hidden sm:flex items-center justify-center space-x-2
                            w-[90%] sm:w-auto
                            bg-gray-800/80 text-white px-4 py-3 rounded-lg
                            opacity-70 sm:opacity-100
                            hover:bg-gray-700 transition-colors
                            "
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* audio controls */}
            {featuredAnime.trailerUrl && (
                <button
                    onClick={toggleMute}
                    className="absolute
                        top-4 sm:top-auto sm:bottom-4 right-4 z-30
                        bg-gray-800/80 hover:bg-gray-700
                        text-white
                        p-2 sm:p-3
                        rounded-full 
                        transition-colors
                        pointer-events-auto
                    "
                >
                    {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
            )}
        </section>
    )
}