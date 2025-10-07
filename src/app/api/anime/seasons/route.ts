import { NextResponse } from "next/server";
import { JIKAN_API_URL, transformJikanAnime } from "@/lib/jikan";
import { filterAnimeList, hasEpisodes } from "@/lib/animeUtils";

export async function GET(request: Request) {
    try {
        const {searchParams} = new URL(request.url)
        
        const year = searchParams.get("year")
        const season = searchParams.get("season")

        let jikanUrl = ""

        if (year && season) {
            jikanUrl = `${JIKAN_API_URL}/seasons/${year}/${season.toLowerCase()}`
        } else {
            jikanUrl = `${JIKAN_API_URL}/seasons/now`
        }
        
        const response = await fetch(jikanUrl, { next: { revalidate: 3600 } })

        if (!response.ok) throw new Error(`Jikan API error: ${response.statusText}`)

        const data = await response.json()

        const rawAnimeList = data.data || []
        const cleanData = (year && season)
            ? filterAnimeList(rawAnimeList)
            : rawAnimeList.filter(hasEpisodes).map(transformJikanAnime)

        return NextResponse.json(cleanData)
    } catch (error: unknown) {
        console.error("Error in /api/carousels route:", error)
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