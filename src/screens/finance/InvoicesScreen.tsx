import React, { useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchInvoicePage, invoiceKeys, type InvoiceRow, type InvoiceStatus } from '../../api/finance';
import { loc, money, tr } from '../../i18n';
import Badge, { type Tone } from '../../components/ui/Badge';
import DataCard from '../../components/ui/DataCard';
import FilterChips from '../../components/ui/FilterChips';
import RecordList from '../../components/ui/RecordList';
import { useTheme } from '../../theme/ThemeProvider';

// Same wording as the web finance dashboard ("Waiting" = sent, not yet paid)
export const INVOICE_STATUS: Record<InvoiceStatus, { label: string; tone: Tone }> = {
  draft: { label: 'Draft', tone: 'neutral' },
  sent: { label: 'Waiting', tone: 'warning' },
  partial: { label: 'Partly paid', tone: 'info' },
  paid: { label: 'Paid', tone: 'success' },
  overdue: { label: 'Overdue', tone: 'danger' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
};

const FILTERS = ['', 'sent', 'partial', 'overdue', 'paid'] as const;

/** GET /api/finance/invoices (admin, secretary). */
export default function InvoicesScreen() {
  const navigation = useNavigation<{ navigate: (screen: string, params?: object) => void }>();
  const [status, setStatus] = useState<(typeof FILTERS)[number]>('');
  const { spacing } = useTheme();

  return (
    <RecordList<InvoiceRow>
      queryKey={invoiceKeys.list({ status })}
      fetchPage={(page) => fetchInvoicePage(status, page)}
      keyExtractor={(i) => String(i.id)}
      search={{ placeholder: tr('Search by student or invoice number'), match: (i, q) => i.invoiceNumber.toLowerCase().includes(q) || !!i.student?.user?.name.toLowerCase().includes(q) }}
      filters={
        <FilterChips value={status} onChange={setStatus} options={FILTERS.map((v) => ({ value: v, label: v ? tr(INVOICE_STATUS[v].label) : tr('All') }))} />
      }
      renderItem={({ item }) => {
        const name = item.student?.user?.name ?? '—';
        const balance = Number(item.balance);
        const total = Number(item.totalToPay);
        const paidShare = total > 0 ? Math.round((Number(item.amountPaid) / total) * 100) : 0;
        const payable = balance > 0 && !['paid', 'cancelled', 'draft'].includes(item.status);
        const open = () => navigation.navigate('InvoiceDetail', { id: item.id });
        return (
          <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.md }}>
            <DataCard
              title={name}
              subtitle={item.invoiceNumber}
              trailing={<Badge label={tr(INVOICE_STATUS[item.status].label)} tone={INVOICE_STATUS[item.status].tone} />}
              figure={money(item.totalToPay)}
              meta={[
                { label: tr('Balance'), value: money(item.balance) },
                { label: tr('Due date'), value: item.dueDate ? new Date(`${item.dueDate.slice(0, 10)}T00:00:00`).toLocaleDateString(loc(), { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
              ]}
              progress={{ value: paidShare, label: tr('Paid {{p}}%', { p: paidShare }) }}
              footer={payable ? { label: tr('Record payment'), onPress: open } : undefined}
              onPress={open}
            />
          </View>
        );
      }}
      filtersActive={!!status}
      onClearFilters={() => setStatus('')}
      emptyTitle={tr('No invoices found')}
      emptyMessage={tr('Try another filter.')}
    />
  );
}
