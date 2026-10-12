// Finance overview (read-only, as the task scopes it): same sources as the web finance dashboard.
//   GET /finance/dashboard?fromDate&toDate   totals, invoice status counts, monthly collections
//   GET /finance/reports/aging               overdue buckets
import React from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useFinanceAging, useFinanceDashboard } from '../../api/finance';
import { useTheme } from '../../theme/ThemeProvider';
import { loc, money, tr, trn } from '../../i18n';
import Badge from '../../components/ui/Badge';
import Section from '../../components/ui/Section';
import StatTile from '../../components/ui/StatTile';
import { BarChart, DonutChart } from '../../components/charts/Charts';
import IconCircleCheck from '@tabler/icons-react-native/IconCircleCheck';
import { IconText } from '../../components/ui/Icon';

export default function FinanceScreen() {
  const { colors, spacing, typography } = useTheme();
  const year = new Date().getFullYear();
  const dash = useFinanceDashboard(year);
  const aging = useFinanceAging();

  const s = dash.data?.stats;
  const rate = s && s.totalInvoiced > 0 ? Math.round((s.totalPaid / s.totalInvoiced) * 100) : null;
  const monthly = dash.data?.monthly.monthly ?? [];
  const monthLabel = (m: number) => new Date(year, m - 1, 1).toLocaleDateString(loc(), { month: 'narrow' });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
      refreshControl={
        <RefreshControl
          refreshing={dash.isRefetching || aging.isRefetching}
          onRefresh={() => Promise.all([dash.refetch(), aging.refetch()])}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      <Section variant="plain" title={tr('Overview {{year}}', { year })} state={dash}>
        {s ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginHorizontal: -spacing.xs }}>
            <StatTile label={tr('Invoiced')} value={money(s.totalInvoiced)} hint={trn('{{count}} invoices', s.invoicesCount)} />
            <StatTile label={tr('Collected')} value={money(s.totalPaid)} tone="success" />
            <StatTile label={tr('Outstanding')} value={money(s.totalOutstanding)} tone={s.totalOutstanding > 0 ? 'warning' : 'success'} />
            <StatTile
              label={tr('Collection rate')}
              value={rate != null ? `${rate}%` : '—'}
              tone={rate == null ? 'neutral' : rate >= 90 ? 'success' : rate >= 75 ? 'warning' : 'danger'}
              progress={rate ?? undefined}
            />
          </View>
        ) : null}
      </Section>

      <Section title={tr('Invoices by status')} state={dash}>
        {s && s.invoicesCount > 0 ? (
          <DonutChart
            centerLabel={tr('invoices')}
            items={[
              { label: tr('Paid'), value: s.paidCount, color: colors.success },
              { label: tr('Partly paid'), value: s.partialCount, color: colors.info },
              { label: tr('Waiting'), value: s.unpaidCount, color: colors.warning },
              { label: tr('Overdue'), value: s.overdueCount, color: colors.danger },
            ]}
          />
        ) : (
          <Text style={[typography.body, { color: colors.textMuted }]}>{tr('No invoices yet')}</Text>
        )}
      </Section>

      <Section title={tr('Collected per month')} hint={String(year)} state={dash}>
        <BarChart labels={monthly.map((m) => monthLabel(m.month))} series={[{ name: tr('Collected'), color: colors.primary, data: monthly.map((m) => m.total) }]} />
      </Section>

      <Section title={tr('Overdue invoices')} hint={aging.data ? money(aging.data.totalOverdue) : undefined} state={aging}>
        {aging.data?.totalOverdueCount ? (
          aging.data.buckets.map((b) => (
            <View key={b.key} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm }}>
              <Text style={[typography.body, { color: colors.text }]}>{tr(b.label)}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <Text style={[typography.body, { color: colors.textMuted }]}>{money(b.amount)}</Text>
                <Badge label={String(b.count)} tone={b.count ? 'danger' : 'neutral'} />
              </View>
            </View>
          ))
        ) : (
          <IconText icon={IconCircleCheck} color={colors.success}>{tr('No overdue invoices')}</IconText>
        )}
      </Section>
    </ScrollView>
  );
}
