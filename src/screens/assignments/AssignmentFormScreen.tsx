// New homework (flow) — POST /assignments { classId, subjectId, title (≥3), description (≥10), dueDate }. A teacher's homework
// goes through the existing approval workflow (status "pending" until a secretary/admin approves it).
import React, { useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assignmentKeys } from '../../api/assignments';
import apiClient from '../../api/apiClient';
import { errorMessage } from '../../api/errors';
import { useOnline } from '../../api/network';
import { useTheme } from '../../theme/ThemeProvider';
import { control } from '../../theme/spacing';
import { tr } from '../../i18n';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import DatePickerField from '../../components/ui/DatePickerField';
import { ErrorSummary, FormScroll, useForm } from '../../components/ui/Form';
import OfflineNote from '../../components/ui/OfflineNote';
import Select from '../../components/ui/Select';
import TextField from '../../components/ui/TextField';
import { useToast } from '../../components/ui/Toast';

const list = async <T,>(url: string, params: object) => (await apiClient.get(url, { params })).data.data as T[];

export default function AssignmentFormScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const qc = useQueryClient();
  const online = useOnline();
  const toast = useToast();
  const [serverError, setServerError] = useState<string | null>(null);

  const f = useForm({ classId: null as number | null, subjectId: null as number | null, title: '', description: '', dueDate: null as string | null }, (v) => ({
    classId: v.classId ? undefined : tr('Required'),
    subjectId: v.subjectId ? undefined : tr('Required'),
    title: v.title.trim().length < 3 ? tr('At least 3 characters') : undefined,
    description: v.description.trim().length < 10 ? tr('At least 10 characters') : undefined,
    dueDate: !v.dueDate ? tr('Required') : v.dueDate < new Date().toISOString().slice(0, 10) ? tr('The due date is in the past') : undefined,
  }));
  const v = f.values;

  const classes = useQuery({ queryKey: ['classes-options'], queryFn: () => list<{ id: number; name: string }>('/classes', { pageSize: 200 }) });
  const subjects = useQuery({ queryKey: ['subjects-options'], queryFn: () => list<{ id: number; title: string; code: string | null }>('/subjects', { pageSize: 500 }) });

  const create = useMutation({
    mutationFn: async () => apiClient.post('/assignments', { classId: v.classId, subjectId: v.subjectId, title: v.title.trim(), description: v.description.trim(), dueDate: v.dueDate }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: assignmentKeys.all });
      toast({ message: tr('Homework created'), tone: 'success' });
      navigation.goBack();
    },
    onError: (e) => setServerError(errorMessage(e, tr('Could not create the homework'))),
  });

  const submit = () => {
    setServerError(null);
    f.submit(() => create.mutate());
  };
  const labels = { classId: tr('Class'), subjectId: tr('Subject'), title: tr('Title'), description: tr('Description'), dueDate: tr('Due date'), form: tr('Create homework') };
  const items: [string, string][] = serverError ? [...f.summary, ['form', serverError]] : f.summary;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FormScroll
        actions={
          <>
            <OfflineNote />
            <Button title={tr('Create homework')} onPress={submit} loading={create.isPending} disabled={!online} />
          </>
        }
      >
        <ErrorSummary items={items} labels={labels} />
        <Card>
          <Select label={tr('Class')} required {...f.pick('classId')} options={(classes.data ?? []).map((c) => ({ value: c.id, label: c.name }))} />
          <Select label={tr('Subject')} required {...f.pick('subjectId')} options={(subjects.data ?? []).map((s) => ({ value: s.id, label: s.code ? `${s.title} (${s.code})` : s.title }))} />
          <TextField label={tr('Title')} required maxLength={255} {...f.text('title')} />
          <TextField label={tr('Description')} required multiline style={{ minHeight: control.textareaMin, textAlignVertical: 'top' }} {...f.text('description')} />
          <DatePickerField label={tr('Due date')} required {...f.pick('dueDate')} />
        </Card>
      </FormScroll>
    </View>
  );
}
