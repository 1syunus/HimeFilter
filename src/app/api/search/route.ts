import { NextResponse } from "next/server";
import { JIKAN_API_URL, transformJikanAnime } from "@/lib/jikan";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { encode } from "punycode";

export async function GET(request: Request) {
    try {
        const {searchParams} = new URL(request.url)
        const query = searchParams.get("q") || ""
        const page = searchParams.get("page") || "1"
        const limit = searchParams.get("limit") || "24"

        if (!query) {
            return NextResponse.json([])
        }

        const jikanUrl = `${JIKAN_API_URL}/anime?q=${encodeURIComponent(query)}&$sfw=true&page=${page}&limit=${limit}`
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