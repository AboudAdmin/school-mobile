import type { Role } from '../auth/AuthContext';

/** home = a role's own dashboard (tab); screen = list/tool reached from a tab or the More hub; detail/flow = opened from `from`. */
type Kind = 'home' | 'screen' | 'detail' | 'flow';
export type HubGroup = 'People' | 'My classes' | 'Finance' | 'Academics' | 'Assessment' | 'Child' | 'School';
export const HUB_GROUPS: HubGroup[] = ['People', 'My classes', 'Finance', 'Academics', 'Assessment', 'Child', 'School'];

interface ScreenDef {
  /** Same data as the web's routePermissions (template/src/core/common/sidebar/rbac.ts). The backend's authorize() stays authoritative. */
  roles: readonly Role[];
  /** English label, doubles as the tr() key. */
  label: string;
  kind: Kind;
  /** More-hub group per role; a role without one reaches the screen through a tab or `from`. */
  hub?: Partial<Record<Role, HubGroup>>;
  /** Screens that open this detail/flow. */
  from?: readonly string[];
  /** Roles the current implementation actually serves, when narrower than `roles` (later tasks widen it). */
  serves?: readonly Role[];
}

const ALL: Role[] = ['admin', 'secretary', 'teacher', 'student', 'parent'];

// The one screen registry: who may open what, how it is reached, and its label
export const SCREEN_REGISTRY = {
  AdminDashboard: { roles: ['admin', 'secretary'], label: 'Dashboard', kind: 'home', serves: ['admin'] }, // "/index"; secretary's home is SecretaryDashboard
  TeacherDashboard: { roles: ['teacher'], label: 'Dashboard', kind: 'home' }, // "/teacher-dashboard"
  SecretaryDashboard: { roles: ['secretary'], label: 'Dashboard', kind: 'home' }, // "/secretary-dashboard"
  StudentDashboard: { roles: ['student'], label: 'Dashboard', kind: 'home' }, // "/student-dashboard"
  ParentDashboard: { roles: ['parent'], label: 'Dashboard', kind: 'home' }, // "/parent-dashboard" (placeholder until TASK-013)
  Students: { roles: ['admin', 'secretary', 'teacher'], label: 'Students', kind: 'screen', hub: { secretary: 'People', teacher: 'My classes' } }, // "/students"
  StudentDetail: { roles: ALL, label: 'Student Details', kind: 'detail', from: ['Students', 'MyChildren'], serves: ['admin', 'secretary', 'teacher', 'parent'] }, // "/students/details" (ownership enforced by the backend; own/child view comes with TASK-011/014)
  Teachers: { roles: ['admin', 'secretary'], label: 'Teachers', kind: 'screen', hub: { admin: 'People', secretary: 'People' } }, // "/teachers"
  TeacherDetail: { roles: ['admin', 'secretary'], label: 'Teacher Details', kind: 'detail', from: ['Teachers'] }, // "/teachers/details"
  Classes: { roles: ['admin', 'teacher'], label: 'Classes', kind: 'screen', hub: { admin: 'People', teacher: 'My classes' } }, // "/classes"
  Registrations: { roles: ['admin', 'secretary'], label: 'Registrations', kind: 'screen', hub: { admin: 'People' } }, // "/user-management/registration-requests"
  RegistrationDetail: { roles: ['admin', 'secretary'], label: 'Registration request', kind: 'detail', from: ['Registrations'] }, // same page (review modal)
  Finance: { roles: ['admin', 'secretary'], label: 'Finance', kind: 'screen', hub: { secretary: 'Finance' } }, // "/management/finance-dashboard"
  Invoices: { roles: ['admin', 'secretary'], label: 'Invoices', kind: 'screen', hub: { admin: 'Finance' } }, // "/management/invoices"
  InvoiceDetail: { roles: ['admin', 'secretary', 'parent'], label: 'Invoice', kind: 'detail', from: ['Invoices', 'Fees'] }, // same page (record payment)
  Attendance: { roles: ['teacher', 'admin', 'secretary'], label: 'Attendance', kind: 'screen', hub: { admin: 'Academics', secretary: 'Academics' } }, // "/hrm/student-attendance"
  AttendanceSession: { roles: ['teacher', 'admin', 'secretary'], label: 'Take attendance', kind: 'detail', from: ['Attendance', 'TeacherDashboard'] }, // backend checks the teacher owns the session
  GradeEntry: { roles: ['admin', 'teacher', 'secretary'], label: 'Enter grades', kind: 'screen', hub: { admin: 'Academics', teacher: 'Assessment' }, serves: ['admin', 'teacher'] }, // "/grade-report"; backend POST /grades: admin + teacher only (secretary is denied)
  Homework: { roles: ALL, label: 'Homework', kind: 'screen', hub: { admin: 'Academics', secretary: 'Academics' } }, // "/class-home-work" (backend scopes the list per role)
  AssignmentForm: { roles: ['admin', 'teacher', 'secretary'], label: 'New homework', kind: 'flow', from: ['Homework', 'TeacherDashboard'] }, // POST /assignments
  StudentTimetable: { roles: ['admin', 'secretary', 'teacher'], label: 'Timetable', kind: 'detail', from: ['Students'] }, // staff view of a student's timetable (TimetableScreen with `studentId`)
  StudentResults: { roles: ['admin', 'secretary', 'teacher'], label: 'Results', kind: 'detail', from: ['Students'] }, // staff view of a student's results (ResultsScreen with `studentId`)
  ChildAttendance: { roles: ['parent'], label: 'Attendance', kind: 'screen', hub: { parent: 'Child' } }, // attendance of the active child
  Timetable: { roles: ALL, label: 'Timetable', kind: 'screen', hub: { parent: 'Child' }, serves: ['student', 'parent'] }, // "/class-time-table" (other roles with TASK-011/014)
  Results: { roles: ['admin', 'teacher', 'student', 'parent'], label: 'Results', kind: 'screen', hub: { student: 'Academics', parent: 'Child' }, serves: ['student', 'parent'] }, // "/exam-result" (other roles with TASK-011/014)
  Resources: { roles: ALL, label: 'Resources', kind: 'screen', hub: { admin: 'School', secretary: 'School', teacher: 'School', student: 'Academics', parent: 'School' } }, // "/resources"
  MyChildren: { roles: ['parent', 'admin', 'secretary'], label: 'My Children', kind: 'screen', hub: { parent: 'Child' }, serves: ['parent'] }, // "/my-children" (placeholder until TASK-013)
  Fees: { roles: ['admin', 'secretary', 'parent'], label: 'Fees', kind: 'screen', serves: ['parent'] }, // "/parent/fees" (placeholder until TASK-016)
  Notices: { roles: ALL, label: 'Notices', kind: 'screen', hub: { admin: 'School', secretary: 'School', teacher: 'School', student: 'School', parent: 'School' } }, // "/notice-board"
  Messages: { roles: ALL, label: 'Messages', kind: 'screen' }, // "/application/chat" (tab for every role)
  Thread: { roles: ALL, label: 'Conversation', kind: 'detail', from: ['Messages'] }, // backend checks who may message whom
  Compose: { roles: ALL, label: 'New message', kind: 'flow', from: ['Messages'] },
} satisfies Record<string, ScreenDef>;

