// Students API module + the "subject student" every student-facing screen reads (A §5).
//   GET /students/profile (student only), GET /students/:id (staff; the backend enforces who may see whom)
import { useQuery } from '@tanstack/react-query';
import { useRoute } from '@react-navigation/native';
import apiClient from './apiClient';
import { useAuth } from '../auth/AuthContext';
import { useActiveChild } from './children';

export const studentKeys = {
  all: ['student'] as const,
  self: () => [...studentKeys.all, 'self'] as const,
  detail: (id?: number) => [...studentKeys.all, id] as const,
};

interface StudentRef {
  id: number;
  classId: number | null;
  user?: { name: string } | null;
  class?: { name: string } | null;
}

/** self = the logged-in student, child = a parent's active child (comes with the parent tasks), staff = a student opened with a `studentId` route param. */
export type SubjectMode = 'self' | 'child' | 'staff';

export interface SubjectStudent {
  mode: SubjectMode;
  id?: number;
  classId?: number | null;
  name?: string;
  className?: string;
  isPending: boolean;
  isError: boolean;
  refetch: () => void;
}

/**
 * Whose data a student-facing screen shows. One screen serves every role: a student sees their own data, staff
 * open it from StudentDetail with `studentId`. Screens never call /students/profile themselves.
 */
export function useSubjectStudent(): SubjectStudent {
  const { user } = useAuth();
  const staffId = (useRoute().params as { studentId?: number } | undefined)?.studentId;
  const child = useActiveChild();
  const mode: SubjectMode = user?.role === 'student' ? 'self' : user?.role === 'parent' ? 'child' : 'staff';

  const self = useQuery({
    queryKey: studentKeys.self(),
    enabled: mode === 'self',
    queryFn: async () => (await apiClient.get('/students/profile')).data.data as StudentRef,
  });
  const staff = useQuery({
    queryKey: studentKeys.detail(staffId),
    enabled: mode === 'staff' && !!staffId,
    queryFn: async () => (await apiClient.get(`/students/${staffId}`)).data.data as StudentRef,
  });
  if (mode === 'child') {
    const a = child?.active;
    return { mode, id: a?.id, classId: a?.classId, name: a?.user?.name, className: a?.class?.name, isPending: !child || child.isPending, isError: !!child?.isError, refetch: () => child?.refetch() };
  }
  const q = mode === 'self' ? self : staff;
  const d = q.data;
  return {
    mode,
    id: d?.id,
    classId: d?.classId,
    name: mode === 'self' ? user?.name : d?.user?.name,
    className: d?.class?.name,
    isPending: q.isPending && q.fetchStatus !== 'idle',
    isError: q.isError,
    refetch: () => void q.refetch(),
  };
}

export interface RecentStudent {
  id: number;
  createdAt: string;
  user: { name: string };
  class?: { name: string } | null;
}

/** Newest enrolments first (the list endpoint returns the newest students first): the secretary's "recent enrollments". */
export const useRecentStudents = (n = 3) =>
  useQuery({
    queryKey: [...studentKeys.all, 'recent', n] as const,
    queryFn: async () => (await apiClient.get('/students', { params: { pageSize: n } })).data.data as RecentStudent[],
  });
