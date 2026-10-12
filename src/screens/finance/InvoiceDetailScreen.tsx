// Invoice + record a payment against it (same contract as the web invoices page):
//   GET /finance/invoices/:id, POST /finance/payments { studentId, invoiceId, amount, method, paymentDate, reference?, notes? }
// Flow: ActionBar "Record payment" → BottomSheet form → ConfirmSheet → Toast with the receipt number.
import React, { useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useInvoice, useRecordPayment } from '../../api/finance';
import { classifyError, errorMessage } from '../../api/errors';
import { useOnline } from '../../api/network';
import { useAuth } from '../../auth/AuthContext';
import { useTheme } from '../../theme/ThemeProvider';
import { loc, money, tr } from '../../i18n';
import ActionBar from '../../components/ui/ActionBar';
import Badge from '../../components/ui/Badge';
import BottomSheet from '../../components/ui/BottomSheet';
import Button from '../../components/ui/Button';
import ConfirmSheet from '../../components/ui/ConfirmSheet';
import DatePickerField from '../../components/ui/DatePickerField';
import DetailHero from '../../components/ui/DetailHero';
import ErrorState from '../../components/ui/ErrorState';
import { ErrorSummary, useForm } from '../../components/ui/Form';
import KeyValueList from '../../components/ui/KeyValueList';
import LoadingState from '../../components/ui/LoadingState';
import { MoneyField } from '../../components/ui/NumberField';
import OfflineNote from '../../components/ui/OfflineNote';
import Select from '../../components/ui/Select';
import TextField from '../../components/ui/TextField';
import { useToast } from '../../components/ui/Toast';
import { INVOICE_STATUS } from './InvoicesScreen';

const METHODS = ['cash', 'bank_transfer', 'cheque', 'card', 'online', 'other'] as const;
type Method = (typeof METHODS)[number];
const METHOD_LABELS: Record<Method, string> = { cash: 'Cash', bank_transfer: 'Bank transfer', cheque: 'Cheque', card: 'Card', online: 'Online', other: 'Other' };
const today = () => new Date().toISOString().slice(0, 10);

export default function InvoiceDetailScreen() {
  const { colors, spacing } = useTheme();
  const { id } = useRoute().params as { id: number };
  const online = useOnline();
  const { user } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const inv = useInvoice(id);
  const balance = Number(inv.data?.balance ?? 0);
  const form = useForm({ amount: null as number | null, method: 'cash' as Method, paymentDate: today() as string | null, reference: '' }, (v) => ({
    amount: v.amount == null || !(v.amount > 0) ? tr('Enter a valid amount') : v.amount > balance + 1e-9 ? tr('The amount is higher than the balance ({{balance}})', { balance: money(balance) }) : undefined,
    paymentDate: v.paymentDate ? undefined : tr('Required'),
  }));
  const pay = useRecordPayment((d) => {
    setConfirm(false);
    setOpen(false);
    form.reset();
    toast({ message: `${tr('Payment recorded')} · ${tr('Receipt')} ${d?.receipt?.receiptNumber ?? '—'}`, tone: 'success' });
  });

  if (inv.isPending) return <LoadingState />;
  if (inv.isError || !inv.data) {
    const forbidden = classifyError(inv.error).kind === 'forbidden';
    return <ErrorState message={forbidden ? tr("You don't have permission to do this.") : tr('Could not load data.')} retryLabel={tr('Retry')} onRetry={forbidden ? undefined : () => inv.refetch()} />;
  }

  const i = inv.data;
  const total = Number(i.totalToPay);
  const paidShare = total > 0 ? Math.round((Number(i.amountPaid) / total) * 100) : 0;
  // a parent reads the invoice only: no payment action
  const payable = (user?.role === 'admin' || user?.role === 'secretary') && balance > 0 && !['paid', 'cancelled', 'draft'].includes(i.status);
  const v = form.values;

  const review = () => {
    setServerError(null);
    form.submit(() => setConfirm(true));
  };
  const record = () =>
    pay.mutate(
      { studentId: i.studentId, invoiceId: id, amount: v.amount!, method: v.method, paymentDate: v.paymentDate!, reference: v.reference.trim() || null },
      {
        onError: (e) => {
          // keep the values; show the mapped error on the amount field and in the summary
          setConfirm(false);
          setServerError(errorMessage(e, tr('Failed to record payment')));
        },
      },
    );

  return (
    <>
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <DetailHero
          title={i.student?.user?.name ?? '—'}
          subtitle={i.invoiceNumber}
          badge={<Badge label={tr(INVOICE_STATUS[i.status].label)} tone={INVOICE_STATUS[i.status].tone} />}
          figure={{ label: tr('Balance'), value: money(i.balance) }}
          progress={{ value: paidShare, label: tr('Paid {{p}}%', { p: paidShare }), caption: `${tr('Paid')} ${money(i.amountPaid)} / ${money(i.totalToPay)}` }}
        />
        <KeyValueList
          rows={[
            { label: tr('Total to pay'), value: money(i.totalToPay) },
            { label: tr('Paid'), value: money(i.amountPaid) },
            { label: tr('Due date'), value: i.dueDate ? new Date(`${i.dueDate.slice(0, 10)}T00:00:00`).toLocaleDateString(loc(), { day: 'numeric', month: 'long', year: 'numeric' }) : null },
          ]}
        />
      </ScrollView>
      {payable ? (
        <ActionBar>
          <Button title={tr('Record payment')} onPress={() => setOpen(true)} />
        </ActionBar>
      ) : null}

      <BottomSheet visible={open} onClose={() => setOpen(false)} title={tr('Record payment')} footer={<Button title={tr('Review payment')} onPress={review} disabled={!online} style={{ flex: 1 }} />}>
        <ErrorSummary items={serverError ? [...form.summary.filter(([k]) => k !== 'amount'), ['amount', serverError]] : form.summary} labels={{ amount: tr('Amount'), paymentDate: tr('Payment date') }} />
        <MoneyField
          label={tr('Amount')}
          required
          hint={tr('Balance: {{balance}}', { balance: money(balance) })}
          {...form.input('amount')}
          onChange={(n) => (setServerError(null), form.set('amount')(n))}
          error={serverError ?? form.errors.amount}
        />
        <Select label={tr('Payment method')} value={v.method} onChange={form.set('method')} options={METHODS.map((m) => ({ value: m, label: tr(METHOD_LABELS[m]) }))} />
        <DatePickerField label={tr('Payment date')} required {...form.pick('paymentDate')} />
        <TextField label={tr('Reference')} optional maxLength={100} {...form.text('reference')} />
        <OfflineNote />
        <Text style={{ height: spacing.md }} />
      </BottomSheet>

      <ConfirmSheet
        visible={confirm}
        title={tr('Record this payment?')}
        message={tr('{{amount}} by {{method}} on {{date}}. It is added to the invoice and the receipt is issued.', { amount: money(v.amount), method: tr(METHOD_LABELS[v.method]), date: v.paymentDate })}
        confirmLabel={tr('Record payment')}
        loading={pay.isPending}
        onConfirm={record}
        onCancel={() => setConfirm(false)}
      />
    </>
  );
}
