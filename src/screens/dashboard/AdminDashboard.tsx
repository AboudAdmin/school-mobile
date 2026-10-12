// Admin dashboard on the DashboardScreen scaffold: Attention → People · Attendance · Finance.
//   GET /reports/overview?days=30   people, attendance, today's sessions
//   GET /finance/dashboard           invoiced / collected / outstanding
//   GET /finance/reports/aging       overdue invoices
import React from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/apiClient';
import { financeKeys, useTodayPayments } from '../../api/finance';
import { usePendingRegistrations } from '../../api/registrations';
import { useTheme } from '../../theme/ThemeProvider';
import { loc, money, tr, trn } from '../../i18n';
import { type Tone } from '../../components/ui/Badge';
import AttentionStrip, { type Attention } from '../../components/ui/AttentionStrip';
import DashboardScreen from '../../components/ui/DashboardScreen';
import Section from '../../components/ui/Section';
import StatTile from '../../components/ui/StatTile';
import { LineChart } from '../../components/charts/Charts';
import { adminAttention, type Rule } from './dashboardRules';

const DAYS = 30;

interface Overview {
  users: { byRole: Record<string, number>; byStatus: Record<string, number> };
  students: { withoutParent: number; byClass: { classId: number | null }[] };
  attendance: {
    rate: number | null;
    days: number;
    daily: { date: string; present: number; late: number; absent: number }[];
    repeatedAbsences: { count: number };
  };
  today: { sessions: number; sessionsWithAttendance: number };
}
interface FinanceStats {
  stats: { totalInvoiced: number; totalPaid: number; totalOutstanding: number; overdueCount: number };
}
interface Aging {
  totalOverdue: number;
  totalOverdueCount: number;
}

const rateTone = (r: number | null | undefined): Tone => (r == null ? 'neutral' : r >= 90 ? 'success' : r >= 75 ? 'warning' : 'danger');

