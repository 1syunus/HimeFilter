import { NextResponse } from "next/server";
import { JIKAN_API_URL, transformJikanAnime } from "@/lib/jikan";
import { AnimeData } from "@/types/index";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { encode } from "punycode";

// helper to introduce delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

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

        const CLIENT_PAGE_LIMIT = 24
        const clientPage = parseInt(searchParams.get("page") || "1", 10)

        // context awareness for privileging user year input
        const isDateFiltered = searchParams.has("start_date") || searchParams.has("end_date")
        const inputYear = parseInt(searchParams.get("start_date")?.substring(0, 4) || "0", 10)

        // const userSelectedTypes = searchParams.get('type')?.split(',') || []
        // const isShortTypeSelected = userSelectedTypes.some(type => ['music', 'pv', 'ona', 'special'].includes(type))
        const isFutureYear = isDateFiltered && inputYear > new Date().getFullYear()

        // smart pagination
        searchParams.delete("page")

        // endpoint for all filtering and searching
        const jikanEndpoint = `${JIKAN_API_URL}/anime`
        // create new url object from incoming
        const queryParams = new URLSearchParams(searchParams)
        queryParams.set("sfw", "true")
        queryParams.set("limit", "25")
        if (isFutureYear) {
            queryParams.delete("end_date")
        }

        const seenIds = new Set<number>()
        let validResults: any[] = []
        let jikanPage = 1
        const MAX_JIKAN_PAGES_TO_CHECK = 15

        // loop check until enough results found
        while (validResults.length < (CLIENT_PAGE_LIMIT * clientPage) && jikanPage <= MAX_JIKAN_PAGES_TO_CHECK) {
            queryParams.set("page", jikanPage.toString())
            const jikanUrl = `${jikanEndpoint}?${queryParams.toString()}`
            console.log(`AGGREGATING: Fetching Jikan page ${jikanPage}...`)
            
            const jikanResponse = await fetch(jikanUrl)
            if (!jikanResponse.ok) break

            const data = await jikanResponse.json()
            const rawAnimeList = data.data || []
            let newValidResults = rawAnimeList

            if (isDateFiltered) {
                if (isFutureYear) {
                    newValidResults = rawAnimeList
                } else {
                    newValidResults = rawAnimeList
                        .filter(hasEpisodes)
                        .filter(hasScore)
                        .filter(hasDurationOver5Minutes)
                }
            } else {
                newValidResults = rawAnimeList
                    .filter(isReleased)
                    .filter(hasEpisodes)
                    .filter(hasScore)
                    .filter(hasDurationOver5Minutes)
            }
            for (const anime of newValidResults) {
                if (!seenIds.has(anime.mal_id)) {
                    seenIds.add(anime.mal_id)
                    validResults.push(anime)
                }
            }
            
            jikanPage++

            await delay(500)
        }

        const startIndex = (clientPage - 1) * CLIENT_PAGE_LIMIT
        const endIndex = (startIndex + CLIENT_PAGE_LIMIT)
        const pageData = validResults.slice(startIndex, endIndex)

        const transformedData = pageData.map(transformJikanAnime)
     
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