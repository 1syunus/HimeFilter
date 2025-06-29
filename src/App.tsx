import React, {useState, useEffect} from "react"
import {Search, Filter, X, ChevronDown, Calendar, Star, Globe, Play, Menu, Info, Plus, Volume2, VolumeX} from "lucide-react"

// type defs
interface AnimeData {
  id: number
  title: string
  description: string
  type: "Series" | "Movie" | "OVA"
  audioLanguages: string[]
  subtitleLanguags: string[]
  status: "Ongoing" | "Completed" | "New This Week"
  year: number
  episodes: number
  rating: number
  genres: string[]
  image: string
  heroImage?: string
  trailerUrl?: string
  duration: string
}

interface ApiData {
  availableAudioLanguages: string[]
  availableSubtitleLanguages: string[]
  availableGenres: string[]
  contentTypes: ("Series" | "Movie" | "OVA")[]
  statusOptions: ("Ongoing" | "Completed" | "New This Week")[]
}

interface ActiveFilters {
  contentType: string[]
  audioLanguages: string[]
  subtitleLanguages: string[]
  status: string[]
  year: string
  genre: string
}

interface FilterSectionProps {
  title: string
  options: string[]
  category: keyof ActiveFilters
  activeFilters: ActiveFilters
  onFilterChange: (category: keyof ActiveFilters, value: string) => void
}

type SortOption = "newest" | "episodes" | "popular" | "alphabetical"

const HimeFilterUI: React.FC = () => {
  const   [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    contentType: [],
    audioLanguages: [],
    subtitleLanguages: [],
    status: [],
    year: "",
    genre: []
  })

  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [heroMuted, setHeroMuted] = useState<boolean>(true)
  const [isSearchExpanded, setIsSearchExpanded] = useState<boolean>(false)
}
