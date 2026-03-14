import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UserRole } from '@/api/auth.api';
import * as notificationApi from '@/api/notifications.api';

export const notificationKeys = {
  all: ['notifications'] as const,
  byRole: (role?: UserRole) => [...notificationKeys.all, role] as const,
};

export function useNotifications(role?: UserRole) {
  return useQuery({
    queryKey: notificationKeys.byRole(role),
    queryFn: () => notificationApi.getNotifications(role!),
    enabled: !!role,
    refetchInterval: 20000,
    staleTime: 5000,
  });
}

export function useMarkNotificationRead(role?: UserRole) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationApi.markNotificationRead(role!, notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.byRole(role),
      });
    },
  });
}

export function useMarkAllNotificationsRead(role?: UserRole) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationApi.markAllNotificationsRead(role!),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.byRole(role),
      });
    },
  });
}
