import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGamificationStore } from '../../store/gamificationStore';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/layout';
import { ProgressBar } from '../ui/ProgressBar';

export function XPBar() {
  const level = useGamificationStore((s) => s.level);
  const xpProgress = useGamificationStore((s) => s.getXPProgress());
  const xpForNextLevel = useGamificationStore((s) => s.getXPForNextLevel());
  const currentXP = useGamificationStore((s) => s.xp);
  const xpInCurrentLevel = currentXP % xpForNextLevel;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.levelText}>Niveau {level}</Text>
        <Text style={styles.xpText}>
          {xpInCurrentLevel}/{xpForNextLevel} XP
        </Text>
      </View>
      <ProgressBar
        progress={xpProgress}
        color={Colors.primary}
        height={8}
        animated
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  xpText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
});
