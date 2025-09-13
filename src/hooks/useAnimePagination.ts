import { useState, useCallback } from "react";

export const useAnimePagination = () => {
    // pagination state
    const [page, setPage] = useState<number>(1)
    const [hasMore, setHasMore] = useState<boolean>(true)

     // pagination
    const handleLoadMore = useCallback(() => {
        setPage(prevPage => prevPage + 1)
    }, [])

    return { page, setPage, hasMore, setHasMore, handleLoadMore }
}