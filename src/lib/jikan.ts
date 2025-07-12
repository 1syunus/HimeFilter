// utility code for Jikan
import {AnimeData} from "@/types/index"

export const JIKAN_API_URL = "https://api.jikan.moe/v4"

// note: @param jikanAnime - raw anime object
// @returns - transformed object

// TODO: define proper interfaces
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformJikanAnime(jikanAnime: any): AnimeData {
    const title = jikanAnime.title_english || jikanAnime.title || "N/A"
    const description = jikanAnime.synopsis || "no description available"
    const type = jikanAnime.type || "unknown"
    const status = jikanAnime.status || "unknown"
    const year = jikanAnime.year || 0
    const episodes = jikanAnime.episodes || 0
    const rating = jikanAnime.score || 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const genres = jikanAnime.genres ? jikanAnime.genres.map((g: any) => g.name) : []
    const duration = jikanAnime.duration || "N/A"
    const imageUrl = jikanAnime.images?.webp?.image_url || jikanAnime.images?.jpg?.image_url || "https://dummyimage.com/480x720/555/fff&text=No+Image"
    const heroImage = jikanAnime.images?.webp?.large_image_url || jikanAnime.images?.jpg?.large_image_url || imageUrl
    const trailerUrl = jikanAnime.trailer?.embed_url || ""

    // tbd
    const audioLanguages: string[] = []
    const subtitleLanguages: string[] = []

    return {
        id: jikanAnime.mal_id,
        title,
        description,
        type,
        audioLanguages,
        subtitleLanguages,
        status,
        year,
        episodes,
        rating,
        genres,
        duration,
        image: imageUrl,
        heroImage,
        trailerUrl,
    }
}