// Secretary front-office dashboard on the DashboardScreen scaffold: Attention → Front office · Finance · Students.
//   GET /secretary/dashboard                 collected / pending / overdue / counts
//   GET /registration-requests?status=pending pending registrations (byStatus)
//   GET /reports/overview                     students without a linked parent
import React from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/apiClient';
import { dashboardKeys, useTodayPayments } from '../../api/finance';
import { usePendingRegistrations } from '../../api/registrations';
import { useRecentStudents } from '../../api/students';
import { useTheme } from '../../theme/ThemeProvider';
import { money, tr, trn } from '../../i18n';
import AttentionStrip, { type Attention } from '../../components/ui/AttentionStrip';
import DashboardScreen from '../../components/ui/DashboardScreen';
import ListItem, { Avatar } from '../../components/ui/ListItem';
import Section from '../../components/ui/Section';
import StatTile from '../../components/ui/StatTile';
import { secretaryAttention, type Rule } from './dashboardRules';

interface Stats {
  collected: number;
  pending: number;
  overdueCount: number;
  studentsCount: number;
  parentsCount: number;
}

export default function SecretaryDashboard() {
  const { spacing } = useTheme();
  const navigation = useNavigation<{ navigate: (screen: string, params?: object) => void }>();

  const stats = useQuery({ queryKey: dashboardKeys.secretary, queryFn: async () => (await apiClient.get<Stats>('/secretary/dashboard')).data });
  const pending = usePendingRegistrations();
  const payments = useTodayPayments();
  const recent = useRecentStudents(3);
  const overview = useQuery({
    queryKey: ['reports-overview', 30],
    queryFn: async () => (await apiClient.get('/reports/overview', { params: { days: 30 } })).data as { students: { withoutParent: number }; users: { byStatus: Record<string, number> } },
  });

  const s = stats.data;
  const rules = secretaryAttention({ pendingRegistrations: pending.data, overdueCount: s?.overdueCount, withoutParent: overview.data?.students.withoutParent });
  const text = (r: Rule) =>
    ({
      'pending-registrations': trn('{{count}} registration requests are waiting for review', r.n ?? 0),
      overdue: trn('{{count}} invoices are overdue', r.n ?? 0),
      'no-parent': trn('{{count}} students have no linked parent', r.n ?? 0),
    })[r.kind] ?? r.kind;
  const items: Attention[] = rules.map((r) => ({ tone: r.tone, text: text(r), onPress: () => navigation.navigate(r.to!) }));
  const failed = stats.isError || pending.isError || overview.isError;
  const attentionState = {
    isPending: (stats.isPending || pending.isPending || overview.isPending) && !failed,
    isError: failed,
    refetch: () => Promise.all([stats.refetch(), pending.refetch(), overview.refetch()]),
  };

  return (
    <DashboardScreen
      refreshing={stats.isRefetching || pending.isRefetching || overview.isRefetching}
      onRefresh={() => void attentionState.refetch()}
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
          key: 'front',
          node: (
            <Section title={tr('Front office')} state={pending}>
              <StatTile label={tr('Registrations to review')} value={pending.data != null ? String(pending.data) : '…'} tone={pending.data ? 'warning' : 'success'} onPress={() => navigation.navigate('Registrations')} />
            </Section>
          ),
        },
        {
          key: 'finance',
          node: (
            <Section title={tr('Finance')} state={stats}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
                <StatTile label={tr('Collected')} value={s ? money(s.collected) : '…'} tone="success" onPress={() => navigation.navigate('Invoices')} />
                <StatTile label={tr('Outstanding')} value={s ? money(s.pending) : '…'} tone={s && s.pending > 0 ? 'warning' : 'success'} onPress={() => navigation.navigate('Invoices')} />
                <StatTile label={tr("Today's payments")} value={payments.data ? money(payments.data.total) : '…'} hint={payments.data ? trn('{{count}} payments', payments.data.count) : undefined} tone="success" />
              </View>
            </Section>
          ),
        },
        {
          key: 'accounts',
          node: (
            <Section title={tr('User accounts')} state={overview}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
                {(['active', 'suspended', 'inactive'] as const).map((k) => (
                  <StatTile key={k} label={tr(k === 'active' ? 'Active' : k === 'suspended' ? 'Suspended' : 'Inactive')} value={overview.data ? String(overview.data.users.byStatus[k] ?? 0) : '…'} tone={k === 'active' ? 'success' : (overview.data?.users.byStatus[k] ?? 0) > 0 ? 'warning' : 'neutral'} />
                ))}
              </View>
            </Section>
          ),
        },
        {
          key: 'recent',
          node: (
            <Section title={tr('Recent enrollments')} action={{ label: tr('See all'), onPress: () => navigation.navigate('Students') }} state={recent}>
              {(recent.data ?? []).map((st, i, a) => (
                <ListItem key={st.id} title={st.user.name} subtitle={st.class?.name ?? tr('No class')} leading={<Avatar name={st.user.name} />} last={i === a.length - 1} onPress={() => navigation.navigate('StudentDetail', { id: st.id })} />
              ))}
            </Section>
          ),
        },
        {
          key: 'students',
          node: (
            <Section title={tr('Students')} state={stats}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
                <StatTile label={tr('Students')} value={s ? String(s.studentsCount) : '…'} tone="primary" onPress={() => navigation.navigate('Students')} />
                <StatTile label={tr('Parents')} value={s ? String(s.parentsCount) : '…'} tone="primary" />
              </View>
            </Section>
          ),
        },
      ]}
    />
  );
}
