import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/layout';
import { ProgressBar } from '../ui/ProgressBar';

interface DailyProgressProps {
  completed: number;
  total: number;
}

export function DailyProgress({ completed, total }: DailyProgressProps) {
  const rate = total > 0 ? completed / total : 0;
  const percentage = Math.round(rate * 100);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Progression du jour</Text>
        <Text style={styles.percentage}>{percentage}%</Text>
      </View>
      <ProgressBar
        progress={rate}
        color={
          percentage === 100
            ? Colors.success
            : percentage >= 50
              ? Colors.accent
              : Colors.primary
        }
        height={10}
      />
      <Text style={styles.subtitle}>
        {completed}/{total} habitude{total > 1 ? 's' : ''} complétée{completed > 1 ? 's' : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  percentage: {
    color: Colors.primaryLight,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginTop: Spacing.sm,
  },
});
