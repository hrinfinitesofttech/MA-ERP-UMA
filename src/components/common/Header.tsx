import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Menu, Bell } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { themedStyles } from '../../theme/themedStyles';
import { borderRadius, spacing } from '../../theme/spacing';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onOpenDrawer: () => void;
  onOpenProfile?: () => void;
  onOpenNotifications?: () => void;
  unreadCount?: number;
  title?: string;
}

const getInitials = (name?: string) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
};

export const Header: React.FC<HeaderProps> = ({ onOpenDrawer, onOpenProfile, onOpenNotifications, unreadCount = 0, title }) => {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onOpenDrawer} style={styles.iconButton} activeOpacity={0.7} accessibilityLabel="Open menu">
        <Menu size={20} color={colors.textInverse} />
      </TouchableOpacity>

      <View style={styles.titleWrap}>
        <Text style={styles.title} numberOfLines={1}>
          {title || 'UMA TECHNO FAB'}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {user?.name || user?.username || 'Manufacturing ERP'}
        </Text>
      </View>

      <TouchableOpacity style={styles.iconButton} activeOpacity={0.7} onPress={onOpenNotifications} accessibilityLabel="Notifications">
        <Bell size={18} color={colors.textInverse} />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={styles.avatar} onPress={onOpenProfile} activeOpacity={0.8} accessibilityLabel="Profile">
        <Text style={styles.avatarText}>{getInitials(user?.name || user?.username)}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = themedStyles(() => StyleSheet.create({
  container: {
    backgroundColor: colors.header,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.header,
  },
  badgeText: { fontSize: 10, fontWeight: '800', color: colors.textInverse },
  titleWrap: { flex: 1, marginHorizontal: spacing.xs },
  title: { fontSize: 17, fontWeight: '800', color: colors.textInverse, letterSpacing: 0.2 },
  subtitle: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginTop: 1 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 13, fontWeight: '800', color: colors.textInverse },
}));
