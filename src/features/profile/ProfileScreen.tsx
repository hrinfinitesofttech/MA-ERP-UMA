import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { Mail, User as UserIcon, Building2, BadgeCheck, Palette, LogOut } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { themedStyles } from '../../theme/themedStyles';
import { borderRadius, shadows, spacing } from '../../theme/spacing';
import { useAuth } from '../../context/AuthContext';

const MODULE_LABELS: Record<string, string> = {
  crm: 'CRM & Sales',
  sales: 'CRM & Sales',
  projects: 'Projects',
  designer: 'Design & Engineering',
  engineering: 'Design & Engineering',
  purchase: 'Purchase',
  store: 'Store & Warehouse',
  inventory: 'Store & Warehouse',
  production: 'Production',
  accounting: 'Accounts & Finance',
  finance: 'Accounts & Finance',
  maintenance: 'Maintenance',
  hr: 'HR & Payroll',
  integration: 'Integration',
  reports: 'Reports',
  settings: 'Settings',
  testing: 'Testing & Security',
};

const prettify = (s: string) => s.replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const initials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2)).toUpperCase();
};

const Row: React.FC<{ icon: React.ComponentType<any>; label: string; value?: string }> = ({ icon: Icon, label, value }) => (
  <View style={styles.row}>
    <View style={styles.rowIcon}>
      <Icon size={16} color={colors.primaryLight} />
    </View>
    <View style={styles.flex}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value || '—'}</Text>
    </View>
  </View>
);

export const ProfileScreen: React.FC<{ onOpenSettings: () => void }> = ({ onOpenSettings }) => {
  const { user, refreshUser, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    refreshUser();
  }, []);

  const name = user?.name || user?.username || 'User';
  const modules = (user?.assignedModules ?? []).filter(Boolean);
  const fullAccess = modules.length === 0 || modules.some((m) => m.toLowerCase() === 'all');
  const accessible = fullAccess
    ? ['Full access to all modules']
    : Array.from(new Set(modules.map((m) => MODULE_LABELS[m.toLowerCase()] ?? prettify(m))));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await refreshUser();
            setRefreshing(false);
          }}
          colors={[colors.accent]}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(name)}</Text>
        </View>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.roleChip}>
          <Text style={styles.roleText}>{user?.roleName || prettify(user?.roleType || 'Team member')}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Row icon={UserIcon} label="Username" value={user?.username} />
        <Row icon={Mail} label="Email" value={user?.email} />
        <Row icon={Building2} label="Department" value={user?.departmentName || user?.department} />
        <Row icon={BadgeCheck} label="Status" value={user?.isActive === false ? 'Inactive' : 'Active'} />
      </View>

      <Text style={styles.sectionTitle}>Module access</Text>
      <View style={styles.chips}>
        {accessible.map((m) => (
          <View key={m} style={styles.chip}>
            <Text style={styles.chipText}>{m}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.action} onPress={onOpenSettings} activeOpacity={0.85}>
        <Palette size={18} color={colors.accent} />
        <Text style={styles.actionText}>Appearance & theme</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logout} onPress={logout} activeOpacity={0.85}>
        <LogOut size={18} color={colors.danger} />
        <Text style={styles.logoutText}>Sign out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = themedStyles(() =>
  StyleSheet.create({
    flex: { flex: 1 },
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
    hero: {
      alignItems: 'center',
      backgroundColor: colors.header,
      borderRadius: borderRadius.xl,
      paddingVertical: spacing.xxl,
      marginBottom: spacing.lg,
      ...shadows.md,
    },
    avatar: {
      width: 84,
      height: 84,
      borderRadius: 42,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    avatarText: { fontSize: 30, fontWeight: '900', color: colors.textInverse },
    name: { fontSize: 20, fontWeight: '800', color: colors.textInverse },
    roleChip: {
      marginTop: spacing.sm,
      backgroundColor: 'rgba(255,255,255,0.14)',
      paddingHorizontal: spacing.md,
      paddingVertical: 5,
      borderRadius: borderRadius.full,
    },
    roleText: { fontSize: 12, fontWeight: '700', color: colors.textInverse },
    card: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      ...shadows.sm,
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
    rowIcon: {
      width: 34,
      height: 34,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.primarySubtle,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowLabel: { fontSize: 11, fontWeight: '700', color: colors.textMuted },
    rowValue: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginTop: 1 },
    sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.textPrimary, marginTop: spacing.xl, marginBottom: spacing.md },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    chip: { backgroundColor: colors.surface, borderRadius: borderRadius.full, paddingHorizontal: spacing.md, paddingVertical: 7, borderWidth: 1, borderColor: colors.border },
    chipText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
    action: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      marginTop: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      backgroundColor: colors.accentLight,
    },
    actionText: { fontSize: 14, fontWeight: '800', color: colors.accentDark },
    logout: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      marginTop: spacing.md,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      backgroundColor: colors.dangerLight,
    },
    logoutText: { fontSize: 14, fontWeight: '800', color: colors.danger },
  })
);
