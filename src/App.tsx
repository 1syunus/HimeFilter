import React, {useState, useEffect} from "react"
import {Search, Filter, X, ChevronDown, Calendar, Star, Globe, Play, Menu, Info, Plus, Volume2, VolumeX} from "lucide-react"

// type defs
interface AnimeData {
  id: number
  title: string
  description: string
  type: "Series" | "Movie" | "OVA"
  audioLanguages: string[]
  subtitleLanguages: string[]
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
  genres: string[]
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
    genres: []
  })

  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [heroMuted, setHeroMuted] = useState<boolean>(true)
  const [isSearchExpanded, setIsSearchExpanded] = useState<boolean>(false)
}

// mock data as placeholder
const featuredAnime: AnimeData = {
  id: 0,
  title: "Jujutsu Kaisen: Shibuya Incident",
  description: "The most intense arc yet. When a group of cursed spirits trap civilians and Jujutsu Sorcerers in Shibuya, Yuji and his allies must face their greatest challenge in a battle that will change everything.",
  type: "Series",
  audioLanguages: ["Japanese, English"],
  subtitleLanguages: ["English", "Spanish", "Portuguese", "French"],
  status: "New This Week",
  year: 2024,
  episodes: 24,
  rating: 4.9,
  genres: ["Action", "Supernatural", "Shonen"],
  image: "https://dummyimage.com/480x720/ff6600/ffffff?text=JJK",
  heroImage: "https://dummyimage.com/1920x1080/1a1a1a/ff6600?text=JUJUTSU+KAISEN+HERO",
  duration: "23m"
}

const mockAnime: AnimeData[] = [
  {
    id: 1,
  title: "Demon Slayer: Hashira Training Arc",
  description: "Follow Tanjiro as he trains with the Hashira to prepare for the final battle.",
  type: "Series",
  audioLanguages: ["Japanese", "English"],
  subtitleLanguages: ["English", "Spanish", "Portuguese"],
  status: "Ongoing",
  year: 2024,
  episodes: 12,
  rating: 4.8,
  genres: ["Action", "Supernatural", "Shonen"],
  image: "https://dummyimage.com/480x720/0066ff/ffffff?text=DS",
  duration: "24m"
  },

  {
    id: 2,
    title: "Your Name",
    description: "A touching story of two teenagers who share a profound and magical connection.",
    type: "Movie",
    audioLanguages: ["Japanese"],
    subtitleLanguages: ["English", "Spanish", "Portuguese"],
    status: "Completed",
    year: 2022,
    episodes: 1,
    rating: 4.7,
    genres: ["Romance", "Drama"],
    image: "https://dummyimage.com/480x720/9900cc/ffffff?text=YN",
    duration: "106m"
  },

  {
    id: 3,
    title: "Attack on Titan: Final Season",
    description: "The epic conclusion to humanity's fight for survival.",
    type: "Series",
    audioLanguages: ["Japanese", "English"],
    subtitleLanguages: ["English", "German"],
    status: "Completed",
    year: 2023,
    episodes: 16,
    rating: 4.9,
    genres: ["Action", "Drama", "Shonen"],
    image: "dummyimage.com/480x720/cc3300/ffffff?text=AOT",\
    duration: "24m"
  },

  {
    id: 4,
    title: "Spirited Away",
    description: "A young girl enters a world ruled by gods and witches.",
    type: "Movie",
    audioLanguages: ["Japanese", "English"],
    subtitleLanguages: ["English", "Spanish", "French", "Uranian"],
    status: "Completed",
    year: 2001,
    episodes: 1,
    rating: 5,
    genres: ["Adventure", "Ghibli", "Fantasy", "Supernatural"],
    image: "https://dummyimage.com/480x720/00cc66/ffffff?text=SA",
    duration: "125m"
  },

  {
    id: 5,
    title: "One Piece: Wano Arc",
    description: "The Straw Hats arrive in the mysterious land of Wano.",
    type: "Series",
    audioLanguages: ["Japanese"],
    subtitleLanguages: ["English", "Spanish", "Portuguese"],
    status: "Ongoing",
    year: 2023,
    episodes: 200,
    rating: 4.7,
    genres: ["Action", "Adventure", "Shonen"],
    image: "https://dummyimage.com/480x720/ffcc00/ffffff?text=OP",
    duration: "24m"
  }
]

const handleFilterChange = (category: keyof ActiveFilters, value: string): void => {
  setActiveFilters(prev => {
    const currentValues = prev[category]
    if (Array.isArray(currentValues)) {
      return {
        ...prev,
        [category]: currentValues.includes(value)
        ? currentValues.filter(item => item !== value)
        : [...currentValues, value]
      }
    } else {
      return {
        ...prev,
        [category]: value
      }
    }
  })
}

const clearAllFilters = (): void => {
  setActiveFilters({
    contentType: [],
    audioLanguage: [],
    subtitleLanguage: [],
    status: [],
    year: "",
    genres: []
  })
  setSearchQuery("")
}

const FilterSection: React.FC<FilterSectionProps> = ({
  title, options, categories, activeFilters, onFilterChange
}) => (
  <div className="mb-6">
    <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">{title}</h3>
    <div className="space-y-2">
      {options.map((option: string) => {
        const isActive = Array.isArray(activeFilters[category])
        ? (activeFilters[category] as string[]).includes(option)
        : activeFilters[category] === option

        return (
          <label key={option} className="flex items-center cursor-pointer group">
            <input
            type="checkbox"
            checked={isActive}
            onChange={() => onFilterChange(category, option)}
            className="sr-only"
            />
            <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center transition-all
            ${isActive
              ? "bg-orange-500 border-orange-500"
              : "border-gray-400 group-hover:border-orange-400"
            }`}>
              {isActive && (
                <div className="w-2 h-2 bg-white rounded-sm"></div>
              )}
            </div>
            <span className="text-gray-300 text-sm group-hover:text-white transition colors">
              {option}
            </span>
          </label>
        )
      })}
    </div>
  </div>
)