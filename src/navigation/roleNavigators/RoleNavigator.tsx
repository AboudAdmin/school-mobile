import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth, type Role } from '../../auth/AuthContext';
import { useTheme } from '../../theme/ThemeProvider';
import { loc, tr } from '../../i18n';
import { OWN_DASHBOARD, SCREEN_LABELS, tabsForRole, reachabilityProblems, type ScreenName } from '../rbac';
import { screenFor } from '../screens';
import AccountSheet from '../AccountSheet';
import Icon from '../../components/ui/Icon';
import AppHeader from '../../components/ui/AppHeader';
import ChildSwitcher from '../../components/ChildSwitcher';
import IconDots from '@tabler/icons-react-native/IconDots';
import { iconFor } from '../screenIcons';
import MoreScreen from '../../screens/more/MoreScreen';

const Tab = createBottomTabNavigator();

/**
 * One bottom-tab navigator per role: its 4 registry tabs plus the More hub.
 * Screens a role may not open are never registered, so no navigation path can reach them.
 */
export default function RoleNavigator({ role }: { role: Role }) {
  const { colors, typography } = useTheme();
  const { user } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);
  const insets = useSafeAreaInsets();
  if (__DEV__) reachabilityProblems(role).forEach((p) => console.warn(`[nav] ${p}`));

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          // One branded header per tab root (A §9): crest, title, account avatar; the dashboard greets the user instead of repeating "Dashboard"
          header: ({ options }) => {
            const home = route.name === OWN_DASHBOARD[role];
            return (
              <AppHeader
                crest
                topInset={insets.top}
                title={home ? tr('Welcome back, {{name}}', { name: user?.name ?? '' }) : (options.title ?? route.name)}
                subtitle={home ? new Date().toLocaleDateString(loc(), { weekday: 'long', day: 'numeric', month: 'long' }) : undefined}
                account={{ name: user?.name ?? '?', onPress: () => setAccountOpen(true) }}
                below={role === 'parent' ? <ChildSwitcher /> : undefined}
              />
            );
          },
          tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
          tabBarActiveTintColor: colors.primary,
          // Tab labels are capped at 1.3× so five fit at 200 % font scale; the icon carries the meaning too
          tabBarLabel: ({ color, children }) => (
            <Text maxFontSizeMultiplier={1.3} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7} style={[typography.caption, typography.weights.medium, { color }]}>
              {children}
            </Text>
          ),
          tabBarInactiveTintColor: colors.textMuted,
          tabBarIcon: ({ color, size }) => (
            <Icon icon={route.name === 'More' ? IconDots : iconFor(route.name as ScreenName)} size={size} color={color} />
          ),
        })}
      >
        {tabsForRole(role).map((name) => (
          <Tab.Screen key={name} name={name} component={screenFor(name)} options={{ title: tr(SCREEN_LABELS[name]) }} />
        ))}
        <Tab.Screen name="More" component={MoreScreen} options={{ title: tr('More') }} />
      </Tab.Navigator>
      <AccountSheet visible={accountOpen} onClose={() => setAccountOpen(false)} />
    </View>
  );
}
