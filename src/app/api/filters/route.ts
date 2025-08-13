import { NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { JIKAN_API_URL, transformJikanAnime } from "@/lib/jikan";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: Request) {
    try {
        const genresResponse = await fetch(`${JIKAN_API_URL}/genres/anime`)
        if (!genresResponse.ok) {
            const errorData = await genresResponse.json()
            throw new Error(`Jikan API genres error: ${genresResponse.status} - ${errorData.message || genresResponse.statusText}`)            
        }
        const genresData = await genresResponse.json()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const availableGenres = genresData.data
            ? genresData.data.map((g: {mal_id: number; name: string}) => ({
                value: g.mal_id.toString(),
                label: g.name
                }))
            : []
        // const availableGenres = genresData.data ? genresData.data.map((g: any) => ({id: g.mal_id, name: g.name})) : []
        
        // const contentTypes = ["TV", "Movie", "OVA", "Special", "ONA", "Music"]
        const contentTypesRaw = ["TV", "Movie", "OVA", "Special", "ONA", "Music"]
        const contentTypes = contentTypesRaw.map(type => ({
            value: type.toLowerCase(),
            label: type
        }))
        
        const statusOptions = [
            {label: "Finished Airing", value: "complete"},
            {label: "Currently Airing", value: "airing"},
            {label: "Not yet aired", value: "upcoming"}
        ]
        // tbd
        const availableAudioLanguages: string[] = []
        const availableSubtitleLanguages: string[] = []

        return NextResponse.json({
            availableAudioLanguages,
            availableSubtitleLanguages,
            availableGenres,
            contentTypes,
            statusOptions
        })
    } catch (error: unknown) {
        console.error("Error fetching Jikan filter options:", error)
        let errorMessage = "Unknown error"
        if (error instanceof Error) {
            errorMessage = error.message
        } else if (typeof error === "string") {
            errorMessage = error
        }
        return NextResponse.json(
            {message: "Failed to fetch filter options :(", error: errorMessage},
            {status: 500}
        )
    }
}