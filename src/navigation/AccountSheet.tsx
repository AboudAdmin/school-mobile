import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { useTheme, type ThemeMode } from '../theme/ThemeProvider';
import { tr } from '../i18n';
import BottomSheet from '../components/ui/BottomSheet';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Select from '../components/ui/Select';
import LanguagePicker from '../components/LanguagePicker';

// Dev-only: a `require` behind `__DEV__` is dropped from release bundles (a static import would ship the whole kitchen sink).
const KitchenSink: typeof import('../screens/__dev__/KitchenSink').default | null = __DEV__ ? require('../screens/__dev__/KitchenSink').default : null;

/** Signed-in user's account sheet: who am I, language, theme, sign out. */
export default function AccountSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { user, logout } = useAuth();
  const { colors, spacing, typography, mode, setMode } = useTheme();
  const [kit, setKit] = useState(false);
  return (
    <>
    <BottomSheet visible={visible} onClose={onClose} title={tr('Account')}>
      <View style={{ marginBottom: spacing.lg, gap: spacing.xs }}>
        <Text style={[typography.heading, { color: colors.text }]}>{user?.name}</Text>
        <Text style={[typography.caption, { color: colors.textMuted }]}>{user?.email}</Text>
        {user ? <Badge tone="primary" label={tr(user.role.charAt(0).toUpperCase() + user.role.slice(1))} /> : null}
      </View>
      <LanguagePicker />
      <Select<ThemeMode>
        label={tr('Theme')}
        value={mode}
        onChange={setMode}
        options={[
          { value: 'system', label: tr('System') },
          { value: 'light', label: tr('Light') },
          { value: 'dark', label: tr('Dark') },
        ]}
      />
      {__DEV__ ? <Button title="Dev: UI kit & list" variant="ghost" onPress={() => (onClose(), setKit(true))} style={{ marginBottom: spacing.sm }} /> : null}
      <Button
        title={tr('Logout')}
        variant="outline"
        onPress={async () => {
          onClose();
          await logout();
        }}
      />
    </BottomSheet>
    {KitchenSink ? <KitchenSink visible={kit} onClose={() => setKit(false)} /> : null}
    </>
  );
}
