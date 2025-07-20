import { NextResponse } from "next/server";
import { JIKAN_API_URL, transformJikanAnime } from "@/lib/jikan";
import { query } from "express-validator";

export async function GET(request: Request) {
    try {
        const {searchParams} = new URL(request.url)

        const page = searchParams.get("page") || "1"
        const limit = searchParams.get("limit") || "24"
        const genre = searchParams.get("genre")
        const type = searchParams.get("type")
        const status = searchParams.get("status")
        const startDate = searchParams.get("start_date")
        const endDate = searchParams.get("end_date")
        const filter = searchParams.get("filter")

        // base jikan urls: for browse or filtered lists use /anime; for fanfavorites use /top/anime
        let jikanEndpoint = `${JIKAN_API_URL}/anime`
        let queryParams = new URLSearchParams()

        // pagination parameters
        queryParams.append("page", page)
        queryParams.append("limit", limit)

        // add filter params
        if (genre) {
            // checking w/ genre param, but jikan uses ids. will map later?
            queryParams.append("genres", genre)
        }

        if (type) {
            queryParams.append("type", type)
        }

        if (status) {
            queryParams.append("status", status)
        }

        if (startDate) {
            queryParams.append("start_date", startDate)
        }

        if (endDate) {
            queryParams.append("end_date", endDate)
        }

        // handle fanfavorites case
        if (filter === "bypopularity" || filter === "airing" || filter === "upcoming") {
            jikanEndpoint = `${JIKAN_API_URL}/top/anime`
            queryParams.append("filter", filter)
            // general check before movies vs tv specifity
            if (!type) {
                queryParams.append("type", "tv")
            }
        } else {
            // sfw for general searches
            queryParams.append("sfw", "true")
        }

        const jikanUrl = `${JIKAN_API_URL}?${queryParams.toString()}`
        console.log(`fetching browse data from ${jikanUrl}`)

        const jikanResponse = await fetch(jikanUrl)
        if (!jikanResponse.ok) {
            const errorData = await jikanResponse.json()
            throw new Error(`Jikan API error: ${jikanResponse.status} - ${errorData.message || jikanResponse.statusText}`)            
        }
        const data = await jikanResponse.json()
        const transformedData = data.data ? data.data.map(transformJikanAnime) : []
        return NextResponse.json(transformedData)    
    } catch (error: unknown) {
        console.error("Error fetching Jikan browse API:", error)
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