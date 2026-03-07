import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '@/api/auth.api';

export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.clear();
      navigate('/login', { replace: true });
    },
    onError: () => {
      // Even if logout API fails, clear client state and redirect
      queryClient.clear();
      navigate('/login', { replace: true });
    },
  });
};
