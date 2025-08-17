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

export async function GET(request: Request) {
    try {
        const {searchParams} = new URL(request.url)
        // endpoint for all filtering and searching
        const jikanEndpoint = `${JIKAN_API_URL}/anime`
        // create new url object from incoming
        const queryParams = new URLSearchParams(searchParams)
        queryParams.set("sfw", "true")
        const query = searchParams.get("q") || ""
        // const page = searchParams.get("page") || "1"
        // const limit = searchParams.get("limit") || "24"

        // if (!query) {
        //     return NextResponse.json([])
        // }

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