export type ScreenName = keyof typeof SCREEN_REGISTRY;
const NAMES = Object.keys(SCREEN_REGISTRY) as ScreenName[];
const def = (s: ScreenName): ScreenDef => SCREEN_REGISTRY[s];

export const SCREEN_LABELS = Object.fromEntries(NAMES.map((s) => [s, def(s).label])) as Record<ScreenName, string>;

/** Web permission check (also used for in-screen actions such as "New homework"). */
export const isScreenAllowed = (screen: string, role: Role): boolean =>
  (SCREEN_REGISTRY as Record<string, ScreenDef>)[screen]?.roles.includes(role) ?? false;

/** Allowed and served by the current implementation: only these are registered in the role's navigators. */
export const canOpen = (screen: ScreenName, role: Role): boolean => isScreenAllowed(screen, role) && (def(screen).serves ?? def(screen).roles).includes(role);

// Mirrors the web RoleGuard's OWN_DASHBOARD fallback
export const OWN_DASHBOARD: Record<Role, ScreenName> = {
  admin: 'AdminDashboard',
  teacher: 'TeacherDashboard',
  secretary: 'SecretaryDashboard',
  student: 'StudentDashboard',
  parent: 'ParentDashboard',
};

// 4 daily tabs per role (own dashboard first); the More hub is the 5th tab
export const ROLE_TABS: Record<Role, ScreenName[]> = {
  admin: ['AdminDashboard', 'Students', 'Finance', 'Messages'],
  secretary: ['SecretaryDashboard', 'Registrations', 'Invoices', 'Messages'],
  teacher: ['TeacherDashboard', 'Attendance', 'Homework', 'Messages'],
  student: ['StudentDashboard', 'Timetable', 'Homework', 'Messages'],
  parent: ['ParentDashboard', 'Homework', 'Fees', 'Messages'],
};

export const tabsForRole = (role: Role): ScreenName[] => ROLE_TABS[role].filter((s) => canOpen(s, role));

/** Pushed screens a role may open (everything it can open that isn't a tab). */
export const stackScreensForRole = (role: Role): ScreenName[] => NAMES.filter((s) => canOpen(s, role) && !ROLE_TABS[role].includes(s));

/** More-hub groups for a role, in HUB_GROUPS order, empty groups dropped. */
export const hubForRole = (role: Role): { group: HubGroup; screens: ScreenName[] }[] => {
  const inHub = stackScreensForRole(role).filter((s) => def(s).hub?.[role]);
  return HUB_GROUPS.map((group) => ({ group, screens: inHub.filter((s) => def(s).hub?.[role] === group) })).filter((g) => g.screens.length);
};

/**
 * Entry-point invariant (A §3): every screen a role can open is a tab (1 tap) or a hub item (2 taps),
 * and every detail/flow is opened from a screen the role can reach. Returns the violations (empty = OK).
 */
export const reachabilityProblems = (role: Role): string[] => {
  const tabs = tabsForRole(role);
  const hub = hubForRole(role).flatMap((g) => g.screens);
  const direct = new Set<string>([...tabs, ...hub]);
  const problems: string[] = [];
  if (tabs.length !== ROLE_TABS[role].length) problems.push(`${role}: a tab is not openable`);
  if (tabs[0] !== OWN_DASHBOARD[role]) problems.push(`${role}: first tab is not the own dashboard`);
  for (const s of NAMES.filter((n) => canOpen(n, role))) {
    const d = def(s);
    if (d.kind === 'detail' || d.kind === 'flow') {
      if (!d.from?.some((f) => direct.has(f))) problems.push(`${role}: ${s} has no reachable opener`);
    } else if (!direct.has(s)) problems.push(`${role}: ${s} is not a tab or hub item`);
    if (tabs.includes(s) && d.hub?.[role]) problems.push(`${role}: ${s} is both a tab and a hub item`);
  }
  return problems;
};
