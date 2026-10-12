import React from 'react';
import { Text, type TextProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

/**
 * Numbers, amounts, fractions and phone numbers stay left-to-right inside RTL text ("13.50/20", "1.285,00 DT").
 * Wrapped in LRI…PDI isolates (Web `Ltr`, L10) so the surrounding Arabic can't reorder them; digits are tabular.
 */
export default function Num({ children, style, ...rest }: Omit<TextProps, 'children'> & { children: string | number }) {
  const { typography } = useTheme();
  return (
    <Text {...rest} style={[typography.numeric, style]}>
      {`\u2066${children}\u2069`}
    </Text>
  );
}
