import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginUser } from '@/api/auth.api';
import type { LoginPayload, UserRole } from '@/api/auth.api';
import { AUTH_USER_KEY } from './useCurrentUser';

const ROLE_REDIRECT: Record<UserRole, string> = {
  ADMIN: '/dashboard',
  TEACHER: '/teacher/dashboard',
  STUDENT: '/student/dashboard',
  PARENT: '/parent/dashboard',
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  return useMutation({
    mutationFn: (payload: LoginPayload) => loginUser(payload),
    onSuccess: (response) => {
      const user = response.data;
      queryClient.setQueryData(AUTH_USER_KEY, user);

      // Check if there's a redirect location saved
      const from = (location.state as { from?: { pathname: string } })?.from
        ?.pathname;
      const redirect = from ?? ROLE_REDIRECT[user.role] ?? '/dashboard';
      navigate(redirect, { replace: true });
    },
  });
};
