# Mobile App Inventory (analysis only)

Date: 2026-10-09. Scope: `school-mobile` as it is on disk now. No code, task or design was changed.
Sources: `src/navigation/{rbac,screens}.ts` (the screen registry), `src/api/*`, the screens, `docs/QA_CHECKLIST.md`, and `../school/docs/MOBILE_TASKS.md` (previous findings, reused rather than re-derived). The backend was only consulted to list what exists.

## 0. How to read this

**Status legend**

| Code | Meaning |
|---|---|
| **V** | Implemented and verified: the core flow ran on the emulator against the dev backend, with evidence recorded. Remaining gaps are listed in "Missing work". |
| **IU** | Implemented, not fully verified: code is complete and wired to the API, but a core flow or state was never run, or was only run before a later restyle. |
| **P** | Partially implemented: a feature that the task or the Web dashboard calls for is known to be missing. |
| **UI-only** | A screen or button exists but is not connected. **None found.** |
| **NI** | Not implemented. |
| **B** | Blocked by a dependency or an open decision. |

**Evidence kinds** used in the tables: `QA#` = `docs/QA_CHECKLIST.md` row; `T-nnn` = note in `MOBILE_TASKS.md`; `code` = read from source this session; `det` = deterministic check (tsc, unit test, i18n script).

**Confirmed this session (facts):**

- `npx tsc --noEmit` passes. `npm run i18n:check` passes (257 `tr()` keys, 13 `trn()` keys, ar/fr/en).
- The three rule tests (`teacherAttention`, `parentAttention`, `dashboardRules`) ran with no assertion error. Node printed only its type-stripping warning.
- All 32 registry screens map to a real component in `screens.ts`. `PlaceholderScreen` is only the fallback and no registry entry uses it.
- No mobile code calls `/auth/me`, `/auth/change-password` or `/notifications*`, although the backend now has them.
- Runtime results below are copied from the earlier task notes and QA runs. **They were not re-run here.**

**Not re-run here:** every emulator or device behaviour. Rows marked V or IU rest on those recorded runs.

## 1. Overall summary

- **App shape:** Expo SDK 57, React Navigation 7. One bottom-tab navigator per role (4 role tabs plus a **More** hub). The registry in `rbac.ts` is the single source for the tabs, the hub, `canOpen` and the reachability invariant.
- **Screens:** 34 distinct screens: 32 registry screens, the More hub, and Login. A KitchenSink dev screen exists but is excluded from release bundles (TASK-025).
- **Role reach (screens a role can open, including the More hub):** admin 24, secretary 21, teacher 16, student 9, parent 14.
- **Nature of the app:** an operations and read app. It covers dashboards, attendance roll call, payments, registration review, one-grade entry, homework create, messaging, notices and read views for timetable, results, fees and children. All Phase 6 "parity" modules are NI.
- **Open tasks:** 50 of 81. Four are in Phases 1–4 (005, 010, 027, 030). All 46 Phase 6 tasks (036–081) are open and gated by TASK-036, the owner's scope decision. Phase 5 backend tasks 031–035 are done.

### Counts (screen level, n = 34)

| Status | Count | Screens |
|---|---|---|
| **V** implemented and verified | **19** | More hub, Students, StudentDetail, Teachers, Classes, Registrations, Invoices, InvoiceDetail, Attendance (sessions), AttendanceSession, Homework, Timetable, StudentTimetable, Results, StudentResults, ChildAttendance, MyChildren, Notices, Messages |
| **IU** implemented, not fully verified | **13** | Login, AdminDashboard, StudentDashboard, ParentDashboard, TeacherDetail, RegistrationDetail, Finance, GradeEntry, AssignmentForm, Resources, Fees, Thread, Compose |
| **P** partially implemented | **2** | TeacherDashboard (no "pending grading"), SecretaryDashboard (no "pending onboardings") |
| UI-only / placeholder | 0 | |
| Blocked screens | 0 | (Features are blocked; see §8.) |

Counting caveat: StudentTimetable and StudentResults reuse the Timetable and Results components and are counted as separate registry screens. Counting components instead gives 32 screens and the same V/IU split minus two V.

### Counts (task level, from the tracker)

