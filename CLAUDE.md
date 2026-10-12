# School Mobile

React Native + Expo mobile app for the existing School Management System.

Web/backend: `../school` — read-only during Mobile tasks.

## Architecture

* Expo SDK 57 / React Native 0.86 / React 19 / TypeScript strict.
* React Navigation 7 is mandatory. Never introduce Expo Router.
* TanStack Query, Axios, SecureStore, AuthContext, RBAC, i18n, Theme/UI Kit are existing infrastructure.
* Reuse existing architecture before creating new patterns.
* Backend authorization is authoritative.
* New dependencies require a concrete task-level reason.

## Project rules

* Work only on the requested task(s), in dependency order.
* Never start later tasks automatically.
* Inspect only the minimum relevant files and sections.
* Reuse documented decisions and existing findings; do not rediscover them.
* Do not modify `../school`.
* Do not create Git commits.
* Do not make unrelated fixes or refactors.
* If required behavior is unsupported by the existing contract, stop and report it.

### Task boundary

Stay anchored to the current task until its acceptance criteria are satisfied.

When a side issue appears:

1. Determine whether it directly blocks a current acceptance criterion.
2. If it does not block acceptance, ignore it and continue the task.
3. If it blocks acceptance, make only the smallest change needed to unblock the required check.
4. Do not turn a side issue into a separate debugging, infrastructure, or cleanup task.
5. After unblocking validation, immediately return to the current task.
6. If the blocker cannot be resolved within the task scope, report it and use available deterministic validation instead.

Never leave the requested task to investigate unrelated failures.

## References

Use these when relevant; do not reread them without a reason:

* `docs/MOBILE_ARCHITECTURE.md`
* `docs/MOBILE_UX_AUDIT.md`
* `docs/MOBILE_ANALYSIS.md`
* `docs/MOBILE_TASKS.md`

`MOBILE_TASKS.md` is the working task tracker.

## Web → Native

Use Expo's `expo-web-to-native` Skill for Web → Native migration.

* Migrate, don't rewrite.
* Nativize, don't reskin.
* Web is the reference for behavior, hierarchy, vocabulary, business meaning, and design intent.
* Use native navigation and interaction patterns.
* Do not copy Web HTML/CSS/layouts.
* Project architecture overrides generic Skill assumptions: React Navigation 7, existing UI Kit, no Expo Router, no automatic `@expo/ui`.

## Native UI

* Preserve the Web product identity with native composition.
* UI Kit first; add reusable patterns there when justified.
* Prefer native sheets, segmented controls, sticky actions, Toasts, presses, and gestures.
* Use clear hierarchy and designed loading/empty/error/success states.
* Avoid generic CRUD screens and Web-style tables/toolbars.
* Use existing theme tokens and `useTheme()`.
* Preserve RTL/LTR, Arabic/French/English, light/dark, accessibility, font scaling, and directional icons.
* User-facing text must use i18n.

## Efficiency

Optimize for minimum sufficient work, not exhaustive certainty.

* Choose the simplest approach that satisfies the acceptance criteria.
* Inspect only evidence needed for the current decision.
* Prefer deterministic targeted checks over exploratory investigation.
* Do not repeat a check unless new information could change its result.
* Do not expand QA for additional confidence.
* Do not perform exploratory emulator walkthroughs.
* Runtime/UI validation must map directly to an acceptance criterion or a demonstrated task-related failure.
* If validation fails, investigate only the failure path.
* Never create temporary UI, test controls, probes, harnesses, scratch screens, or debug flows solely to force a runtime validation scenario.
* If a runtime scenario is not reproducible through an existing app flow or deterministic test, do not manufacture a new path for validation; use available deterministic checks and report the runtime scenario as unverified.
* Runtime validation must not become a new implementation or test-feature task.
* Once acceptance criteria are satisfied, stop immediately.

Do not turn a task into a repository audit, architecture review, broad QA session, or environment-repair session.

## Tools

* Graphify: use this repository's existing graph in `./graphify-out/` (`graph.json` and `GRAPH_REPORT.md`) for targeted code-navigation queries before inspecting raw files. Restrict queries and follow-up inspection to `src/`, `App.tsx`, and directly relevant project files. Use the graph only when it materially helps the task. Never scan `../school`, modify its configuration, or run `/graphify .` as a routine step. Do not re-index or rebuild the graph unless explicitly required by the task or the existing graph is demonstrably stale. Reuse existing context and never rescan known information.
* Ponytail: use only when relevant.
* Expo-compatible packages: use `npx expo install <package>`.
* Do not manually modify generated native files unless required.

## Task workflow

For each requested task:

1. Read its exact definition and acceptance criteria.
2. Inspect the minimum relevant implementation.
3. Reuse existing patterns.
4. Implement only the required scope.
5. Run only validation needed to prove the acceptance criteria.
6. Fix only task-related failures.
7. Mark `[x]` only when acceptance criteria pass.
8. Report changed files, validation, status, and blockers.
9. Stop.

For multiple requested tasks, finish and verify each before starting the next.

## Validation

* Run `npx tsc --noEmit` for relevant TypeScript code changes.
* Run task-specific checks.
* Check RTL/LTR, theme, accessibility, and native behavior only when affected.
* Screenshots/emulator QA only when required by acceptance criteria or needed to diagnose a real task-related failure.
* Never repeat expensive verification without new information.
* Do not wait indefinitely for servers, emulators, Metro, or other background processes. If a required runtime check remains unavailable, report the blocker and use deterministic validation that remains available.
* Never create temporary validation UI or debugging infrastructure merely to make an otherwise unavailable runtime scenario reproducible.

## Conflicts

`AGENTS.md` may contain generic Expo guidance. Its Expo Router instructions do not apply.

This file governs Mobile architecture and workflow.
