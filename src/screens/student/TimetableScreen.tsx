import React from 'react';
import { SectionList, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { loc, tr } from '../../i18n';
import { DAYS, useTimetable } from '../../api/schedules';
import { useSubjectStudent } from '../../api/students';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import EventRow from '../../components/ui/EventRow';
import LoadingState from '../../components/ui/LoadingState';
import ViewingBar from '../../components/ui/ViewingBar';

// Localised weekday name for an English day key (2024-01-01 was a Monday)
const dayName = (i: number) => new Date(2024, 0, 1 + i).toLocaleDateString(loc(), { weekday: 'long' });

/** A student's class timetable (their own, or the one staff opened from StudentDetail), grouped by day, today first. */
export default function TimetableScreen() {
  const { colors, spacing, typography } = useTheme();
  const me = useSubjectStudent();
  const tt = useTimetable(me);

  if (me.isPending || (me.classId && tt.isPending)) return <LoadingState />;
  if (me.isError || tt.isError) return <ErrorState message={tr('Could not load data.')} retryLabel={tr('Retry')} onRetry={() => (me.refetch(), tt.refetch())} />;
  if (!me.classId) return <EmptyState title={tr('No class yet')} message={me.mode === 'self' ? tr('Your timetable appears once you are placed in a class.') : undefined} />;

  const todayIdx = (new Date().getDay() + 6) % 7; // JS Sunday=0 → Monday-first index
  const sections = DAYS.map((d, i) => ({ i, title: d, data: (tt.data ?? []).filter((s) => s.day === d).sort((a, b) => a.startTime.localeCompare(b.startTime)) }))
    .filter((s) => s.data.length)
    .sort((a, b) => ((a.i - todayIdx + 7) % 7) - ((b.i - todayIdx + 7) % 7));

  return (
    <SectionList
      style={{ flex: 1, backgroundColor: colors.background }}
      sections={sections}
      keyExtractor={(s) => String(s.id)}
      stickySectionHeadersEnabled
      ListHeaderComponent={<ViewingBar me={me} />}
      ListEmptyComponent={<EmptyState title={tr('No classes scheduled')} />}
      renderSectionHeader={({ section }) => (
        <View style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, backgroundColor: colors.background }}>
          <Text style={[typography.label, { color: section.i === todayIdx ? colors.primary : colors.textMuted }]}>
            {dayName(section.i)}
            {section.i === todayIdx ? ` · ${tr('Today')}` : ''}
          </Text>
        </View>
      )}
      renderItem={({ item }) => (
        <View style={{ paddingHorizontal: spacing.lg }}>
          <EventRow
            time={item.startTime.slice(0, 5)}
            title={item.subject?.title ?? '—'}
            subtitle={[`${item.startTime.slice(0, 5)}–${item.endTime.slice(0, 5)}`, item.teacher?.user?.name, item.room].filter(Boolean).join(' · ')}
          />
        </View>
      )}
    />
  );
}
