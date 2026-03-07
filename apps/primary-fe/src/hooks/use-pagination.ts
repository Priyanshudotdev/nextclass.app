import { useState, useCallback } from 'react';

interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
  maxLimit?: number;
}

interface UsePaginationReturn {
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  resetPage: () => void;
}

export function usePagination(
  options: UsePaginationOptions = {},
): UsePaginationReturn {
  const { initialPage = 1, initialLimit = 10, maxLimit = 100 } = options;

  const [page, setPageState] = useState(initialPage);
  const [limit, setLimitState] = useState(initialLimit);

  const setPage = useCallback((newPage: number) => {
    setPageState(Math.max(1, newPage));
  }, []);

  const setLimit = useCallback(
    (newLimit: number) => {
      setLimitState(Math.min(Math.max(1, newLimit), maxLimit));
      setPageState(1); // Reset to first page when limit changes
    },
    [maxLimit],
  );

  const nextPage = useCallback(() => {
    setPageState((prev) => prev + 1);
  }, []);

  const prevPage = useCallback(() => {
    setPageState((prev) => Math.max(1, prev - 1));
  }, []);

  const resetPage = useCallback(() => {
    setPageState(initialPage);
  }, [initialPage]);

  return {
    page,
    limit,
    setPage,
    setLimit,
    nextPage,
    prevPage,
    resetPage,
  };
}
