# Store listing and privacy pack (TASK-029)

Draft for owner review. Items marked **OWNER** need a decision or a fact only the school can give. Everything else is derived from what the app does today (API use read from `src/api/*`, `app.json`, `package.json`).

- App id: `com.khaledbenwalid.school` (Android package and iOS bundle id), version 1.0.0, app name in the stores: **خالد بن الوليد**.
- Backend: `https://khaledbenwalid.com/api` (production profile). Users are invited by the school; there is no public sign-up in the app.
- Roles: admin, secretary, teacher, student, parent.

## 1. Listing text

### Arabic (primary)

**Title (≤ 30):** خالد بن الوليد — المدرسة

**Short description (≤ 80):** تابع الحضور والنتائج والواجبات والرسوم والرسائل في مكان واحد.

**Full description:**
تطبيق مدرسة خالد بن الوليد يجمع كل ما يحتاجه التلميذ وولي الأمر والمعلّم وإدارة المدرسة في هاتفك.

• التلاميذ: الجدول الزمني، الواجبات، النتائج وكشف النقاط، الموارد التعليمية.
• الأولياء: متابعة كل ابن على حدة — الحضور والنتائج والواجبات والرسوم والإعلانات.
• المعلّمون: تسجيل الحضور بلمسة، إدخال الأعمال والنقاط، إنشاء الواجبات، المراسلة.
• الإدارة والكتابة: لوحة متابعة، طلبات التسجيل، الفواتير وتسجيل الدفعات.
يعمل بالعربية والفرنسية والإنجليزية، مع الوضع الفاتح والداكن، ويعرض آخر بيانات محفوظة عند انقطاع الاتصال.
الحسابات تُنشأ من إدارة المدرسة. للدخول استخدم البريد وكلمة المرور التي زوّدتك بها المدرسة.

### French

**Title:** École Khaled Ben Walid

**Short description:** Présence, résultats, devoirs, frais et messages de l'école, au même endroit.

**Full description:**
L'application de l'école Khaled Ben Walid réunit sur votre téléphone ce dont élèves, parents, enseignants et administration ont besoin.

• Élèves : emploi du temps, devoirs, résultats et relevés de notes, ressources pédagogiques.
• Parents : suivi de chaque enfant — présence, résultats, devoirs, frais et annonces.
• Enseignants : appel en un geste, saisie des notes, création de devoirs, messagerie.
• Administration et secrétariat : tableau de bord, demandes d'inscription, factures et enregistrement des paiements.
Disponible en arabe, français et anglais, thème clair ou sombre, et affichage des dernières données enregistrées hors connexion.
Les comptes sont créés par l'école : connectez-vous avec l'e-mail et le mot de passe fournis par l'établissement.

### English

**Title:** Khaled Ben Walid School

**Short description:** Attendance, results, homework, fees and messages from your school in one app.

**Full description:**
The Khaled Ben Walid School app puts what students, parents, teachers and school staff need on your phone.

• Students: timetable, homework, results and report cards, learning resources.
• Parents: follow each child — attendance, results, homework, fees and announcements.
• Teachers: one-tap roll call, grade entry, homework creation, messaging.
• Administration and front office: dashboard, registration requests, invoices and payment recording.
Works in Arabic, French and English, light and dark themes, and shows your last saved data when you are offline.
Accounts are created by the school: sign in with the email and password the school gave you.

**Category:** Education. **Content rating:** everyone (no user-generated public content; messages are between school accounts). **OWNER:** confirm the store title wording and the contact details below.

## 2. Screenshots (per role)

Plan: 6 phone screenshots per store language for the roles below, light theme, real-looking (non-dev) data, no debug overlays.

| Role | Screens |
|---|---|
| Parent | Dashboard (child blocks), Results, Fees, Attendance |
| Student | Dashboard, Timetable, Homework (TaskRow) |
| Teacher | Dashboard, Roll call (StatusSegment), Enter grades |
| Admin | Dashboard, Invoices (cards), Registration request |
| Secretary | Dashboard, Record payment sheet |

⚠️ **Not captured:** the emulator uses the Expo Go shell and dev test data (dev floating button, test names). Capture the final set from the TASK-027 preview build on a physical device against production-like data, in ar / fr / en. Required sizes: Google Play phone 16:9 or 9:16, min 320 px; feature graphic 1024×500 (**OWNER**: brand artwork).

