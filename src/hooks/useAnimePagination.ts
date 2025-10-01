import { useState, useCallback } from "react"

export const useAnimePagination = () => {
  // pagination state
  const [pageState, setPageState] = useState<number>(1)
  const [hasMoreState, setHasMoreState] = useState<boolean>(true)

  // pagination
  const setPage = useCallback((updater: number | ((prev: number) => number)) => {
    if (typeof updater === "function") {
      setPageState(prev => {
        const newPage = (updater as (prev: number) => number)(prev)
        return newPage
      })
    } else {
      setPageState(updater)
    }
  }, [])

  const setHasMore = useCallback((val: boolean) => {
    setHasMoreState(val)
  }, [])

  const handleLoadMore = useCallback(() => {
    setPage(prevPage => {
      const nextPage = prevPage + 1
      return nextPage
    })
  }, [setPage])

  return {
    page: pageState,
    hasMore: hasMoreState,
    setPage,
    setHasMore,
    handleLoadMore,
  }
}
