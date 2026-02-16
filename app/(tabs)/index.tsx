import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHabitStore } from '../../src/store/habitStore';
import { getToday, formatDateDisplay, getGreeting } from '../../src/utils/date';
import { calculateGlobalStreak } from '../../src/utils/streak';
import { Colors } from '../../src/constants/colors';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../../src/constants/layout';
import { HabitCard } from '../../src/components/habit/HabitCard';
import { DailyProgress } from '../../src/components/dashboard/DailyProgress';
import { StreakDisplay } from '../../src/components/dashboard/StreakDisplay';

export default function DashboardScreen() {
  const today = getToday();
  const habits = useHabitStore((s) => s.habits);
  const logs = useHabitStore((s) => s.logs);
  const getHabitsForDate = useHabitStore((s) => s.getHabitsForDate);
  const getLogForHabitDate = useHabitStore((s) => s.getLogForHabitDate);
  const toggleHabitCompletion = useHabitStore((s) => s.toggleHabitCompletion);

  const todayHabits = useMemo(() => getHabitsForDate(today), [habits, today]);

  const completedCount = useMemo(
    () =>
      todayHabits.filter((h) => {
        const log = getLogForHabitDate(h.id, today);
        return log?.completed;
      }).length,
    [todayHabits, logs, today]
  );

  const globalStreak = useMemo(
    () => calculateGlobalStreak(logs, getHabitsForDate),
    [logs, habits]
  );

  // Simple best streak: max of globalStreak and any individual best
  const bestStreak = useMemo(() => {
    let best = globalStreak;
    // Check recent consecutive days
    let streak = 0;
    let d = today;
    for (let i = 0; i < 365; i++) {
      const dayHabits = getHabitsForDate(d);
      if (dayHabits.length === 0) {
        d = addDaysStr(d, -1);
        continue;
      }
      const allDone = dayHabits.every((h) =>
        logs.some((l) => l.habitId === h.id && l.date === d && l.completed)
      );
      if (allDone) {
        streak++;
        best = Math.max(best, streak);
      } else {
        streak = 0;
      }
      d = addDaysStr(d, -1);
    }
    return best;
  }, [logs, habits]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()} !</Text>
            <Text style={styles.date}>{formatDateDisplay(today)}</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/habit/create')}
          >
            <Ionicons name="add" size={28} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Progress */}
        <DailyProgress
          completed={completedCount}
          total={todayHabits.length}
        />

        {/* Streak */}
        <View style={styles.section}>
          <StreakDisplay
            currentStreak={globalStreak}
            bestStreak={bestStreak}
          />
        </View>

        {/* Habit List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Habitudes du jour ({todayHabits.length})
          </Text>
          {todayHabits.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons
                name="add-circle-outline"
                size={48}
                color={Colors.textMuted}
              />
              <Text style={styles.emptyText}>
                Aucune habitude pour aujourd'hui
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/habit/create')}
              >
                <Text style={styles.emptyLink}>Ajouter une habitude</Text>
              </TouchableOpacity>
            </View>
          ) : (
            todayHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                log={getLogForHabitDate(habit.id, today)}
                onToggle={() => toggleHabitCompletion(habit.id, today)}
                onPress={() => router.push(`/habit/${habit.id}`)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function addDaysStr(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d + days);
  const ny = date.getFullYear();
  const nm = String(date.getMonth() + 1).padStart(2, '0');
  const nd = String(date.getDate()).padStart(2, '0');
  return `${ny}-${nm}-${nd}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  greeting: {
    color: Colors.text,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
  },
  date: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.md,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    gap: Spacing.md,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: FontSize.md,
  },
  emptyLink: {
    color: Colors.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
});
