// Roll-call tool for one class session:
//   GET /attendance/schedule/:id?date  students (+ status if already taken)
//   POST /attendance/schedule/:id/bulk { date, records: [{ studentId, status }] }
// Everyone starts "present" (fastest path: only tap the exceptions); the bar below shows how many edits are not saved yet.
import React, { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import IconCheck from '@tabler/icons-react-native/IconCheck';
import IconClock from '@tabler/icons-react-native/IconClock';
import IconX from '@tabler/icons-react-native/IconX';
import { useAttendanceSession, useSaveAttendance, type AttendanceStatus as Status } from '../../api/attendance';
import { errorMessage } from '../../api/errors';
import { useOnline } from '../../api/network';
import { useTheme } from '../../theme/ThemeProvider';
import { tr } from '../../i18n';
import ActionBar from '../../components/ui/ActionBar';
import Button from '../../components/ui/Button';
import ErrorState from '../../components/ui/ErrorState';
import { Avatar } from '../../components/ui/ListItem';
import LoadingState from '../../components/ui/LoadingState';
import OfflineNote from '../../components/ui/OfflineNote';
import ProgressBar from '../../components/ui/ProgressBar';
import StatusSegment, { type StatusOption } from '../../components/ui/StatusSegment';
import { useToast } from '../../components/ui/Toast';

const today = () => new Date().toISOString().slice(0, 10);

export default function AttendanceSessionScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const { id } = useRoute().params as { id: number };
  const online = useOnline();
  const toast = useToast();
  const date = today();
  const [marks, setMarks] = useState<Record<number, Status>>({});
  const [baseline, setBaseline] = useState<Record<number, Status>>({});

  const q = useAttendanceSession(id, date);
  // Everyone starts "present"; keep any status already saved
  useEffect(() => {
    if (!q.data) return;
    const initial = Object.fromEntries(q.data.students.map((s) => [s.id, s.status ?? 'present']));
    setMarks(initial);
    setBaseline(initial);
  }, [q.data]);

  const save = useSaveAttendance(id, date, () => {
    setBaseline(marks);
    toast({ message: tr('Attendance saved'), tone: 'success' });
  });

  if (q.isPending) return <LoadingState />;
  if (q.isError || !q.data) return <ErrorState message={tr('Could not load data.')} retryLabel={tr('Retry')} onRetry={() => q.refetch()} />;

  const { schedule, students } = q.data;
  const options: StatusOption<Status>[] = [
    { value: 'present', label: tr('Present'), icon: IconCheck, tone: 'success' },
    { value: 'late', label: tr('Late'), icon: IconClock, tone: 'warning' },
    { value: 'absent', label: tr('Absent'), icon: IconX, tone: 'danger' },
  ];
  const count = (s: Status) => Object.values(marks).filter((m) => m === s).length;
  const unsaved = students.filter((s) => marks[s.id] !== baseline[s.id]).length;
  const rate = students.length ? Math.round(((count('present') + count('late')) / students.length) * 100) : 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={students}
        keyExtractor={(s) => String(s.id)}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}
        ListHeaderComponent={
          <View style={{ marginBottom: spacing.md, gap: spacing.sm }}>
            <Text style={[typography.title, { color: colors.text }]}>{schedule.class?.name}</Text>
            <Text style={[typography.body, { color: colors.textMuted }]}>
              {schedule.subject?.title} · {schedule.startTime.slice(0, 5)}–{schedule.endTime.slice(0, 5)} · {date}
            </Text>
            <Text style={[typography.caption, { color: colors.textMuted }]}>{options.map((o) => `${o.label} ${count(o.value)}`).join(' · ')}</Text>
            <ProgressBar value={rate} tone={rate >= 75 ? 'success' : 'warning'} label={tr('Attendance rate')} />
            <Button title={tr('Mark all present')} variant="outline" size="sm" onPress={() => setMarks(Object.fromEntries(students.map((s) => [s.id, 'present'])))} />
          </View>
        }
        ListEmptyComponent={<Text style={[typography.body, { color: colors.textMuted }]}>{tr('No students in this class')}</Text>}
        renderItem={({ item }) => (
          <View style={{ gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <Avatar name={item.name} />
              <Text style={[typography.body, typography.weights.semibold, { color: colors.text, flex: 1 }]} numberOfLines={1}>
                {item.name}
              </Text>
            </View>
            <StatusSegment label={item.name} options={options} value={marks[item.id]} onChange={(v) => setMarks((m) => ({ ...m, [item.id]: v }))} />
          </View>
        )}
      />
      <ActionBar>
        {save.isError ? (
          <Text accessibilityRole="alert" style={[typography.body, { color: colors.danger, textAlign: 'center' }]}>
            {errorMessage(save.error, tr('Could not save attendance'))}
          </Text>
        ) : null}
        <OfflineNote />
        {unsaved ? <Text style={[typography.caption, { color: colors.textMuted, textAlign: 'center' }]}>{tr('Unsaved changes: {{n}}', { n: unsaved })}</Text> : null}
        <Button title={tr('Save attendance')} onPress={() => save.mutate(marks)} loading={save.isPending} disabled={students.length === 0 || !online} />
      </ActionBar>
    </View>
  );
}
