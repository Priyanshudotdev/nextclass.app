import api from '@/lib/axios';
import type { UserRole } from '@/api/auth.api';

export interface NotificationItem {
  id: string;
  type: 'RESOURCE' | 'MESSAGE' | 'ATTENDANCE' | 'ENROLLMENT' | 'ANNOUNCEMENT';
  title: string;
  message: string;
  isRead: boolean;
  entityId?: string | null;
  createdAt: string;
}

interface ApiResponse<T> {
  data: T;
  error?: string;
}

function getBasePathByRole(role: UserRole): string {
  switch (role) {
    case 'ADMIN':
      return '/api/admin';
    case 'TEACHER':
      return '/api/teacher';
    case 'STUDENT':
      return '/api/student';
    case 'PARENT':
      return '/api/parent';
    default:
      return '/api/student';
  }
}

export async function getNotifications(
  role: UserRole,
): Promise<NotificationItem[]> {
  const basePath = getBasePathByRole(role);
  const res = await api.get<ApiResponse<NotificationItem[]>>(
    `${basePath}/notifications`,
  );
  return res.data.data;
}

export async function markNotificationRead(
  role: UserRole,
  notificationId: string,
): Promise<NotificationItem> {
  const basePath = getBasePathByRole(role);
  const res = await api.patch<ApiResponse<NotificationItem>>(
    `${basePath}/notifications/${notificationId}/read`,
  );
  return res.data.data;
}

export async function markAllNotificationsRead(
  role: UserRole,
): Promise<number> {
  const basePath = getBasePathByRole(role);
  const res = await api.patch<ApiResponse<number>>(
    `${basePath}/notifications/read-all`,
  );
  return res.data.data;
}
