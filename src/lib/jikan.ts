// utility code for Jikan
import {Aired, AnimeData} from "@/types/index"

export const JIKAN_API_URL = "https://api.jikan.moe/v4"

// define raw anime object structure (type safety)
interface RawJikanAired {
    from: string | null
    to: string | null
    prop: {
        from: {day: number | null; month: number | null; year: number | null}
        to: {day: number | null; month: number | null; year: number | null}
    }
    string: string
}
export interface RawJikanAnime {
    mal_id: number
    title: string
    title_english: string
    synopsis: string
    type: string
    episodes: number
    score: number
    genres: Array<{mal_id: number; name: string}>
    images: {
        jpg: {
            image_url: string
            small_image_url: string
            large_image_url: string
        }
        webp: {
            image_url: string
            small_image_url: string
            large_image_url: string
        }
    }
    trailer?: {
        embed_url?: string
        images?: {
            small_image_url?: string
            medium_image_url?: string
            large_image_url?: string
            maximum_image_url?: string
        }
    }
    aired: RawJikanAired | null
    status: string
    duration: string
}

export function transformJikanAnime(jikanAnime: RawJikanAnime): AnimeData {
    const title = jikanAnime.title_english || jikanAnime.title || "N/A"
    const description = jikanAnime.synopsis || "no description available"
    const type = jikanAnime.type || "unknown"
    const status = jikanAnime.status || "unknown"
    const year = jikanAnime.aired?.prop?.from?.year || (jikanAnime.aired?.string ? parseInt(jikanAnime.aired.string.match(/\b\d{4}\b/)?.[0] || "0", 10) : 0)
    const episodes = jikanAnime.episodes || 0
    const rating = jikanAnime.score || 0
    const genres = jikanAnime.genres
        ? jikanAnime.genres.map((g: {mal_id: number; name: string}) => ({
            id: g.mal_id, name: g.name,})) : []
    const duration = jikanAnime.duration || "N/A"
    const imageUrl = 
        jikanAnime.images.webp?.large_image_url ||
        jikanAnime.images.jpg?.large_image_url ||
        jikanAnime.images?.webp?.image_url ||
        jikanAnime.images?.jpg?.image_url ||
        "https://dummyimage.com/480x720/555/fff&text=No+Image"
    const largeImage = imageUrl
    const heroImage = jikanAnime.trailer?.images?.maximum_image_url || largeImage
    let trailerUrl = jikanAnime.trailer?.embed_url || ""
    if (trailerUrl) {
        const urlObj = new URL(trailerUrl)
        urlObj.search = ""
        trailerUrl = urlObj.toString()
    }
    const aired: Aired = {
        from: jikanAnime.aired?.from || null,
        to: jikanAnime.aired?.to || null
    }
    
    // tbd
    const audioLanguages: string[] = []
    const subtitleLanguages: string[] = []

    console.log("--- Transformed Anime Item ---")
    console.log("ID:", jikanAnime.mal_id)
    console.log("Title:", title)
    console.log("Image URL (portrait):", imageUrl)
    console.log("Large Image URL (landscape/high-res):", largeImage)
    console.log("Hero Image URL:", heroImage)
    console.log("Trailer URL (cleaned):", trailerUrl)
    console.log("----------------------------")

    return {
        id: jikanAnime.mal_id,
        title,
        description,
        type,
        audioLanguages,
        subtitleLanguages,
        status,
        year,
        aired,
        episodes,
        rating,
        genres,
        duration,
        image: imageUrl,
        largeImage: largeImage,
        heroImage: heroImage,
        trailerUrl,
    }
}