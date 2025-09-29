import { NextResponse } from "next/server";
import { JIKAN_API_URL, RawJikanAnime, transformJikanAnime } from "@/lib/jikan";
import { delay, isReleased, hasEpisodes, hasScore, hasDurationOver5Minutes } from "@/lib/animeUtils";

export async function GET(request: Request) {
    try {
        const {searchParams} = new URL(request.url)

        const CLIENT_PAGE_LIMIT = 24
        const clientPage = parseInt(searchParams.get("page") || "1", 10)

        // context awareness for privileging user year input
        const isDateFiltered = searchParams.has("start_date") || searchParams.has("end_date")
        const inputYear = parseInt(searchParams.get("start_date")?.substring(0, 4) || "0", 10)

        const userSelectedTypes = searchParams.get("type")?.split(',') || []
        const isShortTypeSelected = userSelectedTypes.some(type => ["music", "pv", "ova", "ona", "special"].includes(type))
        
        // compare duration with user input
        const shouldIncludeByDuration = (anime: {duration: string | null}) => isShortTypeSelected || hasDurationOver5Minutes(anime)

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
        let validResults: RawJikanAnime[] = []
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
                    .filter(shouldIncludeByDuration)
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