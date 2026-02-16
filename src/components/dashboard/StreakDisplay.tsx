import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/layout';

interface StreakDisplayProps {
  currentStreak: number;
  bestStreak: number;
}

export function StreakDisplay({ currentStreak, bestStreak }: StreakDisplayProps) {
  return (
    <View style={styles.container}>
      <View style={styles.streakItem}>
        <View style={styles.iconContainer}>
          <Ionicons name="flame" size={28} color={Colors.streakFire} />
        </View>
        <View>
          <Text style={styles.value}>{currentStreak}</Text>
          <Text style={styles.label}>Streak actuel</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.streakItem}>
        <View style={[styles.iconContainer, { backgroundColor: Colors.streakGold + '20' }]}>
          <Ionicons name="trophy" size={28} color={Colors.streakGold} />
        </View>
        <View>
          <Text style={styles.value}>{bestStreak}</Text>
          <Text style={styles.label}>Meilleur streak</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    alignItems: 'center',
  },
  streakItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.streakFire + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    color: Colors.text,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.surfaceBorder,
    marginHorizontal: Spacing.md,
  },
});
