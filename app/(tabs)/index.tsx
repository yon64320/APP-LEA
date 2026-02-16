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
import { LevelUpModal } from '../../src/components/gamification/LevelUpModal';

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
          <View style={styles.headerLeft}>
            <Text style={styles.appName}>HabitFlow</Text>
            <Text style={styles.greeting}>Bonjour, Alexandre</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/settings')}
          >
            <View style={styles.profileIcon}>
              <View style={styles.profileDot} />
            </View>
            <View style={styles.statusDot} />
          </TouchableOpacity>
        </View>

        {/* Progress */}
        <DailyProgress
          completed={completedCount}
          total={todayHabits.length}
        />

        {/* Habit List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Habitudes du jour</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllLink}>
                Tout voir <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
              </Text>
            </TouchableOpacity>
          </View>
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

        {/* Quick Quote or Tip */}
        <View style={styles.quoteCard}>
          <Text style={styles.quoteText}>
            "La motivation vous fait démarrer. L'habitude vous fait continuer."
          </Text>
        </View>
      </ScrollView>

      {/* FAB Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/habit/create')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Level Up Modal */}
      <LevelUpModal />
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
    paddingHorizontal: Spacing.xl,
    paddingBottom: 120, // pb-24 + nav bar height
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  appName: {
    color: Colors.primary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  greeting: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    opacity: 0.8,
  },
  profileButton: {
    position: 'relative',
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: 'rgba(128, 0, 0, 0.2)',
    overflow: 'hidden',
  },
  profileDot: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E0E0E0', // Placeholder pour image
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981', // green-500
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  section: {
    marginTop: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  seeAllLink: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quoteCard: {
    marginTop: Spacing.xl,
    padding: Spacing.md,
    backgroundColor: 'rgba(128, 0, 0, 0.05)', // bg-primary/5
    borderRadius: 12, // rounded-xl
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  quoteText: {
    color: '#666666', // text-gray-600
    fontSize: FontSize.sm,
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    bottom: 96, // above nav bar
    right: Spacing.xl,
    width: 56, // size-14
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 30,
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
