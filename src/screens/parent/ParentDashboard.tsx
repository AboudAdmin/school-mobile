// Parent dashboard for the active child on the DashboardScreen scaffold: Attention → Attendance · Homework · Results · Fees → Shortcuts.
// Sources (per child): GET /attendance?studentId, GET /assignments?studentId, GET /grades/report-card/:id, GET /finance/students/:id/summary.
import React from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import IconCalendarCheck from '@tabler/icons-react-native/IconCalendarCheck';
import IconBook from '@tabler/icons-react-native/IconBook';
import IconAward from '@tabler/icons-react-native/IconAward';
import IconCash from '@tabler/icons-react-native/IconCash';
import { useLatestAnnouncements } from '../../api/announcements';
import { useDueAssignments } from '../../api/assignments';
import { useStudentAttendance } from '../../api/attendance';
import { useActiveChild } from '../../api/children';
import { useFeeSummary } from '../../api/finance';
import { useReportCard } from '../../api/grades';
import { loc, money, tr, trn } from '../../i18n';
import { useTheme } from '../../theme/ThemeProvider';
import AttentionStrip, { type Attention } from '../../components/ui/AttentionStrip';
import Button from '../../components/ui/Button';
import DashboardScreen from '../../components/ui/DashboardScreen';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import LoadingState from '../../components/ui/LoadingState';
import ScorePill from '../../components/ui/ScorePill';
import ListItem from '../../components/ui/ListItem';
import Section from '../../components/ui/Section';
import StatTile from '../../components/ui/StatTile';
import ViewingBar from '../../components/ui/ViewingBar';
import { parentAttention } from '../dashboard/parentAttention';

