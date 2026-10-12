// Attendance API module: types, query keys, fetchers and hooks.
//   GET /attendance/my-sessions, GET /attendance/schedule/:id?date, POST /attendance/schedule/:id/bulk, GET /attendance?studentId
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './apiClient';

export type AttendanceStatus = 'present' | 'late' | 'absent';
export interface Session {
  id: number;
  startTime: string;
  endTime: string;
  room: string | null;
  class?: { id: number; name: string } | null;
  subject?: { title: string } | null;
  attendance: { total: number; present: number; absent: number; late: number; taken: boolean };
}
export interface SessionData {
  schedule: { startTime: string; endTime: string; class?: { name: string } | null; subject?: { title: string } | null };
  students: { id: number; name: string; status: AttendanceStatus | null }[];
}

export const attendanceKeys = {
  all: ['attendance'] as const,
  /** Today's sessions; the dashboard (plain query) and the sessions list (infinite query, `.list()`) must not share a key. */
  mySessions: () => [...attendanceKeys.all, 'my-sessions'] as const,
  mySessionsList: () => [...attendanceKeys.mySessions(), 'list'] as const,
  session: (id: number, date?: string) => (date ? ([...attendanceKeys.all, 'session', id, date] as const) : ([...attendanceKeys.all, 'session', id] as const)),
  studentList: (studentId?: number) => [...attendanceKeys.all, 'student-list', studentId] as const,
  student: (studentId?: number) => (studentId ? ([...attendanceKeys.all, 'student', studentId] as const) : ([...attendanceKeys.all, 'student'] as const)),
};

export interface AttendanceRecord {
  id: number;
  date: string;
  status: 'present' | 'late' | 'absent';
}

/** GET /attendance?studentId: one student's records, newest first (a parent only gets their own children, else 403). */
export const fetchAttendancePage = async (studentId: number, page: number) => {
  const res = await apiClient.get('/attendance', { params: { studentId, page, pageSize: 30 } });
  const items = (res.data.data as AttendanceRecord[]).slice().sort((a, b) => b.date.localeCompare(a.date));
  return { items, hasNextPage: !!res.data.pagination?.hasNextPage };
};

export const fetchMySessions = async () => (await apiClient.get('/attendance/my-sessions')).data.data as Session[];

export const useMySessions = () => useQuery({ queryKey: attendanceKeys.mySessions(), queryFn: fetchMySessions });

export const useAttendanceSession = (id: number, date: string) =>
  useQuery({
    queryKey: attendanceKeys.session(id, date),
    queryFn: async () => (await apiClient.get(`/attendance/schedule/${id}`, { params: { date } })).data.data as SessionData,
  });

export const useStudentAttendance = (studentId?: number) =>
  useQuery({
    queryKey: attendanceKeys.student(studentId),
    enabled: !!studentId,
    queryFn: async () => (await apiClient.get('/attendance', { params: { studentId, pageSize: 500 } })).data.data as { status: string }[],
  });

export const useSaveAttendance = (id: number, date: string, onSuccess?: () => void) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (marks: Record<number, AttendanceStatus>) =>
      apiClient.post(`/attendance/schedule/${id}/bulk`, { date, records: Object.entries(marks).map(([studentId, status]) => ({ studentId: Number(studentId), status })) }),
    onSuccess: () => {
      onSuccess?.();
      qc.invalidateQueries({ queryKey: attendanceKeys.mySessions() });
      qc.invalidateQueries({ queryKey: attendanceKeys.session(id) });
      qc.invalidateQueries({ queryKey: attendanceKeys.student() });
    },
  });
};
