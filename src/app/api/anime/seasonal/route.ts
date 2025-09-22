import { NextResponse } from "next/server";
import { JIKAN_API_URL, transformJikanAnime } from "@/lib/jikan";
import { getPrevSeason } from "@/lib/dateUtils";
import { AnimeData } from "@/types/index";

export async function GET() {
    try {
        const {year, season} = getPrevSeason()
        const jikanUrl = `${JIKAN_API_URL}/seasons/${year}/${season}?limit=15`
        console.log(`Fetching last season's anime from: ${jikanUrl}`)
        const jikanResponse = await fetch(jikanUrl, {next: {revalidate: 86400}})

        if (!jikanResponse.ok) {
            throw new Error(`Jikan API error: ${jikanResponse.status} - ${jikanResponse.statusText}`)
        }

        const data = await jikanResponse.json()
        const transformedData = data.data ? data.data.map(transformJikanAnime) : []

        return NextResponse.json(transformedData)
    } catch (error: unknown) {
        console.error("Error in /api/seasonal route:", error)
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