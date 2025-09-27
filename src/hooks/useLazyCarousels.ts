import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { getPrevSeason } from "@/lib/dateUtils";
import { AnimeData } from "../types";
import { useDebounce } from "./useDebounce";

const { year, season } = getPrevSeason();

const lazyCarouselEndpoints = {
  now: "/api/anime/seasons",
  fanFavorites: "/api/anime/carousels?order_by=members",
  movies: "/api/anime/carousels?type=movie",
  lastSeason: `/api/anime/seasons?year=${year}&season=${season}`,
  shounen: "/api/anime/carousels?genres=27&start_date=2023-01-01",
  sliceOfLife: "/api/anime/carousels?genres=36&start_date=2022-01-01",
  classics: "/api/anime/carousels?start_date=1990-01-01&end_date=2005-12-31",
};

type CarouselName = keyof typeof lazyCarouselEndpoints;

const createInitialState = <T,>(defaultValue: T) =>
  (Object.keys(lazyCarouselEndpoints) as CarouselName[]).reduce((acc, key) => {
    acc[key] = defaultValue;
    return acc;
  }, {} as Record<CarouselName, T>);

export const useLazyCarousels = () => {
  const [carouselData, setCarouselData] = useState(createInitialState<AnimeData[]>([]));
  const [loadingStates, setLoadingStates] = useState(createInitialState(false));
  const [errorStates, setErrorStates] = useState(createInitialState<string | null>(null));

  const fetchCarouselData = async (name: CarouselName) => {
    if (loadingStates[name] || carouselData[name].length > 0) return;

    console.log(`[fetch] starting fetch for ${name}`);
    setLoadingStates(prev => ({ ...prev, [name]: true }));
    setErrorStates(prev => ({ ...prev, [name]: null }));

    try {
      const res = await fetch(lazyCarouselEndpoints[name]);
      if (!res.ok) throw new Error(`Failed to fetch ${name}: ${res.statusText}`);

      const json = await res.json();
      const data: AnimeData[] = Array.isArray(json) ? json : (json.data ?? []);

      console.log(`[fetch] ${name} returned`, data);
      setCarouselData(prev => ({ ...prev, [name]: data }));
    } catch (err: any) {
      console.error(`[fetch] error for ${name}`, err);
      setErrorStates(prev => ({ ...prev, [name]: err.message ?? String(err) }));
    } finally {
      setLoadingStates(prev => ({ ...prev, [name]: false }));
    }
  };

  // ✅ Proper custom hook for each carousel
  const useDebouncedInView = (name: CarouselName) => {
    const [ref, inView] = useInView({ threshold: 0.1, rootMargin: "100px", triggerOnce: true });
    const debouncedInView = useDebounce(inView, 200);

    useEffect(() => {
      if (debouncedInView) {
        console.log(`[observer] ${name} in view (debounced)`);
        fetchCarouselData(name);
      }
    }, [debouncedInView, name]);

    return ref;
  };

  // refs for each carousel
  const nowRef = useDebouncedInView("now");
  const fanFavRef = useDebouncedInView("fanFavorites");
  const moviesRef = useDebouncedInView("movies");
  const lastSeasonRef = useDebouncedInView("lastSeason");
  const shounenRef = useDebouncedInView("shounen");
  const sliceOfLifeRef = useDebouncedInView("sliceOfLife");
  const classicsRef = useDebouncedInView("classics");

  return {
    // data
    now: carouselData.now,
    fanFavorites: carouselData.fanFavorites,
    movies: carouselData.movies,
    lastSeason: carouselData.lastSeason,
    shounen: carouselData.shounen,
    sliceOfLife: carouselData.sliceOfLife,
    classics: carouselData.classics,

    // states
    loadingStates,
    errorStates,

    // refs
    nowRef,
    fanFavRef,
    moviesRef,
    lastSeasonRef,
    shounenRef,
    sliceOfLifeRef,
    classicsRef,
  };
};
