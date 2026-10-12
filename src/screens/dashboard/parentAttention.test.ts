// Run: node src/screens/dashboard/parentAttention.test.ts
import assert from 'node:assert/strict';
import { parentAttention } from './parentAttention.ts';
import { resolveActiveChild } from '../../api/childResolve.ts';

assert.deepEqual(parentAttention({}), []); // nothing known: no rule
assert.deepEqual(parentAttention({ overdueCount: 2 }).map((r) => r.kind), ['overdue']);
assert.deepEqual(parentAttention({ attendanceRate: 60, attendanceCount: 10 }).map((r) => r.kind), ['low-attendance']);
assert.deepEqual(parentAttention({ attendanceRate: 60, attendanceCount: 0 }), []); // no sessions yet
assert.deepEqual(parentAttention({ overdueCount: 1, attendanceRate: 50, attendanceCount: 4 }).map((r) => r.kind), ['overdue', 'low-attendance']);
assert.deepEqual(parentAttention({ overdueCount: 0, attendanceRate: 95, attendanceCount: 20 }), []);

// the active child: stored id wins, a stale one falls back to the first child
const kids = [{ id: 3, classId: 1 }, { id: 7, classId: 1 }];
assert.equal(resolveActiveChild(kids, 7)?.id, 7);
assert.equal(resolveActiveChild(kids, 99)?.id, 3);
assert.equal(resolveActiveChild(kids, null)?.id, 3);
assert.equal(resolveActiveChild([], 3), null);
console.log('parentAttention + resolveActiveChild: ok');
