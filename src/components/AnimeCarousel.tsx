import React, {useEffect, useRef, useState } from "react"
import { AnimeCard } from "./AnimeCard"
import { AnimeData } from "../types"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CarouselProps {
    title: string
    items: AnimeData[]
    loading?: boolean
}

export const AnimeCarousel: React.FC<CarouselProps> = ({title, items, loading = false}) => {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(true)

    const checkScrollButtons = () => {
        if (scrollRef.current) {
            const {scrollLeft, scrollWidth, clientWidth} = scrollRef.current
            setCanScrollLeft(scrollLeft > 3)
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 3)
        }
    }

    useEffect(() => {
        checkScrollButtons()
        const scrollElement = scrollRef.current
        if (scrollElement && items?.length > 0) {
            checkScrollButtons()
            scrollElement.addEventListener("scroll", checkScrollButtons, {passive: true})
            // event listener for resize
            const handleResize = () => {
                setTimeout(checkScrollButtons, 100)
            }
            window.addEventListener("resize", handleResize)

            return () => {
                scrollElement.removeEventListener("scroll", checkScrollButtons)
                window.removeEventListener("resize", handleResize)
            }
        }
    }, [items])

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const isMobile = window.innerWidth < 640
            const scrollAmount =
                isMobile
                ? scrollRef.current.clientWidth * 0.7
                : scrollRef.current.clientWidth * 0.8
            // const scrollAmount = scrollRef.current.clientWidth * 0.8
            const scrollValue = direction === "left" ? -scrollAmount : scrollAmount
            scrollRef.current.scrollBy({left: scrollValue, behavior: "smooth"})
        }
    }

    if (loading) {
        return (
            <div className="mb-8">
                <div className="h-8 bg-gray-800 rounded w-1/3 mb-6 animate-pulse"></div>
                {/* scrollable container skeleton */}
                <div
                    className="flex flex-shrink-0 space-x-5 overflow-x-auto scrollbar-hide pb-4 px-4 sm:px-0 min-w-0 w-full"
                    style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    }}
                >
                    <div className="flex space-x-4 flex-shrink-0 w-48 sm:w-56">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="flex-shrink-0 w-48 sm:w-56">
                                <div className="w-full aspect-[2/3] bg-gray-800 rounded-lg animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (!items || items.length === 0) {
        return null
    }

    return (
        <div className="mb-8 group/carousel relative">
            {/* before had  max-w-full overflow-hidden above */}
            {/* title */}
            <div className="flex items-center justify-between mb-6 px-4 sm:px-0">
                <h2 className="text-xl sm:text-2xl font-bold text-white relative">
                    {title}
                    <div className="absolute -bottom-1 left-0 w-12 h-0.5 bg-gradient-to-r from-orange-500 to-transparent"></div>
                </h2>
            </div>

            {/* scroll btn container */}
            <div className="relative">
                {/* desktop scroll btns */}
                <button
                    onClick={() => canScrollLeft && scroll("left")}
                    className={`
                        absolute -left-6 top-1/3 -translate-y-1/2 z-20 
                        w-16 h-16
                        bg-gradient-to-r from-orange-400 to-transparent hover:from-orange-500
                        text-white rounded-full
                        transition-all duration-300 hidden
                        sm:flex items-center justify-center
                        ${!canScrollLeft ? "opacity-0 hover:opacity-0 pointer-events-none" : "opacity-20 hover:opacity-100"}
                    `}
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                    onClick={() => canScrollRight && scroll("right")}
                    className={`
                        absolute right-0 top-1/3 -translate-y-1/2 z-20
                        w-16 h-16
                        bg-gradient-to-l from-orange-400 to-transparent hover:from-orange-500
                        text-white rounded-full transition-all duration-300 hidden
                        sm:flex items-center justify-center
                        ${!canScrollRight ? "opacity-0 hover:opacity-0 pointer-events-none" : "opacity-20 hover:opacity-100"}
                    `}
                >
                    <ChevronRight className="w-6 h-6" />
                </button>

            {/* scrollable container */}
                <div
                    ref={scrollRef}
                    className="flex flex-shrink-0 space-x-5 overflow-x-auto scrollbar-hide pb-4 sm:px-0 min-w-0 w-full"
                    style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        scrollSnapType: "x mandatory",
                        width: "calc(100% - 3rem)",
                        WebkitOverflowScrolling: "touch",
                    }}
                >
                    {items.map((anime) => (
                        <div
                            key={`carousel-${title}-${anime.id}`}
                            className="flex-shrink-0 w-48 sm:w-48 lg:w-52 xl:w-56"
                            style={{scrollSnapAlign: "start"}}
                        >
                            <AnimeCard anime={anime} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}