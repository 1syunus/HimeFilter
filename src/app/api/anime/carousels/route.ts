import { NextResponse } from "next/server";
import { JIKAN_API_URL } from "@/lib/jikan";
import { filterAnimeList } from "@/lib/animeUtils";

export async function GET(request: Request) {
    try {
        const {searchParams} = new URL(request.url)
        
        const page = searchParams.get("page") || "1"
        const limit = searchParams.get("limit") || "40"
        const genre = searchParams.get("genres")
        const type = searchParams.get("type")
        const status = searchParams.get("status")
        const startDate = searchParams.get("start_date")
        const endDate = searchParams.get("end_date")
        // const filter = searchParams.get("filter")
        const orderBy = searchParams.get("order_by")

        const jikanEndpoint: string = `${JIKAN_API_URL}/anime`
        const queryParams = new URLSearchParams()

        // pagination parameters
        queryParams.append("page", page)
        queryParams.append("limit", limit)

        // if (genre || type || status || startDate || endDate) {
            if (genre) queryParams.append("genres", genre);
            if (type) queryParams.append("type", type);
            if (status) queryParams.append("status", status);
            if (startDate) queryParams.append("start_date", startDate);
            if (endDate) queryParams.append("end_date", endDate);
            if (orderBy) queryParams.append("order_by", orderBy)
            queryParams.set("sfw", "true")
            queryParams.set("limit", "24")

            if (!queryParams.has("sort")) {
                queryParams.append("sort", "desc")
            }

            if (!queryParams.has("order_by")) {
                queryParams.append("order_by", "score")
            }

        const jikanUrl = `${jikanEndpoint}?${queryParams.toString()}`
        
        const response = await fetch(jikanUrl, { next: { revalidate: 3600 } })

        if (!response.ok) throw new Error(`Jikan API error: ${response.statusText}`)

        const data = await response.json()

        const cleanData = filterAnimeList(data.data || [])

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