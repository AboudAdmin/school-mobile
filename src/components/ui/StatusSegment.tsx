import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import Icon, { type TablerIcon } from './Icon';

export interface StatusOption<T extends string> {
  value: T;
  label: string;
  icon: TablerIcon;
  tone: 'success' | 'warning' | 'danger';
}

/**
 * Roll-call control (resolves D7): one radio per status, each with an icon and its full label, so colour is never the only signal.
 * `label` names the row (e.g. the student) for screen readers.
 */
export default function StatusSegment<T extends string>({ value, onChange, options, label }: { value: T | undefined; onChange: (v: T) => void; options: StatusOption<T>[]; label: string }) {
  const { colors, spacing, radius, typography } = useTheme();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={{ flexDirection: 'row', gap: spacing.xs }}>
      {options.map((o) => {
        const on = value === o.value;
        const solid = { success: colors.successSolid, warning: colors.warningSolid, danger: colors.dangerSolid }[o.tone];
        const fg = on ? colors.onPrimary : colors.textMuted;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            accessibilityLabel={`${label}: ${o.label}`}
            onPress={() => onChange(o.value)}
            style={{
              flex: 1,
              minHeight: 44,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.xs,
              paddingHorizontal: spacing.xs,
              borderRadius: radius.sm,
              borderWidth: 1,
              borderColor: on ? solid : colors.border,
              backgroundColor: on ? solid : colors.surfaceAlt,
            }}
          >
            <Icon icon={o.icon} size={16} color={fg} />
            {/* No numberOfLines: at 200 % font or in French the label wraps instead of truncating ("En reta…"), so D7's "full label" holds */}
            <Text style={[typography.caption, typography.weights.semibold, { color: fg, flexShrink: 1 }]}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
