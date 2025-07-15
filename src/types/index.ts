// type defs
export interface AnimeData {
  id: number
  title: string
  description: string
  type: "Series" | "Movie" | "OVA" | string
  audioLanguages: string[]
  subtitleLanguages: string[]
  status: "Ongoing" | "Completed" | "New This Week" | string
  year: number
  episodes: number
  rating: number
  genres: string[]
  image: string
  largeImage?: string
  heroImage?: string
  trailerUrl?: string
  duration: string
}

export interface ApiData {
  availableAudioLanguages: string[]
  availableSubtitleLanguages: string[]
  availableGenres: string[]
  contentTypes: string[]
  statusOptions: string[]
}

export interface FilterOptions {
  genre: string | null
  type: string | null
  status: string | null
  // tbc
}