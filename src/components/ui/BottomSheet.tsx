import React, { useEffect, useRef, useState } from 'react';
import { Animated, KeyboardAvoidingView, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import IconX from '@tabler/icons-react-native/IconX';
import { useTheme } from '../../theme/ThemeProvider';
import { duration, useReducedMotion } from '../../theme/motion';
import { tr } from '../../i18n';
import Icon from './Icon';

interface Props {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * Bottom sheet (replaces the centred Modal). Closes by backdrop tap, Android Back / Escape, or the labelled Close button
 * (reachable with Tab + Enter and with TalkBack). Slides in; appears instantly under "Reduce motion".
 */
export default function BottomSheet({ visible, onClose, title, children, footer }: Props) {
  const { colors, spacing, radius, typography, elevation } = useTheme();
  const { bottom } = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(visible);
  const t = useRef(new Animated.Value(0)).current; // 0 hidden → 1 shown

  useEffect(() => {
    if (visible) setMounted(true);
    const to = visible ? 1 : 0;
    if (reduced) {
      t.setValue(to);
      if (!visible) setMounted(false);
      return;
    }
    Animated.timing(t, { toValue: to, duration: duration.base, useNativeDriver: true }).start(({ finished }) => {
      if (finished && !visible) setMounted(false);
    });
  }, [visible, reduced, t]);

  if (!mounted) return null;
  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      {/* lifts the sheet above the keyboard (search fields, text inputs inside sheets) */}
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <Animated.View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay, opacity: t }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityRole="button" accessibilityLabel={tr('Close')} importantForAccessibility="no" />
        <Animated.View
          accessibilityViewIsModal
          style={[
            {
              maxHeight: '88%',
              width: '100%',
              maxWidth: 640,
              alignSelf: 'center',
              backgroundColor: colors.surface,
              borderTopLeftRadius: radius.lg,
              borderTopRightRadius: radius.lg,
              paddingBottom: bottom + spacing.lg,
              transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [400, 0] }) }],
            },
            elevation.raised,
          ]}
        >
          <View style={{ alignItems: 'center', paddingTop: spacing.sm }}>
            <View style={{ width: 40, height: 4, borderRadius: radius.pill, backgroundColor: colors.borderStrong }} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingStart: spacing.lg, paddingEnd: spacing.sm, paddingVertical: spacing.sm }}>
            <Text accessibilityRole="header" style={[typography.heading, { color: colors.text, flex: 1 }]}>
              {title ?? ''}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={tr('Close')}
              onPress={onClose}
              android_ripple={{ color: colors.primarySoft, borderless: true }}
              style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
            >
              <Icon icon={IconX} color={colors.textMuted} />
            </Pressable>
          </View>
          <ScrollView bounces={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: spacing.lg }}>
            {children}
          </ScrollView>
          {footer ? <View style={{ flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>{footer}</View> : null}
        </Animated.View>
      </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
