import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { colors } from '../../theme/colors';
import { borderRadius, spacing } from '../../theme/spacing';
import { ArrowLeft, Clock, ShieldAlert } from 'lucide-react-native';

interface ModulePlaceholderScreenProps {
  moduleId: string;
  moduleName: string;
  phaseNumber: number;
  onBackToDashboard: () => void;
}

export const ModulePlaceholderScreen: React.FC<ModulePlaceholderScreenProps> = ({
  moduleId,
  moduleName,
  phaseNumber,
  onBackToDashboard,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={onBackToDashboard}>
        <ArrowLeft size={16} color={colors.primary} />
        <Text style={styles.backBtnText}>Back to Dashboard</Text>
      </TouchableOpacity>

      <Card style={styles.card}>
        <Badge label={`Phase ${phaseNumber} Roadmap`} variant="warning" size="md" />
        <Text style={styles.title}>{moduleName}</Text>
        <Text style={styles.description}>
          This module is part of the sequential delivery roadmap. Phase 1 (Dashboard) is currently completed and live.
        </Text>

        <View style={styles.infoBox}>
          <Clock size={16} color={colors.bronze} />
          <Text style={styles.infoText}>
            Development commences in Phase {phaseNumber} following approval and testing of earlier phases.
          </Text>
        </View>

        <TouchableOpacity style={styles.returnBtn} onPress={onBackToDashboard}>
          <Text style={styles.returnBtnText}>Return to Executive Command Center</Text>
        </TouchableOpacity>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.md,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  card: {
    padding: spacing.xl,
    alignItems: 'center',
    textAlign: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bronzeLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  infoText: {
    fontSize: 11.5,
    color: colors.bronze,
    fontWeight: '600',
    flex: 1,
  },
  returnBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
  },
  returnBtnText: {
    color: colors.textInverse,
    fontSize: 13,
    fontWeight: '700',
  },
});
