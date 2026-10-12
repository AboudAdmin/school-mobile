import type { Session } from '../../api/attendance';

export interface AttentionRule {
  tone: 'danger' | 'warning';
  kind: 'missed' | 'now' | 'low';
  session: Session;
  /** Present + late share, in %, for `low`. */
  rate?: number;
}

const hm = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
const LOW_RATE = 75;

/** Today's exceptions a teacher should act on, most urgent first. Pure: `now` is passed in. */
export function teacherAttention(sessions: Session[], now: Date): AttentionRule[] {
  const t = hm(now);
  const out: AttentionRule[] = [];
  for (const s of sessions) {
    if (!s.attendance.taken) {
      if (s.endTime.slice(0, 5) <= t) out.push({ tone: 'danger', kind: 'missed', session: s });
      else if (s.startTime.slice(0, 5) <= t) out.push({ tone: 'warning', kind: 'now', session: s });
    } else if (s.attendance.total > 0) {
      const rate = Math.round(((s.attendance.present + s.attendance.late) / s.attendance.total) * 100);
      if (rate < LOW_RATE) out.push({ tone: 'warning', kind: 'low', session: s, rate });
    }
  }
  return out.sort((a, b) => Number(b.tone === 'danger') - Number(a.tone === 'danger'));
}

/** The session the "Today" hero shows: the one in progress, else the next one, else the earliest still without attendance. */
export function focusSession(sessions: Session[], now: Date): { session: Session; state: 'now' | 'next' | 'missed' } | null {
  const t = hm(now);
  const byStart = [...sessions].sort((a, b) => a.startTime.localeCompare(b.startTime));
  const current = byStart.find((s) => s.startTime.slice(0, 5) <= t && t < s.endTime.slice(0, 5));
  if (current) return { session: current, state: 'now' };
  const next = byStart.find((s) => s.startTime.slice(0, 5) > t);
  if (next) return { session: next, state: 'next' };
  const missed = byStart.find((s) => !s.attendance.taken);
  return missed ? { session: missed, state: 'missed' } : null;
}
