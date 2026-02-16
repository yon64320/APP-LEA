import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/layout';
import { ProgressRing } from '../ui/ProgressRing';

interface DailyProgressProps {
  completed: number;
  total: number;
}

export function DailyProgress({ completed, total }: DailyProgressProps) {
  const rate = total > 0 ? completed / total : 0;
  const percentage = Math.round(rate * 100);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ProgressRing progress={rate} size={96} showPercentage={true} />
        <View style={styles.textSection}>
          <Text style={styles.label}>AUJOURD'HUI</Text>
          <Text style={styles.percentage}>{percentage}% COMPLÉTÉ</Text>
          <Text style={styles.subtitle}>
            Objectif atteint à {completed} sur {total}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF', // bg-white
    borderRadius: 12, // rounded-xl
    padding: Spacing.xl, // p-6
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl, // gap-6
  },
  textSection: {
    flex: 1,
    gap: 4, // gap-1
  },
  label: {
    color: 'rgba(128, 0, 0, 0.6)', // text-primary/60
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    letterSpacing: 2, // uppercase tracking-widest
    textTransform: 'uppercase',
  },
  percentage: {
    color: Colors.text, // text-[#1d0c0c]
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  subtitle: {
    color: '#666666', // text-gray-500
    fontSize: FontSize.sm,
  },
});
