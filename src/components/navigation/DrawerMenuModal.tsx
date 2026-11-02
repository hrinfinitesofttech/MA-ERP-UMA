import React from 'react';
import { Modal, View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Pressable } from 'react-native';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Compass,
  ShoppingBag,
  Warehouse,
  Factory,
  Landmark,
  Settings,
  X,
  LogOut,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { themedStyles } from '../../theme/themedStyles';
import { borderRadius, shadows, spacing } from '../../theme/spacing';
import { useAuth } from '../../context/AuthContext';

interface DrawerMenuModalProps {
  visible: boolean;
  onClose: () => void;
  activeRoute: string;
  onSelectRoute: (routeName: string) => void;
}

export const ERP_MODULES = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'crm_sales', name: 'CRM & Sales', icon: Users },
  { id: 'project_management', name: 'Projects', icon: FolderKanban },
  { id: 'designer_engineering', name: 'Design & Engineering', icon: Compass },
  { id: 'purchase_management', name: 'Purchase', icon: ShoppingBag },
  { id: 'store_warehouse', name: 'Store & Warehouse', icon: Warehouse },
  { id: 'production_shop_floor', name: 'Production', icon: Factory },
  { id: 'accounting_finance', name: 'Accounts & Finance', icon: Landmark },
  { id: 'settings', name: 'Settings & Theme', icon: Settings },
];

export const DrawerMenuModal: React.FC<DrawerMenuModalProps> = ({ visible, onClose, activeRoute, onSelectRoute }) => {
  const { user, logout } = useAuth();
  const displayName = user?.name || user?.username || 'User';

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.drawer}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.logo}>
                <Image source={require('../../../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
              </View>
              <View style={styles.flex}>
                <Text style={styles.company}>UMA TECHNO FAB</Text>
                <Text style={styles.tagline}>Manufacturing ERP</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel="Close menu">
                <X size={18} color={colors.textInverse} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.userRow}
              activeOpacity={0.8}
              onPress={() => {
                onSelectRoute('profile');
                onClose();
              }}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{displayName[0].toUpperCase()}</Text>
              </View>
              <View style={styles.flex}>
                <Text style={styles.userName} numberOfLines={1}>{displayName}</Text>
                <Text style={styles.userRole} numberOfLines={1}>{user?.roleName || user?.roleType || 'Team member'}</Text>
              </View>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.flex} contentContainerStyle={styles.menuContent} showsVerticalScrollIndicator={false}>
            {ERP_MODULES.map((item) => {
              const selected = activeRoute === item.id;
              const Icon = item.icon;
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  style={[styles.menuItem, selected && styles.menuItemActive]}
                  onPress={() => {
                    onSelectRoute(item.id);
                    onClose();
                  }}
                >
                  <View style={[styles.menuIcon, selected && styles.menuIconActive]}>
                    <Icon size={18} color={selected ? colors.textInverse : colors.primary} />
                  </View>
                  <Text style={[styles.menuTitle, selected && styles.menuTitleActive]}>{item.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => {
              onClose();
              logout();
            }}
          >
            <LogOut size={16} color={colors.danger} />
            <Text style={styles.logoutText}>Sign out</Text>
          </TouchableOpacity>
        </SafeAreaView>
        <Pressable style={styles.flex} onPress={onClose} />
      </View>
    </Modal>
  );
};

const styles = themedStyles(() => StyleSheet.create({
  flex: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(13, 23, 48, 0.55)', flexDirection: 'row' },
  drawer: {
    width: '82%',
    maxWidth: 320,
    backgroundColor: colors.background,
    borderTopRightRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  header: { backgroundColor: colors.header, padding: spacing.lg, paddingBottom: spacing.xl },
  headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg, gap: spacing.md },
  logo: {
    width: 64,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  logoImage: { width: '100%', height: '100%' },
  company: { fontSize: 15, fontWeight: '800', color: colors.textInverse, letterSpacing: 0.4 },
  tagline: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.primary, fontWeight: '800', fontSize: 14 },
  userName: { fontSize: 14, fontWeight: '700', color: colors.textInverse },
  userRole: { fontSize: 11, color: 'rgba(255,255,255,0.65)' },
  menuContent: { padding: spacing.md, gap: spacing.xs },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
  },
  menuItemActive: { backgroundColor: colors.surface, ...shadows.sm },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconActive: { backgroundColor: colors.accent },
  menuTitle: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  menuTitleActive: { color: colors.textPrimary, fontWeight: '800' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    margin: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.dangerLight,
  },
  logoutText: { fontSize: 13, fontWeight: '700', color: colors.danger },
}));
