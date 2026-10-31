import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Pressable,
} from 'react-native';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Compass,
  ShoppingBag,
  Warehouse,
  Factory,
  Landmark,
  Wrench,
  UserCheck,
  Share2,
  ShieldCheck,
  Settings,
  ChevronRight,
  X,
  LogOut,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { borderRadius, shadows, spacing } from '../../theme/spacing';
import { useAuth } from '../../context/AuthContext';

interface DrawerMenuModalProps {
  visible: boolean;
  onClose: () => void;
  activeRoute: string;
  onSelectRoute: (routeName: string) => void;
}

export const ERP_MODULES = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, phase: 1, active: true },
  { id: 'crm_sales', name: 'CRM & Sales', icon: Users, phase: 2, active: true },
  { id: 'project_management', name: 'Project Management', icon: FolderKanban, phase: 3, active: true },
  { id: 'designer_engineering', name: 'Designer & Engineering', icon: Compass, phase: 4, active: true },
  { id: 'purchase_management', name: 'Purchase Management', icon: ShoppingBag, phase: 5, active: true },
  { id: 'store_warehouse', name: 'Store & Warehouse', icon: Warehouse, phase: 6, active: true },
  { id: 'production_shop_floor', name: 'Production & Shop Floor', icon: Factory, phase: 7, active: true },
  { id: 'accounting_finance', name: 'Accounting & Finance', icon: Landmark, phase: 8, active: true },
  { id: 'maintenance_services', name: 'Maintenance & Services', icon: Wrench, phase: 9, active: false },
  { id: 'hr_payroll', name: 'HR & Payroll', icon: UserCheck, phase: 10, active: false },
  { id: 'integration_360', name: 'Integration & 360°', icon: Share2, phase: 11, active: false },
  { id: 'testing_security', name: 'Testing & Security', icon: ShieldCheck, phase: 12, active: false },
  { id: 'foundation_admin', name: 'Foundation & Admin', icon: Settings, phase: 13, active: false },
];

export const DrawerMenuModal: React.FC<DrawerMenuModalProps> = ({
  visible,
  onClose,
  activeRoute,
  onSelectRoute,
}) => {
  const { user, logout } = useAuth();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <SafeAreaView style={styles.drawerContainer}>
          {/* Top Brand Card */}
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <View style={styles.logoIcon}>
                <Settings size={20} color={colors.textInverse} />
              </View>
              <View style={styles.brandTextContainer}>
                <Text style={styles.companyName}>UMA TECHNO FAB</Text>
                <Text style={styles.companyTagline}>Manufacturing ERP</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* User Profile Bar */}
            <View style={styles.userProfileCard}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                  {(user?.name || user?.username || 'U')[0].toUpperCase()}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName} numberOfLines={1}>
                  {user?.name || user?.username || 'Employee'}
                </Text>
                <Text style={styles.userRole} numberOfLines={1}>
                  {user?.roleName || user?.roleType || 'Authorized User'}
                </Text>
              </View>
            </View>
          </View>

          {/* Module Nav Items */}
          <ScrollView
            style={styles.menuScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.menuContent}
          >
            {ERP_MODULES.map((item) => {
              const isSelected = activeRoute === item.id;
              const IconComponent = item.icon;

              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  style={[
                    styles.menuItem,
                    isSelected && styles.menuItemActive,
                  ]}
                  onPress={() => {
                    onSelectRoute(item.id);
                    onClose();
                  }}
                >
                  <View style={styles.menuLeft}>
                    <IconComponent
                      size={20}
                      color={isSelected ? colors.textInverse : colors.primary}
                    />
                    <Text
                      style={[
                        styles.menuTitle,
                        isSelected && styles.menuTitleActive,
                      ]}
                    >
                      {item.name}
                    </Text>
                  </View>

                  {!item.active ? (
                    <View style={styles.phaseBadge}>
                      <Text style={styles.phaseBadgeText}>P{item.phase}</Text>
                    </View>
                  ) : (
                    <ChevronRight
                      size={18}
                      color={isSelected ? colors.textInverse : colors.textMuted}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Bottom Brand Card from ERP Reference Image */}
          <View style={styles.footer}>
            <View style={styles.partnershipCard}>
              <View style={styles.partnershipCircle}>
                <Text style={styles.partnershipLetter}>N</Text>
              </View>
              <Text style={styles.partnershipText}>
                Quality | Innovation | Partnership
              </Text>
            </View>

            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={() => {
                onClose();
                logout();
              }}
            >
              <LogOut size={16} color={colors.danger} />
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
  },
  drawerContainer: {
    width: '84%',
    maxWidth: 320,
    backgroundColor: colors.surface,
    height: '100%',
    borderTopRightRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    ...shadows.lg,
  },
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoIcon: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  brandTextContainer: {
    flex: 1,
  },
  companyName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 0.4,
  },
  companyTagline: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  closeBtn: {
    padding: spacing.xs,
  },
  userProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.sm + 2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  userAvatarText: {
    color: colors.textInverse,
    fontWeight: '800',
    fontSize: 13,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  userRole: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  menuScroll: {
    flex: 1,
  },
  menuContent: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md - 1,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  menuItemActive: {
    backgroundColor: colors.primary,
    ...shadows.sm,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: spacing.md,
  },
  menuTitleActive: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  phaseBadge: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  phaseBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  partnershipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  partnershipCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  partnershipLetter: {
    color: colors.textInverse,
    fontWeight: '900',
    fontSize: 11,
  },
  partnershipText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    flex: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  logoutText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.danger,
  },
});
