// Grades API module: a student's report card and recorded marks.
//   GET /grades/report-card/:studentId, GET /grades?studentId
import { useQuery } from '@tanstack/react-query';
import apiClient from './apiClient';

export type Trimester = 'T1' | 'T2' | 'T3';
export interface ReportCard {
  trimesters: Record<Trimester, { average: number | null; domains: { domainId: number; label: string; average: number | null; subjects: { subjectId: number; title: string; average: number | null }[] }[] }>;
  annual?: { average: number | null } | null;
}
export interface Grade {
  id: number;
  trimester: Trimester;
  examType: string;
  score: string | null;
  status: string;
  subject?: { title: string } | null;
  subjectId: number;
}

export const gradeKeys = {
  all: ['grades'] as const,
  reportCard: (studentId?: number) => [...gradeKeys.all, 'report-card', studentId] as const,
  student: (studentId?: number) => [...gradeKeys.all, 'student', studentId] as const,
};

export const useReportCard = (studentId?: number) =>
  useQuery({ queryKey: gradeKeys.reportCard(studentId), enabled: !!studentId, queryFn: async () => (await apiClient.get(`/grades/report-card/${studentId}`)).data.data as ReportCard });

export const useStudentGrades = (studentId?: number) =>
  useQuery({ queryKey: gradeKeys.student(studentId), enabled: !!studentId, queryFn: async () => (await apiClient.get('/grades', { params: { studentId } })).data.data as Grade[] });
