import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  KeyRound,
  Building2,
  CheckCircle2,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { borderRadius, shadows, spacing } from '../../theme/spacing';
import { useAuth } from '../../context/AuthContext';

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (userToLogin?: string, passToLogin?: string) => {
    const finalUser = (userToLogin !== undefined ? userToLogin : username).trim();
    const finalPass = (passToLogin !== undefined ? passToLogin : password).trim();

    if (!finalUser) {
      setError('Please enter your username, email, or employee ID.');
      return;
    }
    if (!finalPass) {
      setError('Please enter your password.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await login(finalUser, finalPass);
      if (!res.success) {
        setError(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuickAccount = (uname: string) => {
    setUsername(uname);
    setPassword('');
    setError(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand Header */}
          <View style={styles.brandContainer}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoBadgeText}>U</Text>
            </View>
            <View style={styles.brandTitleRow}>
              <Text style={styles.brandTitle}>UMA TECHNO FAB</Text>
              <View style={styles.tagBadge}>
                <Text style={styles.tagBadgeText}>MTO ERP</Text>
              </View>
            </View>
            <Text style={styles.brandSubtitle}>
              Precision Heavy Fabrication & Make-to-Order ERP
            </Text>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.secureTag}>
                <Sparkles size={13} color={colors.bronze} />
                <Text style={styles.secureTagText}>SECURE WORKSPACE</Text>
              </View>
              <Text style={styles.cardTitle}>Sign In to Mobile ERP</Text>
              <Text style={styles.cardDescription}>
                Enter authorized credentials to access your manufacturing portal.
              </Text>
            </View>

            {/* Quick Test Accounts Bar */}
            <View style={styles.quickAccountsBox}>
              <View style={styles.quickAccountsHeader}>
                <View style={styles.quickRowLeft}>
                  <KeyRound size={13} color={colors.bronze} />
                  <Text style={styles.quickAccountsTitle}>Quick Demo Accounts</Text>
                </View>
                <Text style={styles.quickPassHint}>Pass: Admin@123456</Text>
              </View>

              <View style={styles.quickButtonsRow}>
                <TouchableOpacity
                  style={[styles.quickBtn, username === 'hardik.daki' && styles.quickBtnActive]}
                  onPress={() => handleSelectQuickAccount('hardik.daki')}
                >
                  <Text style={styles.quickBtnTitle}>Hardik Daki</Text>
                  <Text style={styles.quickBtnSub}>Super Admin</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.quickBtn, username === 'durgesh.jadav' && styles.quickBtnActive]}
                  onPress={() => handleSelectQuickAccount('durgesh.jadav')}
                >
                  <Text style={styles.quickBtnTitle}>Durgesh Jadav</Text>
                  <Text style={styles.quickBtnSub}>MD & Admin</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.quickBtn, username === 'admin' && styles.quickBtnActive]}
                  onPress={() => handleSelectQuickAccount('admin')}
                >
                  <Text style={styles.quickBtnTitle}>System Admin</Text>
                  <Text style={styles.quickBtnSub}>Full Access</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Error Message Alert */}
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Input Form */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Username or Employee ID</Text>
              <View style={styles.inputContainer}>
                <UserIcon size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. hardik.daki or admin"
                  placeholderTextColor={colors.textMuted}
                  value={username}
                  onChangeText={(txt) => {
                    setUsername(txt);
                    setError(null);
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Lock size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your secure password"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={(txt) => {
                    setPassword(txt);
                    setError(null);
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  {showPassword ? (
                    <EyeOff size={18} color={colors.textSecondary} />
                  ) : (
                    <Eye size={18} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={() => handleLogin()}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={colors.textInverse} size="small" />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>Sign In to Workspace</Text>
                  <ArrowRight size={18} color={colors.textInverse} />
                </>
              )}
            </TouchableOpacity>

            {/* Security Footer Note */}
            <View style={styles.cardFooter}>
              <ShieldCheck size={14} color={colors.success} />
              <Text style={styles.securityText}>
                256-Bit TLS Encrypted Gateway | Live PythonAnywhere API
              </Text>
            </View>
          </View>

          {/* Plant Location Footer */}
          <View style={styles.plantFooter}>
            <View style={styles.plantRow}>
              <Building2 size={15} color={colors.bronze} />
              <Text style={styles.plantTitle}>UMA Techno Fab Private Limited</Text>
            </View>
            <Text style={styles.plantAddress}>
              Makarpura Industrial Estate, Vadodara, Gujarat. Authorized manufacturing personnel only.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    justifyContent: 'center',
    minHeight: '100%',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  logoBadgeText: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.primary,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: 0.6,
  },
  tagBadge: {
    backgroundColor: colors.bronzeLight,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: '#E7DED5',
  },
  tagBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.bronze,
  },
  brandSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 3,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  cardHeader: {
    marginBottom: spacing.lg,
  },
  secureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  secureTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.bronze,
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },
  cardDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  quickAccountsBox: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  quickAccountsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  quickRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quickAccountsTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  quickPassHint: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: colors.bronze,
    fontWeight: '700',
  },
  quickButtonsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    padding: spacing.xs + 2,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  quickBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySubtle,
  },
  quickBtnTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  quickBtnSub: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 1,
  },
  errorBox: {
    backgroundColor: colors.dangerLight,
    borderColor: colors.dangerBorder,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 46,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
  },
  eyeBtn: {
    padding: spacing.xs,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    ...shadows.sm,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.lg,
  },
  securityText: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
  },
  plantFooter: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  plantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  plantTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  plantAddress: {
    fontSize: 10.5,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 15,
    maxWidth: 280,
  },
});
