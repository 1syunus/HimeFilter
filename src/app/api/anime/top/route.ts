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

        // base jikan urls: for topAnime or filtered lists use /anime; for fanfavorites use /top/anime
        let jikanEndpoint: string = `${JIKAN_API_URL}/top/anime`
        let queryParams = new URLSearchParams()

        // pagination parameters
        queryParams.append("page", page)
        queryParams.append("limit", limit)

        // Jikan filter params by request
        if (filter) {
            jikanEndpoint = `${JIKAN_API_URL}/top/anime`
            queryParams.append("filter", filter)
            // default to tv if no type
            queryParams.append("type", type || "tv")
        } else if (genre || type || status || startDate || endDate) {
            // request contains specific params but no "top" filter
            if (genre) queryParams.append("genres", genre);
            if (type) queryParams.append("type", type);
            if (status) queryParams.append("status", status);
            if (startDate) queryParams.append("start_date", startDate);
            if (endDate) queryParams.append("end_date", endDate);
            queryParams.append("sfw", "true")
            // default sort
            if (!queryParams.has("order_by")) {
                queryParams.append("order_by", "popularity")
                queryParams.append("sort", "desc")
            }
        } else {
            // default when NO params provided
            jikanEndpoint = `${JIKAN_API_URL}/top/anime`
            queryParams.append("type", "tv")
            // OPTION: below is another default but bypopularity will yield different popul than no params
            // Test: for some reason, seems to be higher res images w/ below params
            // queryParams.append("filter", "bypopularity")
        }

        const jikanUrl = `${jikanEndpoint}?${queryParams.toString()}`
        console.log(`fetching top anime data from ${jikanUrl}`)

        const jikanResponse = await fetch(jikanUrl)
        if (!jikanResponse.ok) {
            const errorData = await jikanResponse.json()
            throw new Error(`Jikan API error: ${jikanResponse.status} - ${errorData.message || jikanResponse.statusText}`)            
        }
        const data = await jikanResponse.json()
        const transformedData = data.data ? data.data.map(transformJikanAnime) : []
        
        return NextResponse.json(transformedData)    
    } catch (error: unknown) {
        console.error("Error fetching Jikan /top/anime API:", error)
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