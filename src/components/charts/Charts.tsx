import React, { useState } from 'react';
import { PixelRatio, Text, View } from 'react-native';
import { BarChart as GBar, LineChart as GLine, PieChart as GPie } from 'react-native-gifted-charts';
import { useTheme } from '../../theme/ThemeProvider';

// Thin themed wrappers over react-native-gifted-charts: bar (plain or stacked), line, donut — the three types the web dashboards use.

export interface Series {
  name: string;
  color: string;
  data: number[];
}

/** Legend carries the label (and optionally the value), so colour is never the only signal. */
export function Legend({ items }: { items: { label: string; color: string; value?: string | number }[] }) {
  const { colors, spacing, radius, typography } = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.md }}>
      {items.map((i) => (
        <View key={i.label} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <View style={{ width: 10, height: 10, borderRadius: radius.xs, backgroundColor: i.color }} />
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            {i.label}
            {i.value !== undefined ? <Text style={{ color: colors.text, ...typography.weights.semibold }}> {i.value}</Text> : null}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** Charts need a pixel width: measure the parent once laid out. */
function useWidth() {
  const [width, setWidth] = useState(0);
  return { width, onLayout: (e: { nativeEvent: { layout: { width: number } } }) => setWidth(e.nativeEvent.layout.width) };
}

const SECTIONS = 4;
/** Axis max rounded up to a "nice" step (1, 2, 2.5, 5 × 10^n per gridline), so every gridline lands on a round number. */
const niceMax = (max: number) => {
  const raw = Math.max(max, SECTIONS) / SECTIONS;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((v) => v >= raw)!;
  return step * SECTIONS;
};
/** Compact axis numbers, like the web dashboards' short(): 12000 → 12k. */
const short = (n: number) => (n >= 1000 ? `${+(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(Math.round(n)));

function useAxis(suffix: string) {
  const { colors, typography } = useTheme();
  // Axis ticks are supplementary (values are in legends/hints): cap their growth at 1.3× like tab labels so they don't overlap
  const fs = PixelRatio.getFontScale();
  const tick = { ...typography.caption, color: colors.textMuted, fontSize: (typography.caption.fontSize * Math.min(fs, 1.3)) / fs, lineHeight: undefined };
  return {
    xAxisLabelsHeight: Math.ceil(typography.caption.fontSize * Math.min(fs, 1.3) * 1.6),
    formatYLabel: (l: string) => `${short(Number(l))}${suffix}`,
    yAxisTextStyle: tick,
    xAxisLabelTextStyle: tick,
    xAxisColor: colors.border,
    yAxisColor: 'transparent',
    rulesColor: colors.border,
    rulesType: 'solid' as const,
    noOfSections: SECTIONS,
    yAxisLabelWidth: 44,
  };
}

/** Bars per label; several series are stacked (e.g. present / late / absent per day). */
export function BarChart({ labels, series, height = 200, suffix = '' }: { labels: string[]; series: Series[]; height?: number; suffix?: string }) {
  const { width, onLayout } = useWidth();
  const axis = useAxis(suffix);
  const slots = Math.max(labels.length, 1);
  const plot = Math.max(width - axis.yAxisLabelWidth - 16, 0);
  const barWidth = Math.min(28, Math.max(8, (plot / slots) * 0.55));
  const spacing = Math.max(4, plot / slots - barWidth);
  const total = Math.max(0, ...labels.map((_, i) => series.reduce((a, s) => a + (s.data[i] ?? 0), 0)));
  const common = { ...axis, height, barWidth, spacing, initialSpacing: spacing / 2, width: plot, rulesLength: plot, xAxisLength: plot, maxValue: niceMax(total), disableScroll: true };

  return (
    <View onLayout={onLayout}>
      {width > 0 ? (
        series.length > 1 ? (
          <GBar
            {...common}
            stackData={labels.map((label, i) => ({ label, stacks: series.map((s) => ({ value: s.data[i] ?? 0, color: s.color })) }))}
          />
        ) : (
          <GBar {...common} frontColor={series[0]?.color} data={labels.map((label, i) => ({ label, value: series[0]?.data[i] ?? 0 }))} />
        )
      ) : null}
      {series.length > 1 ? <Legend items={series.map((s) => ({ label: s.name, color: s.color }))} /> : null}
    </View>
  );
}

/** Single-series trend line (e.g. attendance rate over time). */
export function LineChart({ labels, data, color, height = 200, suffix = '', maxValue }: { labels: string[]; data: number[]; color: string; height?: number; suffix?: string; maxValue?: number }) {
  const { colors } = useTheme();
  const { width, onLayout } = useWidth();
  const axis = useAxis(suffix);
  const plot = Math.max(width - axis.yAxisLabelWidth - 16, 0);
  const edge = 24; // room for the first/last x label
  const step = labels.length > 1 ? (plot - edge * 2) / (labels.length - 1) : plot;

  return (
    <View onLayout={onLayout}>
      {width > 0 ? (
        <GLine
          {...axis}
          height={height}
          width={plot}
          spacing={step}
          initialSpacing={edge}
          endSpacing={edge}
          maxValue={maxValue ?? niceMax(Math.max(0, ...data))}
          color={color}
          thickness={3}
          curved
          dataPointsColor={color}
          dataPointsRadius={4}
          areaChart
          startFillColor={color}
          endFillColor={colors.surface}
          startOpacity={0.25}
          endOpacity={0}
          disableScroll
          data={labels.map((label, i) => ({ label, value: data[i] ?? 0 }))}
        />
      ) : null}
    </View>
  );
}

/** Donut with a centre total and a labelled legend. */
export function DonutChart({ items, centerLabel, radius = 80 }: { items: { label: string; value: number; color: string }[]; centerLabel?: string; radius?: number }) {
  const { colors, typography } = useTheme();
  const total = items.reduce((a, i) => a + i.value, 0);
  return (
    <View style={{ alignItems: 'center' }}>
      <GPie
        donut
        radius={radius}
        innerRadius={radius * 0.62}
        innerCircleColor={colors.surface}
        data={items.filter((i) => i.value > 0).map((i) => ({ value: i.value, color: i.color }))}
        centerLabelComponent={() => (
          <View style={{ alignItems: 'center' }}>
            <Text style={[typography.heading, { color: colors.text }]}>{total}</Text>
            {centerLabel ? <Text style={[typography.caption, { color: colors.textMuted }]}>{centerLabel}</Text> : null}
          </View>
        )}
      />
      <Legend items={items.map((i) => ({ label: i.label, color: i.color, value: i.value }))} />
    </View>
  );
}
