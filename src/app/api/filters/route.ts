import { NextResponse } from "next/server";
import { JIKAN_API_URL } from "@/lib/jikan";
import { FilterOption } from "@/types/index";

// genres blocklist
const genreBlocklist = [
    "Avant Garde",
    "Award Winning",
    "Boys Love",
    "Girls Love",
    "Ecchi",
    "Erotica",
    "Harem",
    "Hentai",
    "Adult Cast",
    "Anthropomorphic",
    "CGDCT",
    "Childcare",
    "Combat Sports",
    "Crossdressing",
    "Gag Humor",
    "Gore",
    "High Stakes Game",
    "Love Polygon",
    "Magical Sex Shift",
    "Otaku Culture",
    "Reincarnation",
    "Reverse Harem",
    "Love Status Quo",
    "Showbiz",
    "Strategy Game",
    "Super Power",
    "Team Sports",
    "Time Travel",
    "Video Game",
    "Visual Arts",
    "Workplace",
    "Urban Fantasy",
    "Villainess"
]

export async function GET() {
    try {
        const genresResponse = await fetch(`${JIKAN_API_URL}/genres/anime`)
        if (!genresResponse.ok) {
            const errorData = await genresResponse.json()
            throw new Error(`Jikan API genres error: ${genresResponse.status} - ${errorData.message || genresResponse.statusText}`)            
        }
        const genresData = await genresResponse.json()
        const availableGenres: FilterOption[] = genresData.data
            ? genresData.data.map((g: {mal_id: number; name: string}) => ({
                value: g.mal_id.toString(),
                label: g.name
                }))
                .filter((genre: FilterOption) => !genreBlocklist.includes(genre.label))
            : []
        availableGenres.sort((a, b) => a.label.localeCompare(b.label))

        const contentTypesRaw = ["TV", "Movie", "OVA", "Special", "ONA", "Music"]
        const contentTypes: FilterOption[] = contentTypesRaw.map(type => ({
            value: type.toLowerCase(),
            label: type
        }))
        
        const statusOptions: FilterOption[] = [
            {label: "Currently Airing", value: "airing"},
            {label: "Finished Airing", value: "complete"},
            {label: "Not yet aired", value: "upcoming"}
        ]
        // tbd
        const availableAudioLanguages: string[] = []
        const availableSubtitleLanguages: string[] = []

        const timeframeOptions: FilterOption[] = [
            {label: "New this Season", value: "this-season"}
        ]

        return NextResponse.json({
            availableAudioLanguages,
            availableSubtitleLanguages,
            availableGenres,
            contentTypes,
            statusOptions,
            timeframeOptions
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