## 3. Privacy policy (text for the hosted page)

**OWNER:** host this at a public URL and supply it in both stores; fill the bracketed facts.

> **Privacy policy — Khaled Ben Walid School app**
> Last updated: [date]. Controller: [legal name of the school], [address], contact: [privacy email].
>
> **Who can use the app.** Only people the school has given an account (students, parents, teachers, secretaries, administrators). We do not offer public sign-up.
>
> **What the app handles, by use of the school system's API:**
> - *Account:* name, email, role, account status, language and theme preference.
> - *Students:* name, class, birth date, gender, address, linked parent, points; timetable; attendance (present / late / absent per session); homework; grades and report cards.
> - *Parents:* the children linked to the parent's account and the same information about those children only.
> - *Teachers:* class and student lists, attendance and grades they enter, homework they create.
> - *Finance (secretaries, administrators, and the parent of the student):* invoices, payments and receipts, balances, due dates.
> - *Messages and announcements:* messages between school accounts and announcements sent by the school, with read / acknowledged state.
> - *Registration requests (secretaries, administrators):* parent and child details submitted to the school.
>
> **Where it is stored.** On the school's servers ([hosting provider, country — OWNER]). On your device the app keeps your sign-in tokens in the system secure storage and a temporary cache of the screens you opened so they work offline. Signing out deletes both.
>
> **Sharing.** The app does not use advertising, analytics or crash-reporting services and does not sell or share data with third parties. Data is shown only to accounts the school authorises (a parent sees their own children; a student sees their own records; staff see what their role allows).
>
> **Device permissions.** None required at the moment. When you share a report card the app creates a PDF and hands it to the system share sheet; the file is kept only as long as the system keeps it.
>
> **Security.** Traffic uses HTTPS; access is limited by role on the server; sessions expire and refresh automatically.
>
> **Retention and deletion.** [retention period — OWNER]. To correct or delete your data, or to close an account, contact the school at [privacy email]; deletion requests are handled by the school administration. [OWNER: confirm the process and timelines.]
>
> **Children.** Student accounts are created by the school for its pupils. Parents can request access, correction or deletion of their child's data through the school.
>
> **Changes.** We will publish updates on this page.

## 4. Google Play — Data safety (answers from real API use)

| Question | Answer |
|---|---|
| Does the app collect or share user data? | Collects: yes. Shares with third parties: **no** |
| Data encrypted in transit | Yes (HTTPS) |
| Users can request deletion | Yes — through the school (**OWNER**: provide the contact / URL) |
| Personal info — Name, Email address | Collected; app functionality, account management; not shared |
| Personal info — Address, Phone number | Collected (student/parent profile and registration fields); app functionality; not shared |
| Personal info — Other (birth date, gender, role) | Collected; app functionality; not shared |
| Financial info — Purchase history / payments | Collected (school fee invoices and payments, not card data); app functionality; not shared |
| Messages — In-app messages | Collected; app functionality; not shared |
| App activity / performance / device IDs | Not collected |
| Location, contacts, photos, files, audio, health | Not collected |
| Data processed ephemerally | The offline cache on the device is wiped at sign-out |

Required by Play: target audience and content, ads declaration (**no ads**), app access instructions for the reviewer — **OWNER**: provide a review login per role (do not reuse production staff accounts).

## 5. Apple — App Privacy ("nutrition label")

| Category | Collected | Linked to the user | Used for tracking |
|---|---|---|---|
| Contact info (name, email, phone, address) | Yes | Yes | No |
| Identifiers (user id) | Yes | Yes | No |
| Financial info (payment amounts / status only) | Yes | Yes | No |
| User content (messages) | Yes | Yes | No |
| Other user data (grades, attendance, birth date, gender) | Yes | Yes | No |
| Usage data, diagnostics, location, contacts, photos | No | — | No |

Export compliance: `ITSAppUsesNonExemptEncryption = false` is already set (standard HTTPS only). iOS is not currently built (no Apple device or developer account on the project): **OWNER** decision whether iOS ships in this release.

## 6. Owner checklist before upload

1. Hosted privacy-policy URL and privacy contact email.
2. School legal name, address and support email / URL for both stores.
3. Retention and deletion process wording.
4. Review accounts per role for the store reviewers.
5. Feature graphic and the final per-role screenshots (section 2).
6. Confirm the three listing texts above and the Education category / age rating.
