export interface ParentFacts {
  overdueCount?: number;
  outstanding?: number;
  /** Present + late share of the child's recorded sessions, in %; undefined while unknown. */
  attendanceRate?: number | null;
  attendanceCount?: number;
}
export interface ParentRule {
  tone: 'danger' | 'warning';
  kind: 'overdue' | 'low-attendance';
  value: number;
}

const LOW_RATE = 75;

/** What a parent should look at for the active child. Pure; sources still loading or failed are simply absent (undefined). */
export function parentAttention(f: ParentFacts): ParentRule[] {
  const out: ParentRule[] = [];
  if ((f.overdueCount ?? 0) > 0) out.push({ tone: 'danger', kind: 'overdue', value: f.overdueCount! });
  if (f.attendanceRate != null && (f.attendanceCount ?? 0) > 0 && f.attendanceRate < LOW_RATE) out.push({ tone: 'warning', kind: 'low-attendance', value: f.attendanceRate });
  return out;
}
