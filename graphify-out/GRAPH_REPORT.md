# Graph Report - school-mobile  (2026-10-12)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 652 nodes · 3058 edges · 24 communities (23 shown, 1 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 34 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `91ee30cd`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23

## God Nodes (most connected - your core abstractions)
1. `useTheme()` - 184 edges
2. `tr()` - 111 edges
3. `react` - 98 edges
4. `react-native` - 92 edges
5. `Icon()` - 62 edges
6. `Button()` - 54 edges
7. `Badge()` - 47 edges
8. `loc()` - 40 edges
9. `@tabler/icons-react-native` - 34 edges
10. `ErrorState()` - 33 edges

## Surprising Connections (you probably didn't know these)
- `ThemedStatusBar()` --calls--> `useTheme()`  [EXTRACTED]
  App.tsx → src/theme/ThemeProvider.tsx
- `App()` --calls--> `ParentScope()`  [EXTRACTED]
  App.tsx → src/api/children.tsx
- `App()` --calls--> `AuthProvider()`  [EXTRACTED]
  App.tsx → src/auth/AuthContext.tsx
- `App()` --calls--> `RootNavigator()`  [EXTRACTED]
  App.tsx → src/navigation/RootNavigator.tsx
- `App()` --calls--> `initLanguage()`  [EXTRACTED]
  App.tsx → src/i18n/index.ts

## Import Cycles
- None detected.

## Communities (24 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (79): expo-document-picker, expo-image-picker, react-i18next, react-native-safe-area-context, @tabler/icons-react-native, useAttendanceSession(), useSaveAttendance(), ChildSwitcher() (+71 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (57): axios, expo-secure-store, i18next, API_URL, AuthEvent, authEvents, failedQueue, listeners (+49 more)

### Community 2 - "Community 2"
Cohesion: 0.10
Nodes (40): react, react-native, Action, AppHeader(), Props, Tone, DataCard(), Props (+32 more)

### Community 3 - "Community 3"
Cohesion: 0.12
Nodes (43): @react-navigation/native, apiClient, Assignment, assignmentKeys, fetchAssignmentPage(), fetchMySessions(), fetchResourcePage(), Resource (+35 more)

### Community 4 - "Community 4"
Cohesion: 0.14
Nodes (37): ApiErrorInfo, ApiErrorKind, classifyError(), errorMessage(), listeners, useInvoice(), useRecordPayment(), useOnline() (+29 more)

### Community 5 - "Community 5"
Cohesion: 0.06
Nodes (34): dependencies, axios, expo, expo-dev-client, expo-document-picker, expo-file-system, expo-font, @expo-google-fonts/noto-sans-arabic (+26 more)

### Community 6 - "Community 6"
Cohesion: 0.14
Nodes (17): ref_node_assert, attendanceKeys, AttendanceRecord, AttendanceStatus, Session, SessionData, useMySessions(), Attention (+9 more)

### Community 7 - "Community 7"
Cohesion: 0.20
Nodes (20): @tanstack/react-query, useTodayPayments(), registrationKeys, usePendingRegistrations(), useRecentStudents(), Props, Section(), StatTile() (+12 more)

### Community 8 - "Community 8"
Cohesion: 0.09
Nodes (23): backgroundColor, foregroundImage, adaptiveIcon, package, predictiveBackGestureEnabled, versionCode, expo, android (+15 more)

### Community 9 - "Community 9"
Cohesion: 0.10
Nodes (19): main, name, private, version, expo, expo-dev-client, expo-file-system, expo-font (+11 more)

### Community 10 - "Community 10"
Cohesion: 0.16
Nodes (14): useDueAssignments(), useNewResources(), DAYS, scheduleKeys, Slot, useTimetable(), AdminFacts, dueSoonCount() (+6 more)

### Community 11 - "Community 11"
Cohesion: 0.21
Nodes (15): fetchAttendancePage(), RecentStudent, studentKeys, StudentRef, SubjectMode, SubjectStudent, useSubjectStudent(), EventRow() (+7 more)

### Community 12 - "Community 12"
Cohesion: 0.20
Nodes (14): @expo-google-fonts/noto-sans-arabic, @expo-google-fonts/roboto, darkColors, lightColors, ThemeColors, makeElevation(), radius, spacing (+6 more)

### Community 13 - "Community 13"
Cohesion: 0.16
Nodes (16): expo-localization, SearchBar(), applyDirection(), initLanguage(), isRTL(), isRTLLanguage(), isSupported(), setLanguage() (+8 more)

### Community 14 - "Community 14"
Cohesion: 0.18
Nodes (13): App(), ThemedStatusBar(), expo-network, expo-status-bar, @react-native-async-storage/async-storage, @tanstack/query-async-storage-persister, persister, persistOptions (+5 more)

### Community 15 - "Community 15"
Cohesion: 0.21
Nodes (12): Announcement, announcementKeys, useLatestAnnouncements(), useStudentAttendance(), useActiveChild(), useFeeSummary(), ScorePill(), parentAttention() (+4 more)

### Community 16 - "Community 16"
Cohesion: 0.14
Nodes (15): Aging, dashboardKeys, FeeSummary, fetchFinanceAging(), fetchFinanceDashboard(), fetchInvoicePage(), FinanceDashboard, financeKeys (+7 more)

### Community 17 - "Community 17"
Cohesion: 0.17
Nodes (10): ref_node_fs, ref_node_path, files(), LOCALES, PLURALS, problems, SRC, STRING (+2 more)

### Community 18 - "Community 18"
Cohesion: 0.27
Nodes (10): Grade, gradeKeys, ReportCard, Trimester, useReportCard(), useStudentGrades(), EXAM, ResultsScreen() (+2 more)

### Community 19 - "Community 19"
Cohesion: 0.38
Nodes (10): BarChart(), DonutChart(), Legend(), LineChart(), niceMax(), Series, short(), useAxis() (+2 more)

### Community 20 - "Community 20"
Cohesion: 0.33
Nodes (6): scripts, android, i18n:check, ios, start, web

### Community 21 - "Community 21"
Cohesion: 0.33
Nodes (5): expo/tsconfig.base, compilerOptions, strict, exclude, extends

### Community 22 - "Community 22"
Cohesion: 0.67
Nodes (3): devDependencies, @types/react, typescript

## Knowledge Gaps
- **192 isolated node(s):** `Props`, `Variant`, `Props`, `Props`, `State` (+187 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 208 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useTheme()` connect `Community 0` to `Community 1`, `Community 2`, `Community 3`, `Community 4`, `Community 6`, `Community 7`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 18`, `Community 19`?**
  _High betweenness centrality (0.131) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Community 5` to `Community 9`?**
  _High betweenness centrality (0.096) - this node is a cross-community bridge._
- **Why does `react` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 4`, `Community 6`, `Community 7`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 18`, `Community 19`, `Community 23`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._
- **What connects `Props`, `Variant`, `Props` to the rest of the system?**
  _192 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.0680166147455867 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.057511737089201875 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.09643483343074226 - nodes in this community are weakly interconnected._