| | Count |
|---|---|
| Done `[x]` | 31 (001–004, 006–009, 011–026, 028, 029, 031–035) |
| Open `[ ]` | 50 = 005, 010, 027, 030, and 036–081 |
| Done but carrying "NOT runtime-verified" notes | 013, 016, 017, 018, 019, 020, 021, 022, 026, 028, 029 |

## 2. Admin (24 screens)

Tabs: Dashboard · Students · Finance · Messages · **More**. Hub: People (Teachers, Classes, Registrations), Finance (Invoices), Academics (Attendance, Enter grades, Homework), School (Resources, Notices).

| Page/Screen | Features | Implementation Status | API Integration | RBAC | Validation Evidence | Missing Work |
|---|---|---|---|---|---|---|
| Dashboard (tab) | People / Attendance / Finance sections, Today (pending approvals, today's payments), AttentionStrip from `adminAttention`, labelled attendance chart plus text figures | **IU** | `/reports/overview`, `/finance/dashboard`, `/finance/reports/aging`, `/registration-requests?status=pending`, `/finance/payments` | Registry `roles: admin, secretary`, `serves: admin`. Backend: `/reports/overview` allows admin and secretary | det: `dashboardRules.test.ts`. Emulator: figures match the API (T-017/018). QA C1 PASS | Side-by-side check with the Web is not done. Forced block failure is not run. "Today's payments" counts only the latest 50 payments (known ceiling) |
| Students (tab) | Paged list, search, status chips, Clear filters, open detail | **V** | `GET /students` | admin/secretary/teacher; backend authoritative | QA C2 PASS; T-019 | Page 2 not scrolled (dev DB too small). No create, edit, delete or promotion (TASK-041/042) |
| Student detail | Hero, grouped details, Timetable and Results buttons | **V** | `GET /students/:id` | `StudentDetail` roles ALL, served to admin/secretary/teacher/parent | QA C2; T-011, T-020 | Read-only. No photo, parent link, status change (TASK-041/044) |
| Finance (tab) | Overview `StatTile`s over `Section plain` | **IU** | `/finance/dashboard`, `/finance/reports/aging` (via `api/finance.ts`) | admin/secretary | QA C2 "Finance overview" PASS (run #1, before the restyle). T-019: restyled overview not runtime-checked | Overview only. No reports, configuration, plans, receipts (TASK-056–064) |
| Invoices (hub) | `DataCard` list with paid progress, status chips, "Record payment" footer | **V** | `GET /finance/invoices` | admin/secretary | T-008: emulator figures equal the API | No generation, cancel, delete, PDF, allocations (TASK-057–059) |
| Invoice detail and record payment | `DetailHero` balance, grouped values, payment sheet → ConfirmSheet → Toast | **V** | `GET /finance/invoices/:id`, `POST /finance/payments` | admin/secretary write; parent read | T-009: admin payment updated detail, list and dashboard with no manual refresh. Teacher gets 403 | A server-side failure of a valid payment was not exercised. Web invoice page not opened |
| Registrations (hub) | `DataCard` list, status filter, Clear filters | **V** | `GET /registration-requests` | admin/secretary | T-019 emulator | Applicant photo (TASK-046) |
| Registration detail | Hero, grouped parent/child, Approve → ConfirmSheet, Reject with reason sheet → ConfirmSheet, Toast, invalidation | **IU** | `GET /registration-requests/:id`, `/classes`, `POST …/approve`, `POST …/reject` | admin/secretary | Approve and reject PASSED on 2026-10-07 (QA C3/C4), before the TASK-020 restyle. After it only render was checked | The post-restyle approve and reject sheets have not run (T-3: needs a pending request) |
| Teachers (hub) | Paged list, search, detail | **V** | `GET /teachers` | admin/secretary | QA C2 | No create, edit, documents (TASK-043) |
| Teacher detail | Hero and grouped details | **IU** | `GET /teachers/:id` | admin/secretary | T-020: not runtime-verified | Read-only |
| Classes (hub) | Paged list, search | **V** | `GET /classes` | admin/teacher | QA C2 | Read-only. No class structure (TASK-049) |
| Attendance (hub) | Sessions list (`EventRow`) | **V** | `GET /attendance/my-sessions` | admin/secretary/teacher | T-007 | Dev data confirms admin sees sessions |
| Take attendance | Summary, Mark all present, `StatusSegment`, sticky unsaved count, Toast | **V** | `GET /attendance/schedule/:id`, `POST …/bulk` | admin/secretary/teacher; backend checks session ownership for teachers | T-007: saved, then `GET /attendance` shows 6 records | A failed save keeps edits (code only). No haptics (D8) |
| Enter grades (hub) | One grade: student, subject, trimester, exam type, status, score | **IU** | `POST /grades` (+ lookup lists) | Registry `serves: admin, teacher`. Backend: admin and teacher only; TASK-033 now scopes teachers to their own class/subject | QA C7 PASS (2026-10-07, old UI). After the restyle only the error summary and sticky bar were seen | Post-restyle save not run (T-3). No bulk gradebook, edit/delete, statuses (TASK-053) |
| Homework (hub) | List via `TaskRow`; "New homework" in staff mode | **V** | `GET /assignments` | All roles; backend scopes per role | T-012: student and teacher views equal the API | Admin and secretary views not exercised. No approval queue, attachments, submissions (TASK-065–068) |
| New homework (flow) | Form, sticky submit, Toast | **IU** | `POST /assignments` (+ classes/subjects) | Registry allows admin/teacher/secretary. The backend role for secretary `POST /assignments` was **not verified** | QA C8 PASS (old UI). T-022: new form not opened | Post-restyle submit not run (T-3) |
| Resources (hub) | Searchable list, opens link | **IU** | `GET /resources` | All roles | T-012: empty list only | Never seen with items. Read-only. No create/delete (TASK-069) |
| Notices (hub) | Searchable feed, mark read on expand, acknowledge | **V** | `GET /announcements`, `POST /announcements/:id/read`, `POST …/ack` | All roles | QA C13 PASS (read). Acknowledge not recorded | No authoring, approval, pin (TASK-075) |
| Messages (tab) | Conversation list, polling, FAB "New message" | **V** | `GET /messages/conversations` | All roles | QA C12 PASS | FAB not runtime-checked after the restyle (T-019). Broadcasts NI (TASK-076) |
| Conversation / Compose | Thread with polling and mark-read; recipient search and send | **IU** | `GET /messages/conversations/:id`, `PATCH …/read`, `GET /messages/recipients`, `POST /messages/send` | All roles; backend decides who may message whom | QA C12 PASS before the restyle. T-022: Thread/Compose not opened after | Post-restyle send not run (T-3) |
| More hub | School card (`/school/settings`), search, groups | **V** | `GET /school/settings` | Built from `hubForRole` | T-001, T-002 per role | |

## 3. Secretary (21 screens)

Tabs: Dashboard · Registrations · Invoices · Messages · **More**. Hub: People (Students, Teachers), Finance (Finance), Academics (Attendance, Homework), School (Resources, Notices).
Screens are shared with admin (§2) unless listed. Differences only:

| Page/Screen | Features | Implementation Status | API Integration | RBAC | Validation Evidence | Missing Work |
|---|---|---|---|---|---|---|
| Dashboard (tab) | Front office / Finance / Students; Today's payments; User accounts (active/suspended/inactive); Recent enrollments; `secretaryAttention` | **P** | `/secretary/dashboard`, `/reports/overview`, `/finance/payments`, `/students` | Own dashboard; `/reports/overview` allows secretary | det: `dashboardRules.test.ts`. Emulator: collected 12,221.00, today's payments, user accounts 35/0/0 (T-017/018) | **"Pending onboardings" not built** (no list endpoint). "Recent enrollments" never rendered with data. Web comparison not done |
| Registrations / Invoices / Messages (tabs) | As admin | **V** | As admin | secretary | T-008 (Invoices tab), QA C3/C4/C5 | Record payment as secretary verified (T-009, receipt RCP-2026-000008) |
| Finance (hub) | As admin | **IU** | As admin | secretary | As admin | As admin |
| Students, StudentDetail, StudentTimetable, StudentResults | As admin; staff views of a student | **V** (list/detail) | As admin | secretary is served | T-001 opened Teachers/Students from the hub | **Secretary staff path (Timetable/Results from a student) not exercised** (T-011) |
| Enter grades | **Not served to secretary** | Absent by design | — | Registry `serves` excludes secretary; backend denies | det: `canOpen` | none |

## 4. Teacher (16 screens)

Tabs: Dashboard · Attendance · Homework · Messages · **More**. Hub: My classes (Students, Classes), Assessment (Enter grades), School (Resources, Notices).

| Page/Screen | Features | Implementation Status | API Integration | RBAC | Validation Evidence | Missing Work |
|---|---|---|---|---|---|---|
| Dashboard (tab) | Attention (`teacherAttention`), Today card with primary "Take attendance", My classes tiles, shortcuts, per-block error and Retry | **P** | `GET /attendance/my-sessions` only | Own dashboard | det: `teacherAttention.test.ts` (rules and `focusSession`). Emulator: dashboard renders (T-006) | "Pending grading" not built (needs a backend grading endpoint). **"Take attendance" tap and per-block failure never run** (no session on the test day). "Assignments pending approval" NI (TASK-065) |
| Attendance (tab) → Take attendance | Sessions list → roll call | **V** | As admin | Backend checks the teacher owns the session | QA C6 PASS; T-007; run #2 re-check PASS | |
| Homework (tab), New homework | List with `TaskRow`; create with sticky submit | **V** list, **IU** form | `GET/POST /assignments` | `canCreate` only in staff mode and when `AssignmentForm` is allowed | T-012 (dev teacher sees the pending homework). QA C8 | Form after restyle not run |
| Messages (tab), Thread, Compose | As admin | **V** / **IU** | As admin | All roles | QA C12 (teacher ↔ parent, ~5 s) | |
| Students (hub), StudentDetail, StudentTimetable, StudentResults | List, detail, student's timetable and results | **V** | `/students`, `/schedules?classId`, `/grades/report-card/:id`, `/grades?studentId` | teacher served | T-011: teacher sees the same data as the student | |
| Classes (hub) | Read-only list | **V** | `GET /classes` | admin/teacher | | |
| Enter grades (hub) | As admin | **IU** | `POST /grades` | Backend: teacher scoped to own class/subject (TASK-033) | QA C7 | Post-restyle save not run. Teacher HTTP 403 for an out-of-scope class not exercised through the app |
| Resources, Notices | As admin | IU / V | As admin | | | |

## 5. Student (9 screens)

Tabs: Dashboard · Timetable · Homework · Messages · **More**. Hub: Academics (Results, Resources), School (Notices).

| Page/Screen | Features | Implementation Status | API Integration | RBAC | Validation Evidence | Missing Work |
|---|---|---|---|---|---|---|
| Dashboard (tab) | Today / Attendance / Homework / "Updates" (next due, new resources, announcements to acknowledge); `studentAttention` | **IU** | `/students/profile` (via `api/students.ts` only), attendance, `/assignments`, `/resources`, `/announcements` | Own dashboard | det: `dashboardRules.test.ts`. Emulator: 50 % over 2 sessions (T-017) | "Updates" tiles never rendered with data. Web comparison not done. "Upcoming exams" and "earned badges" NI (TASK-052/071) |
| Timetable (tab) | `EventRow` week slots | **V** | `GET /schedules?classId` | self mode | T-011: 13 slots equal the API | Read-only |
| Homework (tab) | `TaskRow`, due emphasis, status, no write action | **V** | `GET /assignments` | Backend scopes per student | T-012 | Attachments, submission, late status NI (TASK-066/067) |
| Results (hub) | `ScorePill` marks, trimester chips, report-card PDF share | **V** | `GET /grades?studentId`, `/grades/report-card/:id` | Another student's id → 403 (QA C10) | T-011; QA C11 PDF share PASS (run #1) | Report card v2 (T1–T3, domains, coefficients) NI (TASK-054). PDF share not re-run after the restyle |
| Resources (hub) | Searchable list, opens link | **IU** | `GET /resources` | Backend scopes | Empty list only | Never seen with items |
| Notices, Messages, Thread, Compose | As §2 | V / V / IU / IU | As §2 | | | |

## 6. Parent (14 screens)

Tabs: Dashboard · Homework · Fees · Messages · **More**. Hub: Child (Attendance, Timetable, Results, My Children), School (Resources, Notices). Header carries the `ChildSwitcher` (hidden with fewer than 2 children).

| Page/Screen | Features | Implementation Status | API Integration | RBAC | Validation Evidence | Missing Work |
|---|---|---|---|---|---|---|
| Dashboard (tab) | Attention (`parentAttention`), per-child Attendance · Homework · Results · Fees, pending invoices, latest announcements, `ViewingBar` | **IU** | `/parents/children`, attendance, assignments, grades, `/finance/students/:id/summary`, `/announcements` | `ActiveChildProvider` (parent only); persisted active child | det: `parentAttention.test.ts` (stale child → first child). Emulator with a **1-child** parent matches the child's own data | **No 2-child parent exists in the dev DB**: switcher, switching, stored-child clearing on logout and stale-child fallback on a live session are unverified. Web comparison not done. Announcements list never seen with items |
| Homework (tab) | Child's homework, read-only | **V** (1 child) | `GET /assignments?studentId=` | Backend ownership check (T-015) | T-015: equals the student's own view | Multi-child switch unverified |
| Fees (tab) | `DetailHero` outstanding balance and progress, invoices as `DataCard`, read-only invoice detail, no payment | **IU** | `GET /finance/students/:id/summary`; opens `InvoiceDetail` | Own child 200, other 403 (T-016) | Emulator: child with no invoices → hero 0.00 DT and "No invoices yet" | **Invoice cards and read-only detail never seen with real invoices.** Parent opening their own child's `/finance/invoices/:id` not verified. Statement and monthly breakdown NI (TASK-056). Receipts NI (TASK-060) |
| Attendance (hub) | Child attendance list | **V** (1 child) | `GET /attendance?studentId=` | Another child → 403 (T-014) | T-014: equals the student's view | |
| Timetable, Results (hub) | As §5, child mode, no write actions | **V** (1 child) | As §5 | 403 verified for another student's id | T-014 | |
| My Children (hub) | Child list, opens StudentDetail | **V** (1 child) | `GET /parents/children`, `GET /students/:id` | parent served | T-013 | |
| Resources, Notices, Messages, Thread, Compose | As §2 / §5 | | | | QA C13, C12 | Parent feedback to admin NI (TASK-077) |

## 7. Shared screens, components and capabilities

**Shared screens (all roles):** Login, More hub, Messages, Thread, Compose, Notices, Resources, Homework, plus the Account sheet (language, theme, logout).

**Shared infrastructure:**

| Area | What exists | Evidence |
|---|---|---|
| Navigation and RBAC | One registry (`rbac.ts`) drives tabs, hub, `canOpen`, `reachabilityProblems()`. `onUnhandledAction` redirects a forbidden route to the role's own dashboard | T-001 per role. `reachabilityProblems()` empty for all five roles (det) |
| Auth and session | SecureStore tokens, single-flight refresh, launch revalidation via refresh (interim; `/auth/me` unused), role-change pickup, cache cleared on role change | T-021 (active, wrong password, relaunch verified). Suspended, inactive and 429 not verified (code unchanged) |
| Data and error layer | Per-domain `api/*` modules with key factories; `GlobalErrorHandler` (403 toast, 429 with Retry-After, 5xx, network); offline banner and disabled mutations; persisted query cache; focus ↔ AppState | T-003: 403, 429 and airplane mode verified. 5xx and foreground refetch not exercised |
| UI kit (`components/ui`, 48 files) | `Section`, `StatTile`, `DataCard`, `DetailHero`, `EventRow`, `TaskRow`, `ScorePill`, `StatusSegment`, `AttentionStrip`, `ActionBar`, `Form`/`useForm`/`ErrorSummary`, `RecordList`, `BottomSheet`, `ConfirmSheet`, `Toast`, `FAB`, `Num`, `Skeleton`, `ViewingBar`, `ChildSwitcher`, `AppHeader`, `DashboardScreen`, charts | T-004 KitchenSink in ar/en × light/dark |
| Unused in production screens | `ActionSheet`, `FileField`, `MultiSelect`, `RadioGroup`, `SegmentedControl`, `SwitchRow`, `TimeField`, `TopTabs` (KitchenSink only, built for Phase 6 forms) | T-026 |
| i18n and layout | ar/fr/en, RTL reload, plurals via `trn`, light/dark, `i18n:check` script | T-023/024. 200 % font checked only on roll call |
| Files and links | `sharePdf` (expo-print + sharing) used only by Results. `Linking.openURL` for resources | QA C11 |
| Installed but unused | `expo-document-picker`, `expo-image-picker`, `expo-file-system` (only behind `FileField`); no `expo-notifications`, no `expo-haptics` | `package.json`, grep |
| Deep-link scheme | `khaledbenwalid` is declared in `app.json`. **No linking config** exists | code |
| Automated checks | tsc, `i18n:check`, three rule unit tests. No E2E framework (manual QA checklist by design) | det |

## 8. Backend capability vs. mobile use

**Used by the app (confirmed in `src/`):**
`/auth/login`, `/auth/logout`, refresh (through the axios interceptor) · `/students` (list, `:id`, `profile`) · `/teachers` (list, `:id`) · `/classes` · `/schedules?classId` · `/attendance` (list, `my-sessions`, `schedule/:id`, `schedule/:id/bulk`) · `/grades` (list, `report-card/:id`, `POST`) · `/assignments` (list, `POST`) · `/resources` (list) · `/announcements` (list, `:id/read`, `:id/ack`) · `/messages` (conversations, thread, read, recipients, send) · `/registration-requests` (list, `:id`, approve, reject, pending count) · `/finance` (invoices list and `:id`, `POST payments`, `GET payments`, `dashboard`, `reports/aging`, `students/:id/summary`) · `/reports/overview` · `/secretary/dashboard` · `/parents/children` · `/school/settings`.

**Exists in the backend, not used by mobile:**

| Group | Examples |
|---|---|
| Whole route files | `exams`, `behavior`, `gamification`, `forums`, `calendar`, `analytics`, `onboarding`, `parent-feedback`, `domains`, `grade-levels`, `subjects`, `secretaries`, `notifications` |
| Write and admin operations inside used modules | student/teacher/class create, update, delete; schedule create, update, delete; attendance edit; grade edit and delete; announcement authoring, approve, pin; resource create and delete; message broadcasts; invoice generation, cancel, PDF; payment allocations; receipts; fee plans; registration photo (`/:id/photo`) |
| Newly added for mobile (Phase 5, unused so far) | `GET /auth/me`, `POST /auth/change-password`, `POST/DELETE /notifications/push-tokens`, per-session refresh tokens (these last are used transparently) |
| Also unused | `/reports/student`, `/reports/class`, `/secretary/{students,parents,users,fees/overdue}` |

**Endpoint gaps:** the tracker records that no list endpoint exists for secretary "pending onboardings", no grading endpoint for teacher "pending grading", and no `holiday*`/`syllabus*` route file (TASK-036 partial finding).

## 9. Not implemented (Phase 6, all gated by TASK-036)

| Group | Tasks | Capabilities missing |
|---|---|---|
| Platform | 037–040 | Stepper shell, deep links and header bell, notifications centre, push in-app (the backend half is done) |
| People | 041–046 | Student/teacher/parent/user CRUD, promotion, documents, registration photo |
| Academics | 047–055 | Staff timetable views and slot editor, academic structure, syllabus, exams and results, bulk gradebook, report card v2 and PDF, academic reports |
| Finance | 056–064 | Statement, invoice generation, full invoice and PDF, allocations, receipts, fee plans, onboarding wizard, configuration, finance reports |
| Homework and resources | 065–069 | Approval queue, attachments, submission, grading, resources management |
| Engagement | 070–077 | Behaviour, badges, forums, calendar, file manager, announcement authoring, broadcasts, parent feedback |
| Account | 078–081 | Profile and photo, change password (UI), school settings and logo, performance pass |

## 10. Known blockers and dependencies

| # | Item | Effect |
|---|---|---|
| 1 | **TASK-036 scope decision is the owner's and is not made** | Blocks 037–081 |
| 2 | **TASK-027 EAS** is not logged in and the project has no EAS `projectId` | No dev, preview or production build, and no physical device. Blocks 030 and the device-only checks (T-7, push, performance) |
| 3 | **TASK-030 store submission** | Depends on 027, a physical-device QA run and the owner inputs for the store listing (privacy URL, legal name, review accounts, screenshots) |
| 4 | **TASK-010 pilot gate** is open | Needs a manual TalkBack pass, a full ar/fr/en × light/dark × 200 % review and the owner sign-off (D7, D8). Phase 3 work started without it by instruction |
| 5 | **TASK-005** Escape on `BottomSheet` | Reproduced on Expo Go, `onClose` does not run. No fix was chosen. Needs a decision, and a retest on a dev or preview build |
| 6 | **No 2-child parent and no parent with invoices in the dev DB** | Blocks verification of T-013/016 (switcher, switching, logout clearing, fees cards) |
| 7 | No pending registration request in the dev DB (approve and reject need shared data) | Post-restyle approve and reject unverified (T-3) |
| 8 | **Git baseline:** `src/`, `docs/`, `eas.json`, `scripts/` and `CLAUDE.md` are **untracked** in `school-mobile` (only an "Initial commit" exists). The tracker's "owner commits the baseline" prerequisite is not done | Risk of loss. No history for any mobile change |
| 9 | Manual accessibility pass (TalkBack, contrast, RTL focus order per role) | Needs a person; only roll call at 200 % font was checked |
| 10 | iOS is untested (Windows host, no iPhone, no EAS) | |

## 11. Confirmed facts vs. items needing verification

**Confirmed (code or deterministic check this session):**

- 32 of 32 registry screens are real, and none are placeholders.
- Per-role reach counts, the tabs and the hub groups in §2–§6 are exactly what `rbac.ts` produces.
- tsc, `i18n:check` and the three rule tests are clean.
- The mobile endpoint list in §8 is complete for `src/` (grep).
- No unconnected buttons were found. Every action in the screens maps to an `apiClient` call or to navigation.

**Needs further verification (cannot be confirmed from code alone):**

1. Multi-child parent: switcher, switching data, logout clearing, stale child, fees figures. (013, 016)
2. Parent fees with real invoices, and a parent opening their own child's invoice.
3. Post-restyle write flows: approve/reject registration, create grade, create homework, send message. (QA T-3; the same flows passed before the restyle on 2026-10-07.)
4. Teacher dashboard "Take attendance" deep path and per-block failure on all five dashboards.
5. Secretary "Recent enrollments", student "Updates" tiles, parent announcements with real items; Resources with items.
6. Suspended, inactive and 429 login messages, and 401-at-launch.
7. Secretary's `POST /assignments` backend permission, which the registry allows. The secretary staff path to student Timetable/Results.
8. Page 2 of any paged list.
9. 5xx toast and foreground refetch.
10. Every widget against the Web for the same account (017, 018, 019).
11. TalkBack, 200 % font, contrast, RTL focus order (026, 028); physical device (028).
12. Whether the "done" marks on 026 and 028 should stay `[x]` while their own notes say a criterion is not done. This is a tracker-hygiene question and was not changed.

## 12. Documentation notes found while inventorying (not changed)

- `rbac.ts` has stale comments ("placeholder until TASK-013/016") on `ParentDashboard`, `MyChildren` and `Fees`. The screens are built.
- `mobile/CLAUDE.md` references `docs/MOBILE_*.md`, but `MOBILE_ANALYSIS`, `MOBILE_ARCHITECTURE`, `MOBILE_UX_AUDIT` and `MOBILE_TASKS` live in `../school/docs/`. `school-mobile/docs/` holds only `QA_CHECKLIST.md`, `STORE_LISTING.md` and this file.
- The `MOBILE_TASKS.md` "already built" list includes `FileField`, which no production screen uses.

## 13. Evidence index

| Topic | Where |
|---|---|
| Registry, tabs, hub, RBAC, reachability | `src/navigation/rbac.ts`, `screens.ts`, `roleNavigators/RoleNavigator.tsx` |
| API modules | `src/api/*.ts`; direct calls in `src/screens/**` |
| Task statuses and runtime notes | `../school/docs/MOBILE_TASKS.md` (TASK-001…035) |
| Run #1 and run #2 results, open tickets T-1…T-7 | `docs/QA_CHECKLIST.md` |
| Rule tests | `src/screens/dashboard/*.test.ts` |
| i18n check | `scripts/i18n-check.mjs`, `npm run i18n:check` |
| Store pack | `docs/STORE_LISTING.md` |
