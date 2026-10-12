import React, { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../auth/AuthContext';
import { useTheme } from '../../theme/ThemeProvider';
import { control } from '../../theme/spacing';
import { tr } from '../../i18n';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import TextField from '../../components/ui/TextField';
import LanguagePicker from '../../components/LanguagePicker';
import IconAlertTriangle from '@tabler/icons-react-native/IconAlertTriangle';
import Icon from '../../components/ui/Icon';

export default function LoginScreen() {
  const { login, error: authError, clearError } = useAuth();
  const { colors, spacing, radius, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    clearError();
  }, []);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setLocalError('Please enter both email and password.');
      return;
    }
    setLocalError(null);
    setSubmitting(true);
    try {
      await login(email, password);
    } catch {
      // AuthContext already exposes the mapped message via `error`
    } finally {
      setSubmitting(false);
    }
  };

  const message = localError || authError;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          {/* full-bleed brand area above the form (A §9 D4) */}
          <View style={{ backgroundColor: colors.primary, alignItems: 'center', paddingTop: insets.top + spacing.xxl, paddingBottom: spacing.xxl + spacing.xl, paddingHorizontal: spacing.xl, gap: spacing.md }}>
            <Image source={require('../../../assets/icon.png')} style={{ width: control.crest, height: control.crest, borderRadius: radius.lg }} accessibilityIgnoresInvertColors />
            <Text accessibilityRole="header" style={[typography.title, { color: colors.onPrimary, textAlign: 'center' }]}>
              {tr('Welcome')}
            </Text>
            <Text style={[typography.body, { color: colors.onPrimary, textAlign: 'center' }]}>{tr('Please enter your details to sign in')}</Text>
          </View>
          <View style={{ width: '100%', maxWidth: control.formMax, alignSelf: 'center', paddingHorizontal: spacing.xl, marginTop: -spacing.xl, paddingBottom: spacing.xl }}>
            <Card style={{ padding: spacing.xl }}>
              {message ? (
                <View
                  accessibilityRole="alert"
                  accessibilityLiveRegion="polite"
                  style={{ backgroundColor: colors.dangerSoft, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg, flexDirection: 'row', gap: spacing.sm }}
                >
                  <Icon icon={IconAlertTriangle} size={20} color={colors.danger} />
                  <Text style={[typography.body, { color: colors.danger, flex: 1 }]}>{tr(message)}</Text>
                </View>
              ) : null}

              <TextField
                label={tr('Email Address')}
                value={email}
                onChangeText={setEmail}
                placeholder="name@example.com"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                textContentType="username"
                editable={!submitting}
                returnKeyType="next"
              />
              <TextField
                  label={tr('Password')}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                  textContentType="password"
                  editable={!submitting}
                  returnKeyType="go"
                  onSubmitEditing={handleSubmit}
                  trailing={
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={tr(showPassword ? 'Hide password' : 'Show password')}
                      accessibilityState={{ selected: showPassword }}
                      onPress={() => setShowPassword((v) => !v)}
                      hitSlop={8}
                    >
                      <Text style={[typography.label, { color: colors.primary }]}>{tr(showPassword ? 'Hide' : 'Show')}</Text>
                    </Pressable>
                  }
                />

              <Button title={tr('Sign In')} onPress={handleSubmit} loading={submitting} />
            </Card>
            <View style={{ marginTop: spacing.xl }}>
              <LanguagePicker />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
