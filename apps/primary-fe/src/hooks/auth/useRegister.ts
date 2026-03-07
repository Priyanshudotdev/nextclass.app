import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { registerAdmin } from '@/api/auth.api';
import type { AdminRegisterPayload } from '@/api/auth.api';
import { AUTH_USER_KEY } from './useCurrentUser';

export const useRegister = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: AdminRegisterPayload) => registerAdmin(payload),
    onSuccess: (response) => {
      queryClient.setQueryData(AUTH_USER_KEY, response.data);
      navigate('/onboarding', { replace: true });
    },
  });
};
