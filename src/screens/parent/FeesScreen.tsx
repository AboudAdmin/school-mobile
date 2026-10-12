// Parent fees for the active child (read-only): outstanding balance + paid progress as the hero, invoices as cards.
//   GET /finance/students/:studentId/summary → { summary, invoices } (parent allowed for their own children; others get 403)
// The statement and monthly breakdown come with TASK-056; there is no payment action here.
import React from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useActiveChild } from '../../api/children';
import { useFeeSummary } from '../../api/finance';
import { loc, money, tr } from '../../i18n';
import { useTheme } from '../../theme/ThemeProvider';
import Badge from '../../components/ui/Badge';
import DataCard from '../../components/ui/DataCard';
import DetailHero from '../../components/ui/DetailHero';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import LoadingState from '../../components/ui/LoadingState';
import ViewingBar from '../../components/ui/ViewingBar';
import { INVOICE_STATUS } from '../finance/InvoicesScreen';

export default function FeesScreen() {
  const { colors, spacing, typography } = useTheme();
  const navigation = useNavigation<{ navigate: (screen: string, params?: object) => void }>();
  const ctx = useActiveChild();
  const child = ctx?.active ?? null;
  const q = useFeeSummary(child?.id);

  if (!ctx || ctx.isPending || (child && q.isPending)) return <LoadingState />;
  if (!child) return <EmptyState title={tr('No linked children')} message={tr('Ask the school office to link your children to your account.')} />;
  if (ctx.isError || q.isError || !q.data) return <ErrorState message={tr('Could not load data.')} retryLabel={tr('Retry')} onRetry={() => (ctx.refetch(), q.refetch())} />;

  const { summary: s, invoices } = q.data;
  const share = s.totalInvoiced > 0 ? Math.round((s.totalPaid / s.totalInvoiced) * 100) : 0;
  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
      refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => q.refetch()} colors={[colors.primary]} tintColor={colors.primary} />}
    >
      <ViewingBar me={{ mode: 'child', name: child.user?.name, className: child.class?.name }} />
      <DetailHero
        title={tr('Fees')}
        subtitle={child.user?.name}
        figure={{ label: tr('Outstanding'), value: money(s.totalOutstanding) }}
        progress={{ value: share, label: tr('Paid {{p}}%', { p: share }), caption: `${tr('Paid')} ${money(s.totalPaid)} / ${money(s.totalInvoiced)}` }}
      />
      {invoices.length ? (
        <View style={{ gap: spacing.md }}>
          <Text accessibilityRole="header" style={[typography.heading, { color: colors.text }]}>
            {tr('Invoices')}
          </Text>
          {invoices.map((i) => (
            <DataCard
              key={i.id}
              title={i.invoiceNumber}
              trailing={<Badge label={tr(INVOICE_STATUS[i.status].label)} tone={INVOICE_STATUS[i.status].tone} />}
              figure={money(i.totalToPay)}
              meta={[
                { label: tr('Balance'), value: money(i.balance) },
                { label: tr('Due date'), value: i.dueDate ? new Date(`${i.dueDate.slice(0, 10)}T00:00:00`).toLocaleDateString(loc(), { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
              ]}
              onPress={() => navigation.navigate('InvoiceDetail', { id: i.id })}
            />
          ))}
        </View>
      ) : (
        <EmptyState title={tr('No invoices yet')} />
      )}
    </ScrollView>
  );
}
