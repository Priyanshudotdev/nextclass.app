import { QueryClient } from '@tanstack/react-query';
import type { QueryClientConfig } from '@tanstack/react-query';

const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error: unknown) => {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError?.response?.status === 401) return false;
        if (axiosError?.response?.status === 403) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
};

export const queryClient = new QueryClient(queryClientConfig);
