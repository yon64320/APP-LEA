import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHabitStore } from '../../src/store/habitStore';
import { HabitCard } from '../../src/components/habit/HabitCard';
import { Colors } from '../../src/constants/colors';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../../src/constants/layout';
import { formatDateDisplay } from '../../src/utils/date';

export default function DayDetailScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  
  if (!date) {
    router.back();
    return null;
  }

  const habits = useHabitStore((s) => s.habits);
  const logs = useHabitStore((s) => s.logs);
  const getHabitsForDate = useHabitStore((s) => s.getHabitsForDate);
  const getLogForHabitDate = useHabitStore((s) => s.getLogForHabitDate);
  const toggleHabitCompletion = useHabitStore((s) => s.toggleHabitCompletion);

  const dayHabits = useMemo(() => getHabitsForDate(date), [habits, date]);
  
  const completedCount = useMemo(
    () =>
      dayHabits.filter((h) => {
        const log = getLogForHabitDate(h.id, date);
        return log?.completed;
      }).length,
    [dayHabits, logs, date]
  );

  const dateObj = new Date(date + 'T00:00:00');
  const dayName = dateObj.toLocaleDateString('fr-FR', { weekday: 'long' });
  const formattedDate = formatDateDisplay(date);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{dayName}</Text>
          <Text style={styles.headerSubtitle}>{formattedDate}</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Summary */}
        <View style={styles.progressCard}>
          <Text style={styles.progressLabel}>Progression du jour</Text>
          <Text style={styles.progressValue}>
            {completedCount}/{dayHabits.length} habitude{dayHabits.length > 1 ? 's' : ''} complétée{completedCount > 1 ? 's' : ''}
          </Text>
        </View>

        {/* Habits List */}
        <View style={styles.habitsSection}>
          <Text style={styles.sectionTitle}>
            Habitudes du jour ({dayHabits.length})
          </Text>
          {dayHabits.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons
                name="calendar-outline"
                size={48}
                color={Colors.textMuted}
              />
              <Text style={styles.emptyText}>
                Aucune habitude prévue pour ce jour
              </Text>
            </View>
          ) : (
            dayHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                log={getLogForHabitDate(habit.id, date)}
                onToggle={() => toggleHabitCompletion(habit.id, date)}
                onPress={() => router.push(`/habit/${habit.id}`)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    textTransform: 'capitalize',
  },
  headerSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.05)',
  },
  progressLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: 'rgba(128, 0, 0, 0.6)',
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  progressValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  habitsSection: {
    gap: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    gap: Spacing.md,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: FontSize.md,
    textAlign: 'center',
  },
});
