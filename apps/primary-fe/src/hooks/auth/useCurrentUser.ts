import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/api/auth.api';

export const AUTH_USER_KEY = ['auth', 'me'] as const;

export const useCurrentUser = () => {
  return useQuery({
    queryKey: AUTH_USER_KEY,
    queryFn: getCurrentUser,
    staleTime: Infinity,
    retry: false,
  });
};
