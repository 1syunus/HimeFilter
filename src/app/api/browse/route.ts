import { NextResponse } from "next/server";
import { JIKAN_API_URL, transformJikanAnime } from "@/lib/jikan";

export async function GET(request: Request) {
    try {
        const {searchParams} = new URL(request.url)
        const page = searchParams.get("page") || "1"
        const limit = searchParams.get("limit") || "24"

        const jikanUrl = `${JIKAN_API_URL}/top/anime?type=tv&page=${page}&limt=${limit}`
        console.log("fetching browse data from jikan")

        const jikanResponse = await fetch(jikanUrl)
        if (!jikanResponse.ok) {
            const errorData = await jikanResponse.json()
            throw new Error(`Jikan API error: ${jikanResponse.status} - ${errorData.message || jikanResponse.statusText}`)            
        }
        const data = await jikanResponse.json()
        const transformedData = data.data ? data.data.map(transformJikanAnime) : []
        return NextResponse.json(transformedData)    
    } catch (error: any) {
        console.error("Error fetching Jikan browse API:", error)
        return NextResponse.json(
            {message: "Failed to fetch data", error: error.message || "Unknown error"},
            {status: 500}
        )
    }
}