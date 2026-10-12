// Grade entry (tool pattern) — same payload and 0–20 rule as the web grade report: POST /grades { studentId, subjectId, trimester, examType, status, score }
// Pick class → student → subject, enter the score, save from the sticky bar; after a save the student is cleared for the next one.
import React, { useState } from 'react';
import { View } from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import apiClient from '../../api/apiClient';
import { errorMessage } from '../../api/errors';
import { useOnline } from '../../api/network';
import { useTheme } from '../../theme/ThemeProvider';
import { tr } from '../../i18n';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { ErrorSummary, FormScroll, useForm } from '../../components/ui/Form';
import NumberField from '../../components/ui/NumberField';
import OfflineNote from '../../components/ui/OfflineNote';
import Select from '../../components/ui/Select';
import { useToast } from '../../components/ui/Toast';

type Trimester = 'T1' | 'T2' | 'T3';
type ExamType = 'evaluation' | 'exam_1' | 'exam_2';
type GradeStatus = 'GRADED' | 'EXEMPT' | 'ABSENT' | 'MISSING';
const EXAM_LABELS: Record<ExamType, string> = { evaluation: 'Continuous assessment', exam_1: 'Exam 1', exam_2: 'Exam 2' };
const STATUS_LABELS: Record<GradeStatus, string> = { GRADED: 'Graded', EXEMPT: 'Exempt', ABSENT: 'Absent', MISSING: 'Missing' };

const list = async <T,>(url: string, params: object) => (await apiClient.get(url, { params })).data.data as T[];

export default function GradeEntryScreen() {
  const { colors } = useTheme();
  const online = useOnline();
  const toast = useToast();
  const [serverError, setServerError] = useState<string | null>(null);

  const f = useForm(
    { classId: null as number | null, studentId: null as number | null, subjectId: null as number | null, trimester: 'T1' as Trimester, examType: 'exam_1' as ExamType, status: 'GRADED' as GradeStatus, score: null as number | null },
    (v) => ({
      studentId: v.studentId ? undefined : tr('Choose a student and a subject'),
      subjectId: v.subjectId ? undefined : tr('Required'),
      score: v.status === 'GRADED' && (v.score == null || v.score < 0 || v.score > 20) ? tr('Score must be between 0 and 20') : undefined,
    }),
  );
  const v = f.values;

  const classes = useQuery({ queryKey: ['classes-options'], queryFn: () => list<{ id: number; name: string }>('/classes', { pageSize: 200 }) });
  const students = useQuery({
    queryKey: ['class-students', v.classId],
    enabled: !!v.classId,
    queryFn: () => list<{ id: number; user: { name: string } }>('/students', { classId: v.classId, pageSize: 200 }),
  });
  const subjects = useQuery({ queryKey: ['subjects-options'], queryFn: () => list<{ id: number; title: string; code: string | null }>('/subjects', { pageSize: 500 }) });

  const save = useMutation({
    mutationFn: async () =>
      apiClient.post('/grades', { studentId: v.studentId, subjectId: v.subjectId, trimester: v.trimester, examType: v.examType, status: v.status, score: v.status === 'GRADED' ? v.score : null }),
    onSuccess: () => {
      const name = students.data?.find((s) => s.id === v.studentId)?.user.name;
      toast({ message: `${tr('Grade saved')}${name ? ` · ${name}` : ''}`, tone: 'success' });
      f.set('score')(null);
      f.set('studentId')(null); // next student
    },
    onError: (e) => setServerError(errorMessage(e, tr('Could not save the grade'))),
  });

  const submit = () => {
    setServerError(null);
    f.submit(() => save.mutate());
  };
  const labels = { studentId: tr('Student'), subjectId: tr('Subject'), score: tr('Score (/20)') };
  const items: [string, string][] = serverError ? [...f.summary, ['form', serverError]] : f.summary;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FormScroll
        actions={
          <>
            <OfflineNote />
            <Button title={tr('Save grade')} onPress={submit} loading={save.isPending} disabled={!online} />
          </>
        }
      >
        <ErrorSummary items={items} labels={{ ...labels, form: tr('Save grade') }} />
        <Card>
          <Select
            label={tr('Class')}
            value={v.classId}
            onChange={(c) => (f.set('classId')(c), f.set('studentId')(null))}
            options={(classes.data ?? []).map((c) => ({ value: c.id, label: c.name }))}
          />
          <Select
            label={tr('Student')}
            required
            {...f.pick('studentId')}
            placeholder={v.classId ? '—' : tr('Choose a class first')}
            options={(students.data ?? []).map((s) => ({ value: s.id, label: s.user.name }))}
          />
          <Select label={tr('Subject')} required {...f.pick('subjectId')} options={(subjects.data ?? []).map((s) => ({ value: s.id, label: s.code ? `${s.title} (${s.code})` : s.title }))} />
          <Select<Trimester> label={tr('Trimester')} value={v.trimester} onChange={f.set('trimester')} options={(['T1', 'T2', 'T3'] as const).map((t) => ({ value: t, label: t }))} />
          <Select<ExamType> label={tr('Exam type')} value={v.examType} onChange={f.set('examType')} options={(Object.keys(EXAM_LABELS) as ExamType[]).map((k) => ({ value: k, label: tr(EXAM_LABELS[k]) }))} />
          <Select<GradeStatus> label={tr('Status')} value={v.status} onChange={f.set('status')} options={(Object.keys(STATUS_LABELS) as GradeStatus[]).map((k) => ({ value: k, label: tr(STATUS_LABELS[k]) }))} />
          {v.status === 'GRADED' ? <NumberField label={tr('Score (/20)')} required decimals={2} placeholder="0–20" {...f.input('score')} /> : null}
        </Card>
      </FormScroll>
    </View>
  );
}
