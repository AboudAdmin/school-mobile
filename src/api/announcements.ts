// Announcements API module (shared notices).  GET /announcements?targetRole&pageSize
import { useQuery } from '@tanstack/react-query';
import apiClient from './apiClient';

export interface Announcement {
  id: number;
  title: string;
  priority?: string;
  publishAt?: string | null;
  requiresAcknowledgment?: boolean;
  isRead?: boolean;
  isAcknowledged?: boolean;
}

export const announcementKeys = {
  all: ['announcements'] as const,
  latest: (targetRole?: string) => [...announcementKeys.all, 'latest', targetRole] as const,
};

/** The latest announcements for a role (same call as the Web student/parent dashboards: pageSize 15). */
export const useLatestAnnouncements = (targetRole: 'student' | 'parent') =>
  useQuery({
    queryKey: announcementKeys.latest(targetRole),
    queryFn: async () => (await apiClient.get('/announcements', { params: { pageSize: 15, targetRole } })).data.data as Announcement[],
  });