export default function ParentDashboard() {
  const { spacing } = useTheme();
  const navigation = useNavigation<{ navigate: (screen: string, params?: object) => void }>();
  const ctx = useActiveChild();
  const child = ctx?.active ?? null;
  const attendance = useStudentAttendance(child?.id);
  const homework = useDueAssignments(child?.id);
  const card = useReportCard(child?.id);
  const fees = useFeeSummary(child?.id);
  const announcements = useLatestAnnouncements('parent');

  if (!ctx || ctx.isPending) return <LoadingState />;
  if (ctx.isError) return <ErrorState message={tr('Could not load data.')} retryLabel={tr('Retry')} onRetry={ctx.refetch} />;
  if (!child) return <EmptyState title={tr('No linked children')} message={tr('Ask the school office to link your children to your account.')} />;

  const att = attendance.data ?? [];
  const rate = att.length ? Math.round((att.filter((r) => r.status !== 'absent').length / att.length) * 100) : null;
  const now = new Date().toISOString().slice(0, 10);
  const due = (homework.data ?? []).filter((a) => a.status === 'approved' && a.dueDate.slice(0, 10) >= now).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  // latest trimester that has an average (the report card is the same source the Web parent dashboard reads)
  const trimesters = card.data ? (['T3', 'T2', 'T1'] as const).filter((k) => card.data!.trimesters[k]?.average != null) : [];
  const latest = trimesters[0];
  const average = latest ? card.data!.trimesters[latest].average : card.data?.annual?.average ?? null;
  const s = fees.data?.summary;
  const paidShare = s && s.totalInvoiced > 0 ? Math.round((s.totalPaid / s.totalInvoiced) * 100) : 0;

  const pendingInvoices = (fees.data?.invoices ?? []).filter((i) => Number(i.balance) > 0 && !['paid', 'cancelled', 'draft'].includes(i.status)).length;

  const rules = parentAttention({ overdueCount: s?.overdueCount, attendanceRate: rate, attendanceCount: att.length });
  const items: Attention[] = rules.map((r) =>
    r.kind === 'overdue'
      ? { tone: r.tone, text: trn('{{count}} invoices are overdue', r.value), onPress: () => navigation.navigate('Fees') }
      : { tone: r.tone, text: tr('Low attendance: {{rate}}%', { rate: r.value }), onPress: () => navigation.navigate('ChildAttendance') },
  );
  const anyPending = attendance.isPending || fees.isPending;
  const anyError = attendance.isError || fees.isError;

  const refresh = () => Promise.all([attendance.refetch(), homework.refetch(), card.refetch(), fees.refetch()]);

  return (
    <DashboardScreen
      refreshing={attendance.isRefetching || fees.isRefetching}
      onRefresh={() => void refresh()}
      blocks={[
        { key: 'viewing', node: <ViewingBar me={{ mode: 'child', name: child.user?.name, className: child.class?.name }} /> },
        {
          key: 'attention',
          node: (
            // never "nothing needs attention" while a source is loading or failed
            <Section title={tr('Needs attention')} state={anyPending || anyError ? { isPending: anyPending && !anyError, isError: anyError, refetch: refresh } : undefined}>
              <AttentionStrip items={items} />
            </Section>
          ),
        },
        {
          key: 'attendance',
          node: (
            <Section title={tr('Attendance')} action={{ label: tr('See all'), onPress: () => navigation.navigate('ChildAttendance') }} state={attendance}>
              <StatTile label={tr('Attended')} value={rate != null ? `${rate}%` : '—'} icon={IconCalendarCheck} tone={rate == null ? 'neutral' : rate >= 90 ? 'success' : rate >= 75 ? 'warning' : 'danger'} progress={rate ?? undefined} hint={att.length ? trn('{{count}} sessions recorded', att.length) : undefined} />
            </Section>
          ),
        },
        {
          key: 'homework',
          node: (
            <Section title={tr('Homework')} action={{ label: tr('See all'), onPress: () => navigation.navigate('Homework') }} state={homework}>
              <StatTile
                label={tr('Homework due')}
                value={String(due.length)}
                icon={IconBook}
                tone={due.length ? 'warning' : 'success'}
                hint={due[0] ? `${due[0].title} · ${new Date(due[0].dueDate).toLocaleDateString(loc(), { day: 'numeric', month: 'short' })}` : undefined}
              />
            </Section>
          ),
        },
        {
          key: 'results',
          node: (
            <Section title={tr('Results')} action={{ label: tr('See all'), onPress: () => navigation.navigate('Results') }} state={card}>
              <StatTile label={latest ? `${tr('Trimester average')} ${latest}` : tr('Trimester average')} value={average != null ? `${average.toFixed(2)}/20` : '—'} icon={IconAward} />
              {average != null ? <ScorePill score={average} /> : null}
            </Section>
          ),
        },
        {
          key: 'fees',
          node: (
            <Section title={tr('Fees')} action={{ label: tr('See all'), onPress: () => navigation.navigate('Fees') }} state={fees}>
              <StatTile
                label={tr('Outstanding')}
                value={money(s?.totalOutstanding)}
                icon={IconCash}
                tone={s && s.totalOutstanding > 0 ? 'warning' : 'success'}
                progress={s && s.totalInvoiced > 0 ? paidShare : undefined}
                hint={s && s.totalInvoiced > 0 ? `${money(s.totalPaid)} / ${money(s.totalInvoiced)}` : undefined}
              />
              <StatTile label={tr('Pending invoices')} value={String(pendingInvoices)} tone={pendingInvoices ? 'warning' : 'success'} onPress={() => navigation.navigate('Fees')} />
            </Section>
          ),
        },
        {
          key: 'announcements',
          node: (
            <Section title={tr('Latest announcements')} action={{ label: tr('See all'), onPress: () => navigation.navigate('Notices') }} state={announcements}>
              {(announcements.data ?? []).slice(0, 3).map((a, i, arr) => (
                <ListItem key={a.id} title={a.title} last={i === arr.length - 1} onPress={() => navigation.navigate('Notices')} />
              ))}
              {announcements.data && !announcements.data.length ? <EmptyState title={tr('No announcements')} /> : null}
            </Section>
          ),
        },
        {
          key: 'shortcuts',
          node: (
            <View style={{ gap: spacing.sm }}>
              <Button title={tr('Timetable')} variant="outline" onPress={() => navigation.navigate('Timetable')} />
              <Button title={tr('Messages')} variant="ghost" onPress={() => navigation.navigate('Messages')} />
            </View>
          ),
        },
      ]}
    />
  );
}
