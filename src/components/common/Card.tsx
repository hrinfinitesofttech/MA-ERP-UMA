import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { themedStyles } from '../../theme/themedStyles';
import { borderRadius, shadows, spacing } from '../../theme/spacing';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'subtle' | 'elevated' | 'outline';
}

export const Card: React.FC<CardProps> = ({ children, style, variant = 'default' }) => (
  <View
    style={[
      styles.base,
      variant === 'elevated' && styles.elevated,
      variant === 'subtle' && styles.subtle,
      variant === 'outline' && styles.outline,
      style,
    ]}
  >
    {children}
  </View>
);

const styles = themedStyles(() => StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  elevated: {
    ...shadows.md,
    borderColor: 'transparent',
  },
  subtle: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 0,
    shadowOpacity: 0,
  },
}));
