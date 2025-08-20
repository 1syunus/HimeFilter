import { NextResponse } from "next/server";
import { JIKAN_API_URL, transformJikanAnime } from "@/lib/jikan";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { encode } from "punycode";

// helper function for filtering future/0-ep titles
const isReleased = (anime: {aired: {from: string | null}}): boolean => {
    if (!anime.aired?.from) {
        return false
    }
    const startDate = new Date(anime.aired.from)
    return !isNaN(startDate.getTime()) && startDate <= new Date()
}

// helper to check valid episode count
const hasEpisodes = (anime: {episodes: number | null}): boolean => {
    return anime.episodes === null || anime.episodes > 0
}

// score helper
const hasScore = (anime: {score: number | null}): boolean => {
    return anime.score !== null && anime.score > 0
}

// duration helper
const hasDurationOver5Minutes = (anime: {duration: string | null}): boolean => {
    if (!anime.duration) return false

    const durationRegex = /(?:(\d+)\s*hr)?\s*(?:(\d+)\s*min)?/i
    const match = anime.duration?.match(durationRegex)

    if (!match) return false

    const hours = match[1] ? parseInt(match[1]) : 0
    const minutes = match[2] ? parseInt(match[2]) : 0
    const totalMinutes = hours * 60 + minutes

    return totalMinutes >= 5
}

export async function GET(request: Request) {
    try {
        const {searchParams} = new URL(request.url)
        // endpoint for all filtering and searching
        const jikanEndpoint = `${JIKAN_API_URL}/anime`
        // create new url object from incoming
        const queryParams = new URLSearchParams(searchParams)
        queryParams.set("sfw", "true")
        const query = searchParams.get("q") || ""

        const jikanUrl = `${jikanEndpoint}?${queryParams.toString()}`
        console.log(`fetching filtered/searched data from ${jikanUrl}`)

        const jikanResponse = await fetch(jikanUrl)
        if (!jikanResponse.ok) {
            const errorData = await jikanResponse.json()
            throw new Error(`Jikan API error: ${jikanResponse.status} - ${errorData.message || jikanResponse.statusText}`)            
        }
        const data = await jikanResponse.json()
        const rawAnimeList = data.data || []
        const filteredList = rawAnimeList.filter(isReleased)
            .filter((anime: {episodes: number | null}) => anime.episodes && anime.episodes > 0)
        const transformedData = filteredList.map(transformJikanAnime)
        return NextResponse.json(transformedData)    
    } catch (error: unknown) {
        console.error("Error in /api/anime route:", error)
        let errorMessage = "Unknown error"
        if (error instanceof Error) {
            errorMessage = error.message
        } else if (typeof error === "string") {
            errorMessage = error
        }
        return NextResponse.json(
            {message: "Failed to fetch data", error: errorMessage},
            {status: 500}
        )
    }
    
}