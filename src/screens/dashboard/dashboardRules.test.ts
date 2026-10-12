// Run: node src/screens/dashboard/dashboardRules.test.ts
import assert from 'node:assert/strict';
import { adminAttention, dueSoonCount, secretaryAttention, studentAttention } from './dashboardRules.ts';

const kinds = (r: { kind: string }[]) => r.map((x) => x.kind);

// admin: nothing known → nothing; each fact maps to its rule, most urgent first by construction
assert.deepEqual(adminAttention({}), []);
assert.deepEqual(kinds(adminAttention({ overdueCount: 2, overdueAmount: 100, repeatedAbsences: 1, attendanceRate: 80, attendanceDays: 30, todaySessions: 3, todaySessionsWithAttendance: 1, withoutParent: 6, blockedAccounts: 1 })), ['overdue', 'repeated-absences', 'low-attendance', 'attendance-pending', 'no-parent', 'blocked-accounts']);
assert.equal(adminAttention({ attendanceRate: 85 }).length, 0); // threshold is strictly below 85
assert.equal(adminAttention({ attendanceRate: null }).length, 0); // no attendance recorded
assert.equal(adminAttention({ todaySessions: 2, todaySessionsWithAttendance: 2 }).length, 0);
assert.equal(adminAttention({ todaySessions: 3, todaySessionsWithAttendance: 1 })[0].n, 2);

// secretary
assert.deepEqual(secretaryAttention({}), []);
assert.deepEqual(kinds(secretaryAttention({ pendingRegistrations: 1, overdueCount: 1, withoutParent: 1 })), ['pending-registrations', 'overdue', 'no-parent']);
assert.deepEqual(secretaryAttention({ pendingRegistrations: 0, overdueCount: 0 }), []);

// student
assert.deepEqual(studentAttention({}), []);
assert.deepEqual(kinds(studentAttention({ dueSoon: 2, attendanceRate: 60, attendanceCount: 8 })), ['homework-soon', 'low-attendance']);
assert.deepEqual(studentAttention({ attendanceRate: 60, attendanceCount: 0 }), []);

// due soon: today and +2 days count, yesterday / +3 days / unpublished do not
const now = new Date('2026-10-08T10:00:00Z');
const a = (dueDate: string, status = 'approved') => ({ dueDate, status });
assert.equal(dueSoonCount([a('2026-10-08'), a('2026-10-10'), a('2026-10-07'), a('2026-10-11'), a('2026-10-09', 'draft')], now), 2);
console.log('dashboardRules: ok');
