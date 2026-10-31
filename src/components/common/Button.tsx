import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { colors } from '../../theme/colors';
import { borderRadius, shadows, spacing } from '../../theme/spacing';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  icon,
}) => {
  const getVariantStyles = (): { btn: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'secondary':
        return {
          btn: { backgroundColor: colors.surfaceSubtle, borderWidth: 1, borderColor: colors.border },
          text: { color: colors.textPrimary },
        };
      case 'accent':
        return {
          btn: { backgroundColor: colors.accent },
          text: { color: colors.textInverse },
        };
      case 'outline':
        return {
          btn: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
          text: { color: colors.primary },
        };
      case 'danger':
        return {
          btn: { backgroundColor: colors.danger },
          text: { color: colors.textInverse },
        };
      case 'ghost':
        return {
          btn: { backgroundColor: 'transparent' },
          text: { color: colors.primary },
        };
      case 'primary':
      default:
        return {
          btn: { backgroundColor: colors.primary },
          text: { color: colors.textInverse },
        };
    }
  };

  const { btn, text } = getVariantStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        btn,
        size === 'sm' && styles.sm,
        size === 'lg' && styles.lg,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={text.color || colors.textInverse} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text
            style={[
              styles.text,
              text,
              size === 'sm' && styles.textSm,
              size === 'lg' && styles.textLg,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  sm: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
  },
  lg: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  text: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  textSm: {
    fontSize: 12,
  },
  textLg: {
    fontSize: 16,
  },
  disabled: {
    opacity: 0.5,
  },
});
