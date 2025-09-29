import { useState, useCallback } from "react";

export const useAnimePagination = () => {
    // pagination state
    const [page, setPageState] = useState<number>(1)
    const [hasMore, setHasMoreState] = useState<boolean>(true)

     // pagination
    const setPage = useCallback((newPage: number) => {
        setPageState(newPage)
    }, [])

    const setHasMore = useCallback((val: boolean) => {
        setHasMoreState(val)
    }, [])

    const handleLoadMore = useCallback(() => {
        setPageState(prevPage => prevPage + 1)
    }, [])

    return { page, setPage, hasMore, setHasMore, handleLoadMore }
}