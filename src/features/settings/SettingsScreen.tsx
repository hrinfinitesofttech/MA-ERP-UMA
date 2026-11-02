import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Check, RotateCcw, LogOut } from 'lucide-react-native';
import { colors, THEME_PRESETS, ACCENT_SWATCHES } from '../../theme/colors';
import { themedStyles } from '../../theme/themedStyles';
import { borderRadius, shadows, spacing } from '../../theme/spacing';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const SettingsScreen: React.FC = () => {
  const { themeId, accent, setTheme, setAccent, resetTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.heading}>Appearance</Text>
      <Text style={styles.help}>Choose a theme and accent colour. Your choice is saved on this device.</Text>

      <Text style={styles.label}>Theme</Text>
      <View style={styles.themeGrid}>
        {THEME_PRESETS.map((t) => {
          const selected = t.id === themeId;
          return (
            <TouchableOpacity
              key={t.id}
              activeOpacity={0.85}
              style={[styles.themeCard, selected && styles.themeCardSelected]}
              onPress={() => setTheme(t.id)}
              accessibilityLabel={`${t.name} theme`}
            >
              <View style={[styles.swatchBox, { backgroundColor: t.swatch[2] }]}>
                <View style={[styles.swatchBar, { backgroundColor: t.swatch[0] }]} />
                <View style={[styles.swatchDot, { backgroundColor: t.swatch[1] }]} />
              </View>
              <View style={styles.themeNameRow}>
                <Text style={styles.themeName}>{t.name}</Text>
                {selected && <Check size={14} color={colors.accent} />}
              </View>
              <Text style={styles.themeKind}>{t.dark ? 'Dark' : 'Light'}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.label}>Accent colour</Text>
      <View style={styles.accentRow}>
        {ACCENT_SWATCHES.map((hex) => {
          const selected = accent === hex;
          return (
            <TouchableOpacity
              key={hex}
              onPress={() => setAccent(hex)}
              style={[styles.accentDot, { backgroundColor: hex }, selected && styles.accentDotSelected]}
              accessibilityLabel={`Accent ${hex}`}
            >
              {selected && <Check size={16} color="#FFFFFF" />}
            </TouchableOpacity>
          );
        })}
      </View>
      {accent && (
        <TouchableOpacity style={styles.linkBtn} onPress={() => setAccent(null)}>
          <Text style={styles.linkText}>Use the theme's own accent</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.label}>Preview</Text>
      <Card style={styles.previewCard}>
        <View style={styles.previewTop}>
          <Text style={styles.previewTitle}>JOB-0001</Text>
          <Badge label="In progress" variant="primary" size="sm" />
        </View>
        <Text style={styles.previewBody}>Sample card showing how your colours look.</Text>
        <View style={styles.previewTrack}>
          <View style={styles.previewFill} />
        </View>
        <View style={styles.previewBtn}>
          <Text style={styles.previewBtnText}>Primary action</Text>
        </View>
      </Card>

      <TouchableOpacity style={styles.resetBtn} onPress={resetTheme}>
        <RotateCcw size={16} color={colors.textSecondary} />
        <Text style={styles.resetText}>Reset to default</Text>
      </TouchableOpacity>

      <Text style={[styles.heading, styles.accountHeading]}>Account</Text>
      <Card style={styles.accountCard}>
        <Text style={styles.accountName}>{user?.name || user?.username || '—'}</Text>
        <Text style={styles.accountMeta}>{user?.roleName || user?.roleType || ''}</Text>
        {user?.email ? <Text style={styles.accountMeta}>{user.email}</Text> : null}
      </Card>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <LogOut size={16} color={colors.danger} />
        <Text style={styles.logoutText}>Sign out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = themedStyles(() =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
    heading: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
    accountHeading: { marginTop: spacing.xxl, marginBottom: spacing.md },
    help: { fontSize: 13, color: colors.textSecondary, marginTop: 4, marginBottom: spacing.lg },
    label: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.8,
      color: colors.textMuted,
      textTransform: 'uppercase',
      marginTop: spacing.md,
      marginBottom: spacing.sm,
    },
    themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
    themeCard: {
      width: '47.5%',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.sm,
      borderWidth: 2,
      borderColor: 'transparent',
      ...shadows.sm,
    },
    themeCardSelected: { borderColor: colors.accent },
    swatchBox: {
      height: 64,
      borderRadius: borderRadius.md,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    },
    swatchBar: { height: 22 },
    swatchDot: { position: 'absolute', right: 10, bottom: 10, width: 22, height: 22, borderRadius: 11 },
    themeNameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm },
    themeName: { fontSize: 14, fontWeight: '800', color: colors.textPrimary },
    themeKind: { fontSize: 11, color: colors.textMuted, marginBottom: 2 },
    accentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
    accentDot: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
    accentDotSelected: { borderWidth: 3, borderColor: colors.surface, ...shadows.md },
    linkBtn: { marginTop: spacing.md },
    linkText: { fontSize: 13, fontWeight: '700', color: colors.accent },
    previewCard: { marginTop: 0 },
    previewTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    previewTitle: { fontSize: 15, fontWeight: '800', color: colors.primary },
    previewBody: { fontSize: 13, color: colors.textSecondary, marginVertical: spacing.sm },
    previewTrack: { height: 6, borderRadius: 3, backgroundColor: colors.surfaceSubtle, overflow: 'hidden' },
    previewFill: { width: '60%', height: '100%', backgroundColor: colors.accent },
    previewBtn: {
      marginTop: spacing.md,
      backgroundColor: colors.accent,
      borderRadius: borderRadius.md,
      paddingVertical: 12,
      alignItems: 'center',
    },
    previewBtnText: { color: colors.textInverse, fontWeight: '800', fontSize: 14 },
    resetBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      marginTop: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surfaceSubtle,
    },
    resetText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
    accountCard: { gap: 2 },
    accountName: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
    accountMeta: { fontSize: 13, color: colors.textSecondary },
    logoutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      marginTop: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      backgroundColor: colors.dangerLight,
    },
    logoutText: { fontSize: 14, fontWeight: '700', color: colors.danger },
  })
);
