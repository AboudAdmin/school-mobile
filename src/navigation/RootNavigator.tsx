import React, { useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { DarkTheme, DefaultTheme, NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../theme/ThemeProvider';
import LoginScreen from '../screens/auth/LoginScreen';
import RoleNavigator from './roleNavigators/RoleNavigator';
import { OWN_DASHBOARD, SCREEN_LABELS, stackScreensForRole } from './rbac';
import { screenFor } from './screens';
import { tr } from '../i18n';

const Stack = createNativeStackNavigator();
export const navigationRef = createNavigationContainerRef<Record<string, object | undefined>>();

/** Auth stack when signed out, otherwise the signed-in user's role navigator. */
export default function RootNavigator() {
  const { user, isLoading } = useAuth();
  const { colors, isDark, typography } = useTheme();
  const base = isDark ? DarkTheme : DefaultTheme;
  // isLoading is also true during login/logout; only the initial session restore should show the splash
  const restored = useRef(false);
  if (!isLoading) restored.current = true;

  if (!restored.current) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={{ ...base, colors: { ...base.colors, primary: colors.primary, background: colors.background, card: colors.surface, text: colors.text, border: colors.border } }}
      // A screen outside the role's navigator is unreachable; any attempt lands on the role's own dashboard (web OWN_DASHBOARD)
      onUnhandledAction={() => {
        if (user && navigationRef.isReady()) navigationRef.navigate(OWN_DASHBOARD[user.role] as string);
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="App">{() => <RoleNavigator key={user.role} role={user.role} />}</Stack.Screen>
            {stackScreensForRole(user.role).map((name) => (
              <Stack.Screen
                key={name}
                name={name}
                component={screenFor(name)}
                options={{
                  headerShown: true,
                  title: tr(SCREEN_LABELS[name]),
                  headerStyle: { backgroundColor: colors.surface },
                  headerTintColor: colors.text,
                  headerTitleStyle: typography.heading,
                  headerShadowVisible: false,
                }}
              />
            ))}
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
