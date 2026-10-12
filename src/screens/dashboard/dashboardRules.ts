// Pure "needs attention" rules per role (A §6), the Web dashboards' rules as the source. A fact that is still loading or failed is
// `undefined` and yields no rule: the screen decides what to show while a source is pending or failed.
export interface Rule {
  tone: 'danger' | 'warning';
  kind: string;
  n?: number;
  amount?: number;
  rate?: number;
  days?: number;
  /** Screen to open for this exception. */
  to?: string;
}

export interface AdminFacts {
  overdueCount?: number;
  overdueAmount?: number;
  repeatedAbsences?: number;
  attendanceRate?: number | null;
  attendanceDays?: number;
  todaySessions?: number;
  todaySessionsWithAttendance?: number;
  withoutParent?: number;
  blockedAccounts?: number;
}

export function adminAttention(f: AdminFacts): Rule[] {
  const out: Rule[] = [];
  if ((f.overdueCount ?? 0) > 0) out.push({ tone: 'danger', kind: 'overdue', n: f.overdueCount, amount: f.overdueAmount ?? 0, to: 'Finance' });
  if ((f.repeatedAbsences ?? 0) > 0) out.push({ tone: 'danger', kind: 'repeated-absences', n: f.repeatedAbsences });
  if (f.attendanceRate != null && f.attendanceRate < 85) out.push({ tone: 'warning', kind: 'low-attendance', rate: f.attendanceRate, days: f.attendanceDays });
  if ((f.todaySessions ?? 0) > 0 && (f.todaySessionsWithAttendance ?? 0) < f.todaySessions!)
    out.push({ tone: 'warning', kind: 'attendance-pending', n: f.todaySessions! - (f.todaySessionsWithAttendance ?? 0), amount: f.todaySessions });
  if ((f.withoutParent ?? 0) > 0) out.push({ tone: 'warning', kind: 'no-parent', n: f.withoutParent, to: 'Students' });
  if ((f.blockedAccounts ?? 0) > 0) out.push({ tone: 'warning', kind: 'blocked-accounts', n: f.blockedAccounts });
  return out;
}

export interface SecretaryFacts {
  pendingRegistrations?: number;
  overdueCount?: number;
  withoutParent?: number;
}

export function secretaryAttention(f: SecretaryFacts): Rule[] {
  const out: Rule[] = [];
  if ((f.pendingRegistrations ?? 0) > 0) out.push({ tone: 'warning', kind: 'pending-registrations', n: f.pendingRegistrations, to: 'Registrations' });
  if ((f.overdueCount ?? 0) > 0) out.push({ tone: 'danger', kind: 'overdue', n: f.overdueCount, to: 'Invoices' });
  if ((f.withoutParent ?? 0) > 0) out.push({ tone: 'warning', kind: 'no-parent', n: f.withoutParent, to: 'Students' });
  return out;
}

export interface StudentFacts {
  /** Published homework due within `soonDays` (and not past). */
  dueSoon?: number;
  attendanceRate?: number | null;
  attendanceCount?: number;
}

export function studentAttention(f: StudentFacts): Rule[] {
  const out: Rule[] = [];
  if ((f.dueSoon ?? 0) > 0) out.push({ tone: 'warning', kind: 'homework-soon', n: f.dueSoon, to: 'Homework' });
  if (f.attendanceRate != null && (f.attendanceCount ?? 0) > 0 && f.attendanceRate < 75) out.push({ tone: 'warning', kind: 'low-attendance', rate: f.attendanceRate });
  return out;
}

/** Published homework still to come that is due within `days` days of `now` (ISO date strings compared as days). */
export function dueSoonCount(assignments: { status: string; dueDate: string }[], now: Date, days = 2): number {
  const start = new Date(now.toISOString().slice(0, 10)).getTime();
  return assignments.filter((a) => {
    const d = (new Date(a.dueDate.slice(0, 10)).getTime() - start) / 86400000;
    return a.status === 'approved' && d >= 0 && d <= days;
  }).length;
}
