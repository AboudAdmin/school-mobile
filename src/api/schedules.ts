// Schedules API module: the class timetable.  GET /schedules?classId
import { useQuery } from '@tanstack/react-query';
import apiClient from './apiClient';

export interface Slot {
  id: number;
  day: string;
  startTime: string;
  endTime: string;
  room: string | null;
  subject?: { title: string } | null;
  teacher?: { user?: { name: string } | null } | null;
}

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

export const scheduleKeys = {
  all: ['schedules'] as const,
  timetable: (studentId?: number, classId?: number | null) => [...scheduleKeys.all, 'timetable', { studentId, classId }] as const,
};

export const useTimetable = (student: { id?: number; classId?: number | null }) =>
  useQuery({
    queryKey: scheduleKeys.timetable(student.id, student.classId),
    enabled: !!student.classId,
    queryFn: async () => (await apiClient.get('/schedules', { params: { classId: student.classId, pageSize: 200 } })).data.data as Slot[],
  });
