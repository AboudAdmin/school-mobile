import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import IconCircleCheck from '@tabler/icons-react-native/IconCircleCheck';
import IconAlertTriangle from '@tabler/icons-react-native/IconAlertTriangle';
import IconInfoCircle from '@tabler/icons-react-native/IconInfoCircle';
import IconX from '@tabler/icons-react-native/IconX';
import { useTheme } from '../../theme/ThemeProvider';
import { duration as motion, useReducedMotion } from '../../theme/motion';
import { tr } from '../../i18n';
import Icon from './Icon';

interface ToastOptions {
  message: string;
  tone?: 'success' | 'danger' | 'info';
  /** A toast with an action stays until the user acts or dismisses it (WCAG 2.2.1). */
  action?: { label: string; onPress: () => void };
  /** Auto-dismiss time, clamped to 4–8 s. */
  duration?: number;
}
type Shown = ToastOptions & { id: number };

const ToastContext = createContext<((o: ToastOptions) => void) | null>(null);
export const useToast = () => {
  const show = useContext(ToastContext);
  if (!show) throw new Error('useToast must be used within ToastProvider');
  return show;
};
export const clampToastDuration = (ms?: number) => Math.min(8000, Math.max(4000, ms ?? 5000));

/** Feedback after an action, shown above the tab bar; announced to screen readers. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Shown | null>(null);
  const show = useCallback((o: ToastOptions) => {
    setToast({ ...o, id: Date.now() });
    AccessibilityInfo.announceForAccessibility(o.message);
  }, []);
  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast ? <ToastView key={toast.id} toast={toast} onDone={() => setToast(null)} /> : null}
    </ToastContext.Provider>
  );
}

function ToastView({ toast, onDone }: { toast: Shown; onDone: () => void }) {
  const { colors, spacing, radius, typography, elevation, isDark } = useTheme();
  const { bottom } = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const t = useRef(new Animated.Value(reduced ? 1 : 0)).current;
  const tone = toast.tone ?? 'info';
  const icon = tone === 'success' ? IconCircleCheck : tone === 'danger' ? IconAlertTriangle : IconInfoCircle;
  const accent = { success: colors.success, danger: colors.danger, info: colors.info }[tone];

  const hide = useCallback(() => {
    if (reduced) return onDone();
    Animated.timing(t, { toValue: 0, duration: motion.fast, useNativeDriver: true }).start(() => onDone());
  }, [reduced, t, onDone]);

  useEffect(() => {
    if (!reduced) Animated.timing(t, { toValue: 1, duration: motion.base, useNativeDriver: true }).start();
    if (toast.action) return; // persistent until acted on / dismissed
    const timer = setTimeout(hide, clampToastDuration(toast.duration));
    return () => clearTimeout(timer);
  }, [toast, reduced, t, hide]);

  return (
    <Animated.View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[
        {
          position: 'absolute',
          start: spacing.lg,
          end: spacing.lg,
          bottom: bottom + 72, // above the tab bar
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          paddingStart: spacing.lg,
          paddingEnd: spacing.sm,
          minHeight: 52,
          borderRadius: radius.md,
          backgroundColor: isDark ? colors.surface : colors.text, // inverse surface stands out from the page
          borderWidth: isDark ? 1 : 0,
          borderColor: colors.border,
          opacity: t,
          transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
        },
        elevation.raised,
      ]}
    >
      <Icon icon={icon} size={20} color={isDark ? accent : colors.surface} />
      <Text style={[typography.body, { color: isDark ? colors.text : colors.surface, flex: 1, paddingVertical: spacing.sm }]}>{toast.message}</Text>
      {toast.action ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            toast.action!.onPress();
            hide();
          }}
          hitSlop={8}
          style={{ paddingHorizontal: spacing.sm, minHeight: 44, justifyContent: 'center' }}
        >
          <Text style={[typography.label, { color: isDark ? colors.link : colors.primarySoft }]}>{toast.action.label}</Text>
        </Pressable>
      ) : null}
      <Pressable accessibilityRole="button" accessibilityLabel={tr('Dismiss')} onPress={hide} hitSlop={8} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
        <Icon icon={IconX} size={18} color={isDark ? colors.textMuted : colors.surface} />
      </Pressable>
    </Animated.View>
  );
}
