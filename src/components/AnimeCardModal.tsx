import { useEffect, useState } from "react"
import ReactDOM from "react-dom"
import { AnimeData } from "../types"
import { useYouTubePlayer } from "src/hooks/useYouTubePlayer"
import {X, Star, Globe, ExternalLink, Info} from "lucide-react"

interface AnimeCardModalProps {
    anime: AnimeData
    onClose: () => void
    cardRect: DOMRect
}

export const AnimeCardModal: React.FC<AnimeCardModalProps> = ({anime, onClose, cardRect}) => {
    const {
        isMuted, videoError, handleVideoError, handleVideoLoad, toggleMute, togglePlayPause,
    } = useYouTubePlayer({
        hasVideo: Boolean(anime.trailerUrl),
        elementId: "modal-video",
    })
    
    // platform search functions
    const searchOnPlatform = (platform: string) => {
        const query = encodeURIComponent(anime.title)
        const urls: { [key: string]: string } = {
            crunchyroll: `https://www.crunchyroll.com/search?q=${query}`,
            netflix: `https://www.netflix.com/search?q=${query}`,
            hidive: `https://www.hidive.com/search?q=${query}`,
        }
        window.open(urls[platform], '_blank')
    }

    const openMAL = () => {
        window.open(`https://myanimelist.net/anime/${anime.id}`, '_blank')
    }

    // calc modal posit
    const getModalPosition = () => {
        const modalWidth = 400
        const modalHeight = 500

        // // attempt center above card
        // let left = cardRect.left + (cardRect.width / 2) - (modalWidth / 2)
        // let top = cardRect.top - modalHeight - 20 + window.scrollY

        // attempt to center on card
        let left = cardRect.left + window.scrollX
        let top = cardRect.top + window.scrollY - 75
        left = cardRect.left + (cardRect.width / 2) - (modalWidth / 2) + window.scrollX

        // ajust for offscreen horizontal
        if (left < 20) left = 20
        if (left + modalWidth > window.innerWidth - 20) {
            left = window.innerWidth - modalWidth - 20
        }

        // adjust for offscreen vertical
        if (top < 20) {
            top = cardRect.bottom + 20
        }

        return {left, top}
    }

    const [position, setPosition] = useState(() => getModalPosition())

    useEffect(() => {
    setPosition(getModalPosition())
    }, [])


    const modalContent = (
        <>
            {/* backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black/30"
                onClick={onClose}
            />

            {/* modal */}
            <div
                className="absolute z-50 bg-gray-900 rounded-xl shadow-2xl border border-gray-700 overflow-hidden"
                style={{
                    left: `${position.left}px`,
                    top: `${position.top}px`,
                    width: '400px',
                    maxHeight: '80vh'
                }}
            >
                {/* close btn */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 z-50 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* vid img hero */}
                <div className="relative w-full h-56 bg-gray-800 overflow-hidden">
                    {anime.trailerUrl && !videoError ? (
                        <>
                            <iframe
                                key={anime.trailerUrl}
                                id="modal-video"
                                className="w-full h-full object-cover"
                                src={`${anime.trailerUrl.split('?')[0]}?autoplay=1&mute=1&enablejsapi=1&controls=0&loop=1&playlist=${anime.trailerUrl.split('/').pop()?.split('?')[0]}&modestbranding=1&rel=0&iv_load_policy=3`}
                                allow="autoplay; encrypted-media"
                                allowFullScreen
                                onLoad={handleVideoLoad}
                                onError={handleVideoError}
                            >
                            </iframe>

                            {/* click overlay for play/pause */}
                            <div className="absolute inset-0 z-30 cursor-pointer pointer-events-auto" onClick={togglePlayPause} />

                            {/* mute toggle */}
                            <button
                                onClick={toggleMute}
                                className="absolute bottom-3 right-3 z-50
                                    bg-black/70 hover:bg-black/90
                                    text-white p-2 rounded-full transition-colors
                                    cursor-pointer pointer-events-auto"
                            >
                                {isMuted ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                </svg>
                                ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                </svg>
                                )}
                            </button>
                        </>
                    ) : (
                        <img 
                            src={anime.image} 
                            alt={anime.title}
                            className="w-full h-full object-cover"
                        />
                    )}
                    {/* gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />

                    {/* badges */}
                    <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                        {anime.type}
                    </div>

                    <div className="absolute top-3 right-12 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center">
                        <Star className="w-3 h-3 mr-1 fill-current text-yellow-400" />
                        {anime.rating}
                    </div>
                </div>

                {/* content */}
                <div className="p-5 max-h-[calc(80vh-14rem)] overflow-y-auto">
                    {/* meta */}
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                        {anime.title}
                    </h3>

                    <div className="flex items-center space-x-2 text-xs text-gray-400 mb-3">
                        <span>{anime.year}</span>
                        <span>•</span>
                        <span>{anime.episodes} ep{anime.episodes !== 1 ? 's' : ''}</span>
                        <span>•</span>
                        <span className="flex items-center">
                            <Globe className="w-3 h-3 mr-1" />
                            {anime.audioLanguages.includes('English') ? 'DUB' : 'SUB'}
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {anime.genres.map((genre) => (
                        <span 
                            key={genre.id} 
                            className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-md border border-gray-700"
                        >
                            {genre.name}
                        </span>
                        ))}
                    </div>

                    {/* description */}
                    {anime.description && (
                        <p className="text-sm text-gray-300 leading-relaxed mb-5 line-clamp-3">
                        {anime.description}
                        </p>
                    )}

                    {/* platform search btns */}
                    <div className="space-y-2">
                        <p className="text-xs text-gray-400 font-medium mb-2">Search on Streaming Platforms:</p>
                        
                        <button
                            onClick={() => searchOnPlatform('crunchyroll')}
                            className="w-full flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
                        >
                            <ExternalLink className="w-4 h-4" />
                            <span>Search on Crunchyroll</span>
                        </button>

                        <button
                            onClick={() => searchOnPlatform('netflix')}
                            className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
                        >
                            <ExternalLink className="w-4 h-4" />
                            <span>Search on Netflix</span>
                        </button>

                        <button
                            onClick={() => searchOnPlatform('hidive')}
                            className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
                        >
                            <ExternalLink className="w-4 h-4" />
                            <span>Search on HIDIVE</span>
                        </button>

                        <button
                            onClick={openMAL}
                            className="w-full flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
                        >
                            <Info className="w-4 h-4" />
                            <span>More Info (MyAnimeList)</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    )

    // render at root via portal
    return ReactDOM.createPortal(
        modalContent,
        document.getElementById("modal-root") as HTMLElement
    )
}
