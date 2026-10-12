# Mobile QA checklist (manual — no Detox/Maestro)

Manual, per-role checklist mirroring the web project's "validate the rendered UI" discipline. No automated E2E
framework is used; reconsider Detox/Maestro only once there are enough screens to justify it.

## Test environments

| Platform | How it is tested | Status |
|---|---|---|
| Android — emulator | Expo Go on Android Studio AVD `Pixel_9_Pro` (API 36, Google Play image), Metro via `adb reverse tcp:8081 tcp:8081` → `exp://127.0.0.1:8081`, dev backend at the LAN IP (`EXPO_PUBLIC_API_URL` in `.env.local`) | **Used for run #1** |
| Android — physical device | Expo Go on a phone on the same Wi-Fi, scanning the `npx expo start` QR code | Not run yet (no device connected) |
| iOS | **The developer is on Windows: there is no iOS Simulator.** iOS is tested with Expo Go on a physical iPhone if one is available; otherwise through an EAS Build cloud build distributed via TestFlight. This constraint is real and is not worked around. | Not run (no iPhone, no EAS/TestFlight account configured — see TASK-027 in `school/docs/MOBILE_TASKS.md`) |

Test accounts (dev DB): admin `admin@school.com`, secretary `secretary@school.com`, teacher `rn-dev-teacher@example.com`,
student `rn-dev-reg-child1@example.com` (#68, Class 10A), parent `rn-dev-reg-parent1@example.com` (parent of #68).
Passwords are kept out of this file (local dev only).

How to re-run: tick each item, record PASS / FAIL / N/A with date, and file a fix for every FAIL. Tip for scripted
checks through `uiautomator`: inactive tabs stay in the view hierarchy, so confirm tab content from a screenshot,
not from text search alone.

## Checklist and run #1 — 2026-10-07, Android emulator (Expo Go, SDK 57)

### A. Every role

| # | Check | Admin | Secretary | Teacher | Student | Parent |
|---|---|---|---|---|---|---|
| A1 | Signed out → login screen | PASS | PASS | PASS | PASS | PASS |
| A2 | Valid credentials sign in | PASS | PASS | PASS | PASS | PASS |
| A2b | Wrong password shows the mapped error (en + ar) | PASS | not run | not run | not run | not run |
| A3 | Tab bar shows exactly the role's tabs | PASS | PASS | PASS | PASS | PASS |
| A4 | Every tab renders live data, no error / placeholder | PASS | PASS | PASS¹ | PASS | **FAIL²** |
| A5 | Forcing a screen outside the role's navigator lands on the role's own dashboard | n/a³ | PASS | PASS | PASS | PASS |
| A6 | Logout returns to login | PASS | PASS | PASS | PASS | PASS |
| A6b | After logout, a cold restart stays signed out | PASS | not run | not run | not run | not run |
| A7 | Session survives a cold restart while signed in | PASS | — | — | — | — |

¹ Run #1 first found a **crash** on the teacher's Attendance tab (`Cannot read property 'length' of undefined`): the
dashboard's `useQuery(['my-sessions'])` and the list's `useInfiniteQuery` shared one cache key. Fixed (list key is now
`['my-sessions','list']`) and re-run → PASS.
³ Admin's navigator has no screen the admin role is denied; covered by the other roles.
² Parent **Dashboard, My Children and Fees are still placeholders**: the RN plan has no Parent-screens task (see
`TASKS_REACT_NATIVE.md` §3). Notices and Messages pass. Needs a dedicated Parent task.

### B. Cross-cutting (run once, on the parent session)

| # | Check | Result |
|---|---|---|
| B1 | Theme Dark → Light applies live, no restart | PASS |
| B2 | Switching to Arabic reloads the app in RTL with translated strings | PASS |
| B3 | Back to English: LTR restored, language choice persists across restarts | PASS |
| B4 | Offline cold start (airplane mode): offline banner shown | PASS |
| B5 | Offline: previously loaded data shown from cache (Notices) | PASS |
| B6 | Back online: banner clears, navigation not reset | PASS |
| B7 | Token refresh: 3 parallel requests with an invalid access token → exactly 1 refresh, all succeed | PASS (dev kitchen sink) |

### C. Role actions (end-to-end against the dev backend)

Recorded from the end-to-end runs done on 2026-10-07 during RN-TASK-010 → 016 validation on the same emulator and build
(write actions were not repeated, to avoid duplicating financial/registration records in the dev DB).

| # | Role | Check | Result (2026-10-07) |
|---|---|---|---|
| C1 | Admin | Dashboard figures match the API (students, teachers, classes, collection rate) | PASS |
| C2 | Admin | Students → detail, Teachers → detail, Classes list, Finance overview | PASS |
| C3 | Secretary | Approve a registration request (class required) → accounts created and can log in | PASS |
| C4 | Secretary | Reject a registration request (reason required) → stored, no account | PASS |
| C5 | Secretary | Record a payment ≤ balance → receipt shown; over-balance rejected | PASS |
| C6 | Teacher | Take attendance for today's session → parent sees it (`/attendance?studentId`) | PASS |
| C7 | Teacher | Enter a grade (> 20 rejected, 0–20 saved) | PASS |
| C8 | Teacher | Create homework (empty form shows field errors) → listed "Waiting for approval" | PASS |
| C9 | Student | Timetable, homework, results, resources load; only own data | PASS |
| C10 | Student | Another student's attendance / grades / report card / profile → 403 from the backend | PASS |
| C11 | Student | Share report (PDF) → share sheet; PDF renders in the Print target | PASS |
| C12 | Parent ↔ Teacher | Message sent from the device reaches the teacher; reply appears on the device within ~5 s | PASS |
| C13 | Parent | Notices: announcements listed, expand marks as read | PASS |

### Open items from run #1

- **FAIL A4 (parent):** Parent Dashboard / My Children / Fees are not built — needs a Parent-screens task.
- Wording: "1 invoices are overdue" — the dashboard alerts don't pluralise yet (use `trn`).
- Not run: Android physical device; any iOS.

---

## Checklist v2 and run #2 — 2026-10-08, Android emulator (Expo Go, SDK 57), migrated app

Evidence comes from the TASK-001 → TASK-026 validation runs on the same emulator and dev backend (no rows were repeated for show).
Accounts as above (plus the dev admin and secretary). Rows marked **T-n** are ticketed in "Open items from run #2".

### A2. Every role (re-run)

| # | Check | Admin | Secretary | Teacher | Student | Parent |
|---|---|---|---|---|---|---|
| A1 | Signed out → login screen (brand area, no dead controls) | PASS | PASS | PASS | PASS | PASS |
| A2 | Valid credentials sign in | PASS | PASS | PASS | PASS | PASS |
| A2b | Wrong password shows the mapped error | PASS | T-1 | T-1 | T-1 | T-1 |
| A3 | Tab bar shows exactly the role's tabs (+ More hub) | PASS | PASS | PASS | PASS | PASS |
| A4 | Dashboard (DashboardScreen blocks) renders live data | PASS | PASS | PASS | PASS | PASS |
| A4b | Every other tab renders live data | T-2 | T-2 | PASS (Attendance, Homework seen) | PASS (Timetable, Homework seen) | PASS (Homework, Fees seen) |
| A5 | Entry-point invariant (`reachabilityProblems`) | PASS | PASS | PASS | PASS | PASS |
| A6 | Logout returns to login | PASS | PASS | PASS | PASS | PASS |
| A7 | Relaunch keeps the session (launch revalidation) | PASS | T-1 | T-1 | T-1 | PASS |

### M. Migration checks

| # | Check | Result |
|---|---|---|
| M1 | Roll call: StatusSegment states, unsaved count, save → toast, record visible in `GET /attendance` (admin) | PASS |
| M2 | Invoice cards, filter chips and "Clear filters" on a filtered-empty list (admin) | PASS |
| M3 | Record payment as admin and as secretary: list, detail and dashboard update without refresh; balance equals the API | PASS |
| M4 | Staff opens a student's timetable / results from Student Details (teacher) — same data as the student's own view | PASS |
| M5 | Parent child views: dashboard blocks, Attendance, Timetable, Results, Homework (read-only), Fees (empty) | PASS |
| M6 | Another student's data as a parent → 403 on report card, grades, attendance, finance summary, invoices | PASS |
| M7 | Registration request detail renders (hero + grouped details) | PASS |
| M8 | Registration approve / reject (ConfirmSheet → toast → list state) | T-3 |
| M9 | Grade form shows the error summary and the sticky Save bar | PASS |
| M10 | Create one grade / one homework / send one message | T-3 |
| M11 | Offline: banner, submit disabled with the reason; 403 toast and stay; 429 toast with Retry-After | PASS (TASK-003 run) |
| M12 | Plurals: `npm run i18n:check` passes; 0/1/2/3/11 spot-checked in en, fr, ar through i18next | PASS |
| M13 | Release bundle (`expo export`) contains no KitchenSink strings | PASS |
| M14 | Escape closes a BottomSheet through its callback | FAIL — T-4 (TASK-005, Expo Go only) |
| M15 | 2-child parent: child switcher, switching changes every block, logout clears the stored child | T-5 |
| M16 | TalkBack pass (roll call, payment, one screen per pattern) | T-6 |
| M17 | 200 % font, contrast and RTL focus order per role | T-6 (roll call at 200 % PASS; the rest not run) |

### Open items from run #2 (tickets)

- **T-1** Wrong-password and cold-restart session checks for secretary / teacher / student / parent (run once per role).
- **T-2** Every remaining tab of admin and secretary after the migration (list / tool screens); the rest were not re-opened.
- **T-3** Needs shared dev data: a pending registration request; a new grade, homework and message on the dev backend.
- **T-4** Escape on BottomSheet in Expo Go (TASK-005): check on a development / preview build; Back and backdrop pass.
- **T-5** Needs a parent with two children (ideally one with invoices).
- **T-6** Manual accessibility pass (TalkBack, 200 % font, contrast, RTL focus order) — needs a person.
- **T-7** **Android physical device: not run (none available).** Re-run sections A2 and M on a device with the TASK-027 preview APK.
- iOS: not tested (no Apple device / simulator on this machine).
