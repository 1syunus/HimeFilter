import { AnimeData } from "../types"
import { transformJikanAnime } from "./jikan"
 
// helper to introduce delay
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// helper function for filtering future/0-ep titles
export const isReleased = (anime: {aired: {from: string | null}}): boolean => {
    if (!anime.aired?.from) {
        return false
    }
    const startDate = new Date(anime.aired.from)
    return !isNaN(startDate.getTime()) && startDate <= new Date()
}

// helper to check valid episode count
export const hasEpisodes = (anime: {episodes: number | null}): boolean => {
    return anime.episodes === null || anime.episodes > 0
}

// score helper
export const hasScore = (anime: {score: number | null}): boolean => {
    return anime.score !== null && anime.score > 0
}

// duration helper
export const hasDurationOver5Minutes = (anime: {duration: string | null}): boolean => {
    if (!anime.duration) return false

    const durationRegex = /(?:(\d+)\s*hr)?\s*(?:(\d+)\s*min)?/i
    const match = anime.duration?.match(durationRegex)

    if (!match) return false

    const hours = match[1] ? parseInt(match[1]) : 0
    const minutes = match[2] ? parseInt(match[2]) : 0
    const totalMinutes = hours * 60 + minutes

    return totalMinutes >= 5
}

export const filterAnimeList = (animeList: any[]): AnimeData[] => {
    return animeList
        .filter(isReleased)
        .filter(hasEpisodes)
        .filter(hasScore)
        .filter(hasDurationOver5Minutes)
        .map(transformJikanAnime)
}