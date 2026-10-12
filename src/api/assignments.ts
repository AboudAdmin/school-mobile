// Assignments API module: homework.  GET /assignments (the backend scopes the list per role)
import { useQuery } from '@tanstack/react-query';
import apiClient from './apiClient';

export interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'draft';
  class?: { name: string } | null;
  subject?: { title: string } | null;
}

export const assignmentKeys = {
  all: ['assignments'] as const,
  list: (studentId?: number) => [...assignmentKeys.all, 'list', studentId] as const,
  due: (studentId?: number) => [...assignmentKeys.all, 'due', studentId] as const,
};

export const fetchAssignmentPage = async (page: number, studentId?: number) => {
  const res = await apiClient.get('/assignments', { params: { page, pageSize: 20, studentId } });
  return { items: res.data.data as Assignment[], hasNextPage: res.data.pagination.hasNextPage as boolean };
};

/** Published homework still to come, for the student dashboard. */
export const useDueAssignments = (studentId?: number) =>
  useQuery({ queryKey: assignmentKeys.due(studentId), queryFn: async () => (await apiClient.get('/assignments', { params: { pageSize: 100, studentId } })).data.data as Assignment[] });
