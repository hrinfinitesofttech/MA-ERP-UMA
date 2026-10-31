import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { borderRadius, spacing } from '../../theme/spacing';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'purple' | 'neutral';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  style,
}) => {
  const getBadgeStyle = (): { bg: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'success':
        return {
          bg: { backgroundColor: colors.successLight, borderColor: colors.successBorder },
          text: { color: colors.success },
        };
      case 'warning':
        return {
          bg: { backgroundColor: colors.warningLight, borderColor: colors.warningBorder },
          text: { color: colors.warning },
        };
      case 'danger':
        return {
          bg: { backgroundColor: colors.dangerLight, borderColor: colors.dangerBorder },
          text: { color: colors.danger },
        };
      case 'purple':
        return {
          bg: { backgroundColor: colors.purpleLight, borderColor: colors.purpleBorder },
          text: { color: colors.purple },
        };
      case 'neutral':
        return {
          bg: { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
          text: { color: colors.textSecondary },
        };
      case 'primary':
      default:
        return {
          bg: { backgroundColor: colors.accentLight, borderColor: colors.accent },
          text: { color: colors.accentDark },
        };
    }
  };

  const { bg, text } = getBadgeStyle();

  return (
    <View
      style={[
        styles.base,
        bg,
        size === 'sm' && styles.sm,
        style,
      ]}
    >
      <Text style={[styles.text, text, size === 'sm' && styles.textSm]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  sm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  textSm: {
    fontSize: 10,
  },
});
