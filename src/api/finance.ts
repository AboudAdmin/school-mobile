// Finance API module: types, query keys, fetchers and hooks (the pattern other domains adopt as their screens migrate).
//   GET /finance/invoices[/:id], POST /finance/payments, GET /finance/dashboard, GET /finance/reports/aging
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './apiClient';

export type InvoiceStatus = 'draft' | 'sent' | 'partial' | 'paid' | 'overdue' | 'cancelled';
export interface InvoiceRow {
  id: number;
  invoiceNumber: string;
  status: InvoiceStatus;
  studentId: number;
  totalToPay: string;
  amountPaid: string;
  balance: string;
  dueDate: string | null;
  student?: { user?: { name: string } } | null;
}
export interface FinanceDashboard {
  stats: {
    totalInvoiced: number;
    totalPaid: number;
    totalOutstanding: number;
    invoicesCount: number;
    paidCount: number;
    partialCount: number;
    unpaidCount: number;
    overdueCount: number;
  };
  monthly: { monthly: { month: number; total: number }[] };
}
export interface Aging {
  buckets: { key: string; label: string; count: number; amount: number }[];
  totalOverdue: number;
  totalOverdueCount: number;
}
export interface PaymentInput {
  studentId: number;
  invoiceId: number;
  amount: number;
  method: string;
  paymentDate: string;
  reference: string | null;
}

export interface FeeSummary {
  summary: { totalInvoiced: number; totalPaid: number; totalOutstanding: number; creditBalance: number; invoicesCount: number; overdueCount: number; status: string };
  invoices: InvoiceRow[];
}

export const invoiceKeys = {
  all: ['invoices'] as const,
  list: (filters: { status: string }) => [...invoiceKeys.all, 'list', filters] as const,
  detail: (id: number) => [...invoiceKeys.all, 'detail', id] as const,
};
export const financeKeys = {
  all: ['finance'] as const,
  todayPayments: () => [...financeKeys.all, 'today-payments'] as const,
  feeSummary: (studentId?: number) => [...financeKeys.all, 'fee-summary', studentId] as const,
  dashboard: (year: number) => [...financeKeys.all, 'dashboard', year] as const,
  aging: () => [...financeKeys.all, 'aging'] as const,
};
/** Dashboards that show money figures; a payment changes them. */
export const dashboardKeys = {
  secretary: ['dashboard', 'secretary'] as const,
};

export const fetchInvoicePage = async (status: string, page: number) => {
  const res = await apiClient.get('/finance/invoices', { params: { page, pageSize: 20, status: status || undefined } });
  return { items: res.data.data as InvoiceRow[], hasNextPage: res.data.pagination.hasNextPage as boolean };
};

export const useInvoice = (id: number) =>
  useQuery({ queryKey: invoiceKeys.detail(id), queryFn: async () => (await apiClient.get(`/finance/invoices/${id}`)).data.data as InvoiceRow });

export const fetchFinanceDashboard = async (year: number) =>
  (await apiClient.get('/finance/dashboard', { params: { fromDate: `${year}-01-01`, toDate: `${year}-12-31` } })).data.data as FinanceDashboard;
export const fetchFinanceAging = async () => (await apiClient.get('/finance/reports/aging')).data.data as Aging;

export const useFinanceDashboard = (year: number) => useQuery({ queryKey: financeKeys.dashboard(year), queryFn: () => fetchFinanceDashboard(year) });
export const useFinanceAging = () => useQuery({ queryKey: financeKeys.aging(), queryFn: fetchFinanceAging });

/** Recording a payment invalidates the invoices, the finance figures and the dashboards. */
export const useRecordPayment = (onSuccess?: (data: { receipt?: { receiptNumber?: string } } | undefined) => void) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: PaymentInput) => (await apiClient.post('/finance/payments', input)).data.data as { receipt?: { receiptNumber?: string } } | undefined,
    onSuccess: (data) => {
      onSuccess?.(data);
      for (const queryKey of [invoiceKeys.all, financeKeys.all, dashboardKeys.secretary]) qc.invalidateQueries({ queryKey });
    },
  });
};

/** GET /finance/students/:studentId/summary: a student's figures + invoices (admin, secretary, and the parent of that student). */
export const useFeeSummary = (studentId?: number) =>
  useQuery({
    queryKey: financeKeys.feeSummary(studentId),
    enabled: !!studentId,
    queryFn: async () => (await apiClient.get(`/finance/students/${studentId}/summary`)).data.data as FeeSummary,
  });

export interface PaymentRow {
  id: number;
  amount: string;
  paymentDate: string;
}

/**
 * Today's payments: the latest 50 payments filtered to today's `paymentDate`.
 * ponytail: the list endpoint has no date filter, so a day with more than 50 payments under-counts; add a server filter then.
 */
export const useTodayPayments = () =>
  useQuery({
    queryKey: financeKeys.todayPayments(),
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const rows = (await apiClient.get('/finance/payments', { params: { pageSize: 50 } })).data.data as PaymentRow[];
      const mine = rows.filter((r) => r.paymentDate.slice(0, 10) === today);
      return { count: mine.length, total: mine.reduce((sum, r) => sum + Number(r.amount), 0) };
    },
  });
