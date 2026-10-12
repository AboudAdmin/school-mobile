import React, { useState } from 'react';
import { Image, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

interface Props {
  name: string;
  /** Absolute image URL; falls back to initials when missing or when it fails to load. */
  uri?: string | null;
  size?: number;
}

/** Person/entity avatar: photo when available, otherwise initials on a soft brand tint. */
export default function Avatar({ name, uri, size = 40 }: Props) {
  const { colors, typography } = useTheme();
  const [failed, setFailed] = useState(false);
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
  const box = { width: size, height: size, borderRadius: size / 2 };
  if (uri && !failed) {
    return <Image source={{ uri }} onError={() => setFailed(true)} accessibilityLabel={name} style={[box, { backgroundColor: colors.surfaceAlt }]} />;
  }
  return (
    <View accessible accessibilityLabel={name} style={[box, { backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }]}>
      <Text style={[size >= 56 ? typography.heading : typography.label, { color: colors.link }]}>{initials || '?'}</Text>
    </View>
  );
}
