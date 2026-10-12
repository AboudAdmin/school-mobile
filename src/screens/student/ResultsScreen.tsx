// A student's results (their own, or the student staff opened from StudentDetail; the backend scopes who may read whom):
//   GET /grades/report-card/:studentId   trimester averages per domain/subject
//   GET /grades?studentId                 every recorded mark (also marks outside the report-card domains)
import React, { useState } from 'react';
import { esc, sharePdf } from '../../utils/sharePdf';
import Button from '../../components/ui/Button';
import { ScrollView, Text, View } from 'react-native';
import { useReportCard, useStudentGrades, type Trimester } from '../../api/grades';
import { useSubjectStudent } from '../../api/students';
import { useTheme } from '../../theme/ThemeProvider';
import { lightColors as paper } from '../../theme/colors';
import { isRTL, loc, tr } from '../../i18n';
import Badge from '../../components/ui/Badge';
import FilterChips from '../../components/ui/FilterChips';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import ScorePill from '../../components/ui/ScorePill';
import Section from '../../components/ui/Section';
import ViewingBar from '../../components/ui/ViewingBar';

const EXAM: Record<string, string> = { evaluation: 'Continuous assessment', exam_1: 'Exam 1', exam_2: 'Exam 2' };
export default function ResultsScreen() {
  const { colors, spacing, typography } = useTheme();
  const [trimester, setTrimester] = useState<Trimester>('T1');
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const me = useSubjectStudent();
  const card = useReportCard(me.id);
  const grades = useStudentGrades(me.id);

  if (me.isPending) return <LoadingState />;
  if (me.isError) return <ErrorState message={tr('Could not load data.')} retryLabel={tr('Retry')} onRetry={() => me.refetch()} />;

  const t = card.data?.trimesters[trimester];
  const marks = (grades.data ?? []).filter((g) => g.trimester === trimester);
  const fmt = (v: number | null | undefined) => (v == null ? '—' : `${v.toFixed(2)}/20`);

  // Grade report for the selected trimester → PDF → native share sheet (RN-TASK-016)
  const shareReport = async () => {
    setShareError(null);
    setSharing(true);
    try {
      const rows = (t?.domains ?? [])
        .flatMap((d) => d.subjects.map((sub) => `<tr><td>${esc(d.label)}</td><td>${esc(sub.title)}</td><td>${esc(fmt(sub.average))}</td></tr>`))
        .join('');
      const markRows = marks
        .map((g) => `<tr><td>${esc(g.subject?.title ?? g.subjectId)}</td><td>${esc(tr(EXAM[g.examType] ?? g.examType))}</td><td>${esc(g.score != null ? `${Number(g.score)}/20` : g.status)}</td></tr>`)
        .join('');
      const html = `<!doctype html><html dir="${isRTL() ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><style>
        body{font-family:sans-serif;color:${paper.text};padding:24px} h1{font-size:20px;margin:0} h2{font-size:15px;margin:20px 0 8px;color:${paper.primary}}
        .muted{color:${paper.textMuted};font-size:12px} table{width:100%;border-collapse:collapse;font-size:13px} td,th{border-bottom:1px solid ${paper.border};padding:6px;text-align:start}
      </style></head><body>
        <h1>${esc(tr('Report card'))} · ${esc(trimester)}</h1>
        <div class="muted">${esc(me.name)} · ${esc(new Date().toLocaleDateString(loc(), { day: 'numeric', month: 'long', year: 'numeric' }))}</div>
        <h2>${esc(tr('Trimester average'))}: ${esc(fmt(t?.average))}</h2>
        ${rows ? `<table>${rows}</table>` : `<p class="muted">${esc(tr('No averages for this trimester yet'))}</p>`}
        <h2>${esc(tr('Recorded marks'))}</h2>
        ${markRows ? `<table>${markRows}</table>` : `<p class="muted">${esc(tr('No marks for this trimester yet'))}</p>`}
      </body></html>`;
      await sharePdf(html, `report-card-${trimester}-${(me.name ?? 'student').toLowerCase()}`, tr('Share report'));
    } catch (e) {
      setShareError(e instanceof Error ? e.message : tr('Could not create the report'));
    } finally {
      setSharing(false);
    }
  };

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
      <ViewingBar me={me} />
      <FilterChips<Trimester> value={trimester} onChange={setTrimester} options={(['T1', 'T2', 'T3'] as const).map((v) => ({ value: v, label: v }))} />
      <Button title={tr('Share report (PDF)')} variant="outline" onPress={shareReport} loading={sharing} disabled={card.isPending || grades.isPending} />
      {shareError ? (
        <Text accessibilityRole="alert" style={[typography.caption, { color: colors.danger }]}>
          {shareError}
        </Text>
      ) : null}

      <Section title={tr('Report card')} hint={card.data?.annual?.average != null ? `${tr('Annual average')}: ${fmt(card.data.annual.average)}` : undefined} state={card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={[typography.body, { color: colors.textMuted }]}>{tr('Trimester average')}</Text>
          <ScorePill score={t?.average} />
        </View>
        {(t?.domains ?? [])
          .filter((d) => d.subjects.length)
          .map((d) => (
            <View key={d.domainId} style={{ gap: spacing.xs }}>
              <Text style={[typography.label, { color: colors.text }]}>
                {d.label} · {fmt(d.average)}
              </Text>
              {d.subjects.map((s) => (
                <View key={s.subjectId} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={[typography.body, { color: colors.textMuted, flex: 1 }]}>{s.title}</Text>
                  <Text style={[typography.body, { color: colors.text }]}>{fmt(s.average)}</Text>
                </View>
              ))}
            </View>
          ))}
        {t && !t.domains.some((d) => d.subjects.length) ? <Text style={[typography.body, { color: colors.textMuted }]}>{tr('No averages for this trimester yet')}</Text> : null}
      </Section>

      <Section title={tr('Recorded marks')} state={grades}>
        {marks.length ? (
          marks.map((g) => (
            <View key={g.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm }}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.body, { color: colors.text }]}>{g.subject?.title ?? `#${g.subjectId}`}</Text>
                <Text style={[typography.caption, { color: colors.textMuted }]}>{tr(EXAM[g.examType] ?? g.examType)}</Text>
              </View>
              {g.status === 'GRADED' && g.score != null ? <ScorePill score={Number(g.score)} /> : <Badge tone="neutral" label={tr(g.status.charAt(0) + g.status.slice(1).toLowerCase())} />}
            </View>
          ))
        ) : (
          <Text style={[typography.body, { color: colors.textMuted }]}>{tr('No marks for this trimester yet')}</Text>
        )}
      </Section>
    </ScrollView>
  );
}
