import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, type DashboardStats } from '@/api/admin.api';

export const DASHBOARD_STATS_KEY = ['dashboard', 'stats'];

export const useDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: DASHBOARD_STATS_KEY,
    queryFn: getDashboardStats,
    staleTime: 30 * 1000, // 30 seconds
    retry: 1,
  });
};
