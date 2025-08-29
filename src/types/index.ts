// core data structures
export interface Aired {
  from: string | null
  to: string | null
}

export interface AnimeGenre {
  id: number
  name: string
}

export interface AnimeData {
  id: number
  title: string
  description: string
  type: "Series" | "Movie" | "OVA" | string
  audioLanguages: string[]
  subtitleLanguages: string[]
  status: "Ongoing" | "Completed" | "New This Week" | string
  year: number
  aired: Aired
  episodes: number
  rating: number
  genres: AnimeGenre[]
  image: string
  largeImage?: string
  heroImage?: string
  trailerUrl?: string
  duration: string
}

// filtering/sorting
export type SortOption = "newest" | "season" | "popular" | "alphabetical"

export interface ActiveFilters {
  contentType: string[]
  audioLanguages: string[]
  subtitleLanguages: string[]
  status: string[]
  year: string
  // genres: {id: number; name: string}[]
  genres: string[]
  season: string
}

// api and component props
export interface ApiData {
  availableAudioLanguages: string[]
  availableSubtitleLanguages: string[]
  availableGenres: string[]
  contentTypes: string[]
  statusOptions: string[]
}

export interface FilterOption {
  value: string
  label: string
}

export interface FilterOptions {
  genre: {id: number; name: string} | null
  type: string | null
  status: string | null
  // tbc
}

export interface FilterOptionsResponse {
  availableAudioLanguages: string[]
  availableSubtitleLanguages: string[]
  availableGenres: FilterOption[]
  contentTypes: FilterOption[]
  statusOptions: FilterOption[]
  timeframeOptions: FilterOption[]
}

export interface FilterSectionProps {
  title: string
  options: Array<{value: string; label: string}>
  category: keyof ActiveFilters
  activeFilters: ActiveFilters
  onFilterChange: (category: keyof ActiveFilters, value: string) => void
}
