import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHabitStore } from '../../src/store/habitStore';
import { getMonthlyCompletions } from '../../src/utils/stats';
import { calculateGlobalStreak } from '../../src/utils/streak';
import { Colors } from '../../src/constants/colors';
import { Spacing, FontSize, FontWeight } from '../../src/constants/layout';
import { CalendarHeatmap } from '../../src/components/history/CalendarHeatmap';
import { StatsCard } from '../../src/components/history/StatsCard';

export default function HistoryScreen() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const habits = useHabitStore((s) => s.habits);
  const logs = useHabitStore((s) => s.logs);
  const getHabitsForDate = useHabitStore((s) => s.getHabitsForDate);

  const completions = useMemo(
    () => getMonthlyCompletions(year, month, habits, logs, getHabitsForDate),
    [year, month, habits, logs]
  );

  const globalStreak = useMemo(
    () => calculateGlobalStreak(logs, getHabitsForDate),
    [logs, habits]
  );

  const monthlyRate = useMemo(() => {
    const withHabits = completions.filter((c) => c.total > 0);
    if (withHabits.length === 0) return 0;
    const totalRate = withHabits.reduce((sum, c) => sum + c.rate, 0);
    return totalRate / withHabits.length;
  }, [completions]);

  const totalCompletedThisMonth = useMemo(
    () => completions.reduce((sum, c) => sum + c.completed, 0),
    [completions]
  );

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Historique</Text>

        <CalendarHeatmap
          year={year}
          month={month}
          completions={completions}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />

        <View style={styles.statsRow}>
          <StatsCard
            icon="flame"
            iconColor={Colors.streakFire}
            label="Streak"
            value={globalStreak}
          />
          <StatsCard
            icon="analytics"
            iconColor={Colors.accent}
            label="Taux mensuel"
            value={`${Math.round(monthlyRate * 100)}%`}
          />
          <StatsCard
            icon="checkmark-done"
            iconColor={Colors.success}
            label="Ce mois"
            value={totalCompletedThisMonth}
          />
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
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  title: {
    color: Colors.text,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
});