export default function AdminDashboard() {
  const { colors, spacing, typography } = useTheme();
  const navigation = useNavigation<{ navigate: (screen: string) => void }>();
  const year = new Date().getFullYear();

  const overview = useQuery({
    queryKey: ['reports-overview', DAYS],
    queryFn: async () => (await apiClient.get<Overview>('/reports/overview', { params: { days: DAYS } })).data,
  });
  const finance = useQuery({
    queryKey: financeKeys.dashboard(year),
    queryFn: async () =>
      (await apiClient.get('/finance/dashboard', { params: { fromDate: `${year}-01-01`, toDate: `${year}-12-31` } })).data.data as FinanceStats,
  });
  const aging = useQuery({
    queryKey: financeKeys.aging(),
    queryFn: async () => (await apiClient.get('/finance/reports/aging')).data.data as Aging,
  });

  const pendingReg = usePendingRegistrations();
  const payments = useTodayPayments();

  const ov = overview.data;
  const att = ov?.attendance;
  const fin = finance.data?.stats;
  const ag = aging.data;
  const collectionRate = fin && fin.totalInvoiced > 0 ? Math.round((fin.totalPaid / fin.totalInvoiced) * 100) : null;

  const rules = adminAttention({
    overdueCount: ag?.totalOverdueCount,
    overdueAmount: ag?.totalOverdue,
    repeatedAbsences: att?.repeatedAbsences.count,
    attendanceRate: att?.rate,
    attendanceDays: att?.days,
    todaySessions: ov?.today.sessions,
    todaySessionsWithAttendance: ov?.today.sessionsWithAttendance,
    withoutParent: ov?.students.withoutParent,
    blockedAccounts: ov ? (ov.users.byStatus.suspended || 0) + (ov.users.byStatus.inactive || 0) : undefined,
  });
  const text = (r: Rule) =>
    ({
      overdue: trn('{{count}} invoices are overdue · {{amount}}', r.n ?? 0, { amount: money(r.amount) }),
      'repeated-absences': trn('{{count}} students have repeated absences', r.n ?? 0),
      'low-attendance': tr('Attendance is {{rate}}% over the last {{days}} days', { rate: r.rate, days: r.days }),
      'attendance-pending': trn("Attendance not yet taken for {{v1}} of today's {{count}} class", r.amount ?? 0, { v1: r.n }),
      'no-parent': trn('{{count}} students have no linked parent', r.n ?? 0),
      'blocked-accounts': trn('{{count}} accounts are suspended or inactive', r.n ?? 0),
    })[r.kind] ?? r.kind;
  const items: Attention[] = rules.map((r) => ({ tone: r.tone, text: text(r), onPress: r.to ? () => navigation.navigate(r.to!) : undefined }));
  // never claim "nothing needs attention" while a source is loading or failed
  const failed = overview.isError || aging.isError;
  const attentionState = {
    isPending: (overview.isPending || aging.isPending) && !failed,
    isError: failed,
    refetch: () => Promise.all([overview.refetch(), aging.refetch()]),
  };

  const daily = att?.daily ?? [];
  const pct = daily.map((d) => Math.round(((d.present + d.late) / Math.max(d.present + d.late + d.absent, 1)) * 100));

  return (
    <DashboardScreen
      refreshing={overview.isRefetching || finance.isRefetching || aging.isRefetching}
      onRefresh={() => void Promise.all([overview.refetch(), finance.refetch(), aging.refetch()])}
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
            <Section title={tr('Today')} state={payments}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
                <StatTile label={tr('Pending approvals')} value={pendingReg.data != null ? String(pendingReg.data) : '…'} tone={pendingReg.data ? 'warning' : 'success'} onPress={() => navigation.navigate('Registrations')} />
                <StatTile label={tr("Today's payments")} value={payments.data ? money(payments.data.total) : '…'} hint={payments.data ? trn('{{count}} payments', payments.data.count) : undefined} tone="success" />
              </View>
            </Section>
          ),
        },
        {
          key: 'people',
          node: (
            <Section title={tr('People')} state={overview}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
                <StatTile label={tr('Students')} value={ov ? String(ov.users.byRole.student ?? 0) : '…'} tone="primary" onPress={() => navigation.navigate('Students')} />
                <StatTile label={tr('Teachers')} value={ov ? String(ov.users.byRole.teacher ?? 0) : '…'} tone="primary" onPress={() => navigation.navigate('Teachers')} />
                <StatTile
                  label={tr('Classes')}
                  value={ov ? String(ov.students.byClass.filter((c) => c.classId !== null).length) : '…'}
                  hint={tr('with enrolled students')}
                  tone="primary"
                  onPress={() => navigation.navigate('Classes')}
                />
              </View>
            </Section>
          ),
        },
        {
          key: 'attendance',
          node: (
            <Section title={tr('Attendance')} hint={tr('Present or late, per day with attendance')} state={overview}>
              <StatTile
                label={tr('Attended · last {{days}} days', { days: DAYS })}
                value={att?.rate != null ? `${att.rate}%` : '—'}
                tone={rateTone(att?.rate)}
                progress={att?.rate ?? undefined}
                hint={att && att.rate == null ? tr('no attendance recorded yet') : undefined}
              />
              {daily.length === 0 ? (
                <Text style={[typography.body, { color: colors.textMuted }]}>{tr('No attendance recorded')}</Text>
              ) : (
                <>
                  <LineChart
                    labels={daily.map((d) => new Date(`${d.date}T00:00:00`).toLocaleDateString(loc(), { day: 'numeric', month: 'short' }))}
                    data={pct}
                    color={colors.primary}
                    suffix="%"
                    maxValue={100}
                  />
                  {/* every figure also as text */}
                  <Text style={[typography.caption, { color: colors.textMuted }]}>{tr('Last day {{rate}}% · lowest {{low}}%', { rate: pct[pct.length - 1], low: Math.min(...pct) })}</Text>
                </>
              )}
            </Section>
          ),
        },
        {
          key: 'finance',
          node: (
            <Section title={tr('Finance')} state={finance}>
              <StatTile
                label={tr('Collection rate')}
                value={collectionRate != null ? `${collectionRate}%` : '—'}
                tone={rateTone(collectionRate)}
                progress={collectionRate ?? undefined}
                hint={fin ? tr('{{paid}} of {{invoiced}}', { paid: money(fin.totalPaid), invoiced: money(fin.totalInvoiced) }) : undefined}
                onPress={() => navigation.navigate('Finance')}
              />
            </Section>
          ),
        },
      ]}
    />
  );
}
