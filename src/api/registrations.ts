// Registration requests: the pending count the Web admin/secretary dashboards show.  GET /registration-requests?status=pending
import { useQuery } from '@tanstack/react-query';
import apiClient from './apiClient';

export const registrationKeys = { pending: ['secretary-pending-requests'] as const };

export const usePendingRegistrations = () =>
  useQuery({
    queryKey: registrationKeys.pending,
    queryFn: async () => (await apiClient.get('/registration-requests', { params: { status: 'pending', pageSize: 1 } })).data.data.byStatus.pending as number,
  });
