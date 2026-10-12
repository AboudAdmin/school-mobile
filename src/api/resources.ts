// Resources API module: shared course material.  GET /resources (scoped by the backend)
import { useQuery } from '@tanstack/react-query';
import apiClient from './apiClient';

export interface Resource {
  id: number;
  title: string;
  type: string;
  url: string;
  subject?: { title: string } | null;
  class?: { name: string } | null;
}

export const resourceKeys = {
  all: ['resources'] as const,
  recent: () => [...resourceKeys.all, 'recent'] as const,
  list: (studentId?: number, classId?: number | null) => [...resourceKeys.all, 'list', studentId, classId] as const,
};

export const fetchResourcePage = async (page: number, studentId?: number, classId?: number | null) => {
  const res = await apiClient.get('/resources', { params: { page, pageSize: 20, studentId, classId: classId ?? undefined } });
  return { items: (res.data.data ?? []) as Resource[], hasNextPage: !!res.data.pagination?.hasNextPage };
};

/** Resources added in the last 7 days (student dashboard "new resources"). */
export const useNewResources = () =>
  useQuery({
    queryKey: resourceKeys.recent(),
    queryFn: async () => {
      const rows = ((await apiClient.get('/resources', { params: { pageSize: 50 } })).data.data ?? []) as (Resource & { createdAt?: string })[];
      const since = Date.now() - 7 * 86400000;
      return rows.filter((r) => r.createdAt && new Date(r.createdAt).getTime() >= since).length;
    },
  });
