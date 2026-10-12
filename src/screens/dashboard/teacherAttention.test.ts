// Run: node src/screens/dashboard/teacherAttention.test.ts   (Node ≥ 22.18 strips the types)
import assert from 'node:assert/strict';
import { focusSession, teacherAttention } from './teacherAttention.ts';

const s = (id: number, start: string, end: string, taken: boolean, present = 0, late = 0, total = 0) =>
  ({ id, startTime: `${start}:00`, endTime: `${end}:00`, room: null, attendance: { total, present, late, absent: total - present - late, taken } }) as never;
const at = (h: number, m = 0) => new Date(2026, 9, 8, h, m);

const day = [s(1, '08:00', '09:00', false), s(2, '09:00', '10:00', true, 5, 1, 10), s(3, '10:00', '11:00', false), s(4, '13:00', '14:00', false)];

// 10:30: #1 ended untaken (danger), #3 in progress untaken (warning), #2 taken at 60 % (warning); #4 is later: no rule
const rules = teacherAttention(day, at(10, 30));
assert.deepEqual(rules.map((r) => [r.kind, r.session.id]), [['missed', 1], ['low', 2], ['now', 3]]);
assert.equal(rules[1].rate, 60);
assert.equal(teacherAttention(day, at(7)).length, 1); // only the already-taken low-rate class
assert.deepEqual(teacherAttention([], at(12)), []);
assert.deepEqual(teacherAttention([s(5, '08:00', '09:00', true, 9, 1, 10)], at(12)), []); // 100 % and taken: nothing

assert.deepEqual(focusSession(day, at(10, 30)), { session: day[2], state: 'now' });
assert.deepEqual(focusSession(day, at(11, 30)), { session: day[3], state: 'next' });
assert.deepEqual(focusSession(day, at(15)), { session: day[0], state: 'missed' });
assert.equal(focusSession([s(6, '08:00', '09:00', true, 1, 0, 1)], at(15)), null);
console.log('teacherAttention: ok');
