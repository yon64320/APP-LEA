import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Challenge, ActiveChallenge } from '../../types';
import { useChallengeStore } from '../../store/challengeStore';
import { getToday } from '../../utils/date';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/layout';
import { ProgressBar } from '../ui/ProgressBar';

interface ChallengeCardProps {
  challenge: Challenge;
  activeChallenge?: ActiveChallenge;
  onPress: () => void;
}

export function ChallengeCard({
  challenge,
  activeChallenge,
  onPress,
}: ChallengeCardProps) {
  const isCompleted = useChallengeStore((s) =>
    s.isChallengeCompleted(challenge.id)
  );
  const isActive = !!activeChallenge;

  const progress = useMemo(() => {
    if (!activeChallenge) return 0;
    const today = getToday();
    const start = new Date(activeChallenge.startDate + 'T00:00:00');
    const end = new Date(activeChallenge.endDate + 'T00:00:00');
    const current = new Date(today + 'T00:00:00');
    const totalDays = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    const elapsedDays = Math.ceil(
      (current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.min(Math.max(elapsedDays / totalDays, 0), 1);
  }, [activeChallenge]);

  const daysRemaining = useMemo(() => {
    if (!activeChallenge) return null;
    const today = getToday();
    const end = new Date(activeChallenge.endDate + 'T00:00:00');
    const current = new Date(today + 'T00:00:00');
    const diff = Math.ceil(
      (end.getTime() - current.getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.max(0, diff);
  }, [activeChallenge]);

  const statusColor = isCompleted
    ? Colors.success
    : isActive
      ? challenge.color
      : 'rgba(128, 0, 0, 0.3)';

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isActive && { borderColor: challenge.color, borderWidth: 2 },
        isCompleted && { borderColor: Colors.success, borderWidth: 2 },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: statusColor + '20',
              borderColor: statusColor,
            },
          ]}
        >
          <Ionicons
            name={challenge.icon as keyof typeof Ionicons.glyphMap}
            size={24}
            color={statusColor}
          />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name}>{challenge.name}</Text>
          <Text style={styles.duration}>{challenge.duration} jours</Text>
        </View>
        {isCompleted && (
          <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
        )}
        {isActive && !isCompleted && (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>En cours</Text>
          </View>
        )}
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {challenge.description}
      </Text>

      {isActive && (
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>
              {activeChallenge.completedDays} / {challenge.duration} jours
            </Text>
            {daysRemaining !== null && (
              <Text style={styles.daysRemaining}>
                {daysRemaining} jour{daysRemaining > 1 ? 's' : ''} restant
                {daysRemaining > 1 ? 's' : ''}
              </Text>
            )}
          </View>
          <ProgressBar
            progress={progress}
            color={challenge.color}
            height={6}
            animated
          />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.1)',
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginBottom: 2,
  },
  duration: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  activeBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  description: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    lineHeight: 20,
  },
  progressSection: {
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  daysRemaining: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
});
