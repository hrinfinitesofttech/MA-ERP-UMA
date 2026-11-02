import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Lock, User as UserIcon, Eye, EyeOff, ArrowRight } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { themedStyles } from '../../theme/themedStyles';
import { borderRadius, shadows, spacing } from '../../theme/spacing';
import { useAuth } from '../../context/AuthContext';

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    const user = username.trim();
    const pass = password.trim();

    if (!user || !pass) {
      setError(!user ? 'Enter your username or employee ID.' : 'Enter your password.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const res = await login(user, pass);
      if (!res.success) setError(res.error || 'Sign in failed. Check your credentials.');
    } catch (err: any) {
      setError(err?.message || 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.logoCard}>
            <Image source={require('../../../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
          </View>
          <Text style={styles.tagline}>MANUFACTURING ERP</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue to your workspace.</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Username or Employee ID</Text>
          <View style={styles.inputRow}>
            <UserIcon size={18} color={colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Enter username"
              placeholderTextColor={colors.textMuted}
              value={username}
              onChangeText={(t) => {
                setUsername(t);
                setError(null);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputRow}>
            <Lock size={18} color={colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setError(null);
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              onSubmitEditing={handleLogin}
              returnKeyType="go"
            />
            <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={10} accessibilityLabel="Toggle password visibility">
              {showPassword ? <EyeOff size={18} color={colors.textSecondary} /> : <Eye size={18} color={colors.textSecondary} />}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.submit, loading && styles.submitDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={colors.textInverse} size="small" />
            ) : (
              <>
                <Text style={styles.submitText}>Sign in</Text>
                <ArrowRight size={18} color={colors.textInverse} />
              </>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>UMA Techno Fab Pvt. Ltd. • Vadodara, Gujarat</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = themedStyles(() => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.header },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  hero: { alignItems: 'center', marginBottom: spacing.xxl },
  logoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  logoImage: { width: 220, height: 148 },
  tagline: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '800', letterSpacing: 3 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.lg,
  },
  title: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2, marginBottom: spacing.lg },
  errorBox: {
    backgroundColor: colors.dangerLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: { fontSize: 13, color: colors.danger, fontWeight: '600' },
  label: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginBottom: 6, marginTop: spacing.xs },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 50,
    marginBottom: spacing.md,
  },
  input: { flex: 1, fontSize: 15, color: colors.textPrimary, height: '100%' },
  submit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
    height: 52,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: colors.textInverse, fontSize: 16, fontWeight: '800' },
  footer: { textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: spacing.xl },
}));
