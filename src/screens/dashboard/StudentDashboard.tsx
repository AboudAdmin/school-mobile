// Student dashboard on the DashboardScreen scaffold: Attention → Today → Attendance · Homework → Shortcuts
// (same sources as the web student dashboard, all scoped to the logged-in student by the backend):
//   GET /students/profile, GET /schedules?classId (today), GET /assignments (due soon), GET /attendance?studentId (rate)
import React from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import IconCircleCheck from '@tabler/icons-react-native/IconCircleCheck';
import { useLatestAnnouncements } from '../../api/announcements';
import { useDueAssignments } from '../../api/assignments';
import { useNewResources } from '../../api/resources';
import { useStudentAttendance } from '../../api/attendance';
import { DAYS, useTimetable } from '../../api/schedules';
import { useSubjectStudent } from '../../api/students';
import { loc, tr, trn } from '../../i18n';
import { useTheme } from '../../theme/ThemeProvider';
import AttentionStrip, { type Attention } from '../../components/ui/AttentionStrip';
import Button from '../../components/ui/Button';
import DashboardScreen from '../../components/ui/DashboardScreen';
import EventRow from '../../components/ui/EventRow';
import { IconText } from '../../components/ui/Icon';
import Section from '../../components/ui/Section';
import StatTile from '../../components/ui/StatTile';
import { dueSoonCount, studentAttention, type Rule } from './dashboardRules';

export default function StudentDashboard() {
  const { colors, spacing, typography } = useTheme();
  const navigation = useNavigation<{ navigate: (screen: string) => void }>();
  const me = useSubjectStudent();
  const tt = useTimetable(me);
  const homework = useDueAssignments();
  const attendance = useStudentAttendance(me.id);
  const announcements = useLatestAnnouncements('student');
  const newResources = useNewResources();

  const today = DAYS[(new Date().getDay() + 6) % 7];
  const todaySlots = (tt.data ?? []).filter((s) => s.day === today).sort((a, b) => a.startTime.localeCompare(b.startTime));
  const now = new Date();
  const nowIso = now.toISOString().slice(0, 10);
  const due = (homework.data ?? []).filter((a) => a.status === 'approved' && a.dueDate.slice(0, 10) >= nowIso).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const att = attendance.data ?? [];
  const rate = att.length ? Math.round((att.filter((r) => r.status !== 'absent').length / att.length) * 100) : null;

  const rules = studentAttention({ dueSoon: homework.data ? dueSoonCount(homework.data, now) : undefined, attendanceRate: rate, attendanceCount: att.length });
  const text = (r: Rule) => (r.kind === 'homework-soon' ? trn('{{count}} homework due within 2 days', r.n ?? 0) : tr('Low attendance: {{rate}}%', { rate: r.rate }));
  const items: Attention[] = rules.map((r) => ({ tone: r.tone, text: text(r), onPress: r.to ? () => navigation.navigate(r.to!) : undefined }));
  const failed = homework.isError || attendance.isError;
  const attentionState = {
    isPending: (homework.isPending || (!!me.id && attendance.isPending)) && !failed,
    isError: failed,
    refetch: () => Promise.all([homework.refetch(), attendance.refetch()]),
  };

  return (
    <DashboardScreen
      refreshing={homework.isRefetching || attendance.isRefetching}
      onRefresh={() => void Promise.all([homework.refetch(), attendance.refetch(), tt.refetch()])}
      blocks={[
        {
          key: 'attention',
          node: (
            <Section title={tr('Needs attention')} state={attentionState}>
              <AttentionStrip items={items} />
            </Section>
          ),
        },
        {
          key: 'today',
          node: (
            <Section title={tr("Today's classes")} state={me.classId ? tt : undefined}>
              {todaySlots.length ? (
                todaySlots.map((s, i) => (
                  <EventRow key={s.id} last={i === todaySlots.length - 1} time={s.startTime.slice(0, 5)} title={s.subject?.title ?? '—'} subtitle={[s.teacher?.user?.name, s.room].filter(Boolean).join(' · ') || undefined} />
                ))
              ) : (
                <Text style={[typography.body, { color: colors.textMuted }]}>{tr('No classes today')}</Text>
              )}
            </Section>
          ),
        },
        {
          key: 'attendance',
          node: (
            <Section title={tr('Attendance')} state={me.id ? attendance : undefined}>
              <StatTile
                label={tr('Attendance')}
                value={rate != null ? `${rate}%` : '—'}
                tone={rate == null ? 'neutral' : rate >= 90 ? 'success' : rate >= 75 ? 'warning' : 'danger'}
                progress={rate ?? undefined}
                hint={att.length ? trn('{{count}} sessions recorded', att.length) : undefined}
              />
            </Section>
          ),
        },
        {
          key: 'homework',
          node: (
            <Section title={tr('Homework due')} action={{ label: tr('See all'), onPress: () => navigation.navigate('Homework') }} state={homework}>
              {due.length ? (
                due.slice(0, 3).map((a, i) => (
                  <EventRow
                    key={a.id}
                    last={i === Math.min(due.length, 3) - 1}
                    time={new Date(a.dueDate).toLocaleDateString(loc(), { day: 'numeric', month: 'short' })}
                    title={a.title}
                    subtitle={a.subject?.title}
                    onPress={() => navigation.navigate('Homework')}
                  />
                ))
              ) : (
                <IconText icon={IconCircleCheck} color={colors.success}>{tr('No homework due')}</IconText>
              )}
            </Section>
          ),
        },
        {
          key: 'updates',
          node: (
            <Section title={tr('Updates')} state={announcements}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
                <StatTile
                  label={tr('Next due')}
                  value={due[0] ? new Date(due[0].dueDate).toLocaleDateString(loc(), { day: 'numeric', month: 'short' }) : '—'}
                  hint={due[0]?.title}
                  tone={due[0] ? 'warning' : 'neutral'}
                  onPress={() => navigation.navigate('Homework')}
                />
                <StatTile label={tr('New resources')} value={newResources.data != null ? String(newResources.data) : '…'} tone={newResources.data ? 'primary' : 'neutral'} onPress={() => navigation.navigate('Resources')} />
                <StatTile
                  label={tr('To acknowledge')}
                  value={announcements.data ? String(announcements.data.filter((a) => a.requiresAcknowledgment && !a.isAcknowledged).length) : '…'}
                  tone={announcements.data?.some((a) => a.requiresAcknowledgment && !a.isAcknowledged) ? 'warning' : 'neutral'}
                  onPress={() => navigation.navigate('Notices')}
                />
              </View>
            </Section>
          ),
        },
        {
          key: 'shortcuts',
          node: (
            <View style={{ gap: spacing.sm }}>
              <Button title={tr('Resources')} variant="outline" onPress={() => navigation.navigate('Resources')} />
              <Button title={tr('Messages')} variant="ghost" onPress={() => navigation.navigate('Messages')} />
            </View>
          ),
        },
      ]}
    />
  );
}
