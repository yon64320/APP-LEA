import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHabitStore } from '../../src/store/habitStore';
import { getMonthlyCompletions } from '../../src/utils/stats';
import { calculateGlobalStreak } from '../../src/utils/streak';
import { Colors } from '../../src/constants/colors';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../../src/constants/layout';

export default function HistoryScreen() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const habits = useHabitStore((s) => s.habits);
  const logs = useHabitStore((s) => s.logs);
  const getHabitsForDate = useHabitStore((s) => s.getHabitsForDate);

  const completions = useMemo(
    () => getMonthlyCompletions(year, month, habits, logs, getHabitsForDate),
    [year, month, habits, logs, selectedHabit]
  );

  const globalStreak = useMemo(
    () => calculateGlobalStreak(logs, getHabitsForDate),
    [logs, habits]
  );

  // Calculate best streak
  const bestStreak = useMemo(() => {
    let best = globalStreak;
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayHabits = getHabitsForDate(dateStr);
      if (dayHabits.length === 0) {
        streak = 0;
        continue;
      }
      const allDone = dayHabits.every((h) =>
        logs.some((l) => l.habitId === h.id && l.date === dateStr && l.completed)
      );
      if (allDone) {
        streak++;
        best = Math.max(best, streak);
      } else {
        streak = 0;
      }
    }
    return best;
  }, [logs, habits]);

  const monthlyRate = useMemo(() => {
    const withHabits = completions.filter((c) => c.total > 0);
    if (withHabits.length === 0) return 0;
    const totalRate = withHabits.reduce((sum, c) => sum + c.rate, 0);
    return totalRate / withHabits.length;
  }, [completions]);

  const totalCompleted = useMemo(
    () => logs.filter((l) => l.completed).length,
    [logs]
  );

  // Get recent activities
  const recentActivities = useMemo(() => {
    let filteredLogs = logs.filter((l) => l.completed);
    if (selectedHabit) {
      filteredLogs = filteredLogs.filter((l) => l.habitId === selectedHabit);
    }
    const recent = filteredLogs
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5)
      .map((log) => {
        const habit = habits.find((h) => h.id === log.habitId);
        return { log, habit };
      })
      .filter((item) => item.habit);
    return recent;
  }, [logs, habits, selectedHabit]);

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
  ];

  // Generate calendar data with day numbers
  const calendarData = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const data: Array<{ day: number; date: string; intensity: number }> = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      data.push({ day: 0, date: '', intensity: 0 });
    }
    
    // Add data for each day
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const completion = completions.find((c) => c.date === dateStr);
      let intensity = 0;
      if (completion && completion.total > 0) {
        const rate = completion.rate;
        if (rate === 1) intensity = 4;
        else if (rate >= 0.75) intensity = 3;
        else if (rate >= 0.5) intensity = 2;
        else if (rate > 0) intensity = 1;
      }
      data.push({ day, date: dateStr, intensity });
    }
    
    return data;
  }, [year, month, completions]);

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

  const handleDayPress = (date: string) => {
    if (date) {
      router.push(`/history/day?date=${date}`);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    date.setHours(0, 0, 0, 0);
    
    if (date.getTime() === today.getTime()) {
      return 'Aujourd\'hui';
    } else if (date.getTime() === yesterday.getTime()) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
    }
  };

  const formatTime = (dateStr: string) => {
    return '08:30'; // Placeholder
  };

  const selectedHabitName = selectedHabit
    ? habits.find((h) => h.id === selectedHabit)?.name || 'Toutes les habitudes'
    : 'Toutes les habitudes';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Historique</Text>
          <TouchableOpacity style={styles.calendarButton}>
            <Ionicons name="calendar-outline" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        
        {/* Filter Dropdown */}
        <TouchableOpacity
          style={styles.filterContainer}
          onPress={() => setShowFilter(true)}
        >
          <View style={styles.filterSelect}>
            <Text style={styles.filterText}>{selectedHabitName}</Text>
            <Ionicons name="chevron-down" size={20} color={Colors.primary} />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Calendar Section */}
        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.monthNavButton}>
              <Ionicons name="chevron-back" size={20} color={Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.calendarMonth}>
              {monthNames[month]} {year}
            </Text>
            <TouchableOpacity onPress={handleNextMonth} style={styles.monthNavButton}>
              <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Day labels */}
          <View style={styles.dayLabelsRow}>
            {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((label) => (
              <Text key={label} style={styles.dayLabel}>
                {label}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {calendarData.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.calendarDay,
                  item.day === 0 && styles.calendarDayEmpty,
                  {
                    backgroundColor:
                      item.intensity === 0
                        ? 'rgba(128, 0, 0, 0.05)'
                        : item.intensity === 1
                        ? 'rgba(128, 0, 0, 0.1)'
                        : item.intensity === 2
                        ? 'rgba(128, 0, 0, 0.3)'
                        : item.intensity === 3
                        ? 'rgba(128, 0, 0, 0.6)'
                        : Colors.primary,
                  },
                ]}
                onPress={() => item.date && handleDayPress(item.date)}
                disabled={item.day === 0}
              >
                {item.day > 0 && (
                  <Text
                    style={[
                      styles.calendarDayNumber,
                      item.intensity >= 3 && styles.calendarDayNumberLight,
                    ]}
                  >
                    {item.day}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Legend */}
          <View style={styles.legend}>
            <Text style={styles.legendText}>Moins</Text>
            <View style={styles.legendColors}>
              <View style={[styles.legendCell, { backgroundColor: 'rgba(128, 0, 0, 0.1)' }]} />
              <View style={[styles.legendCell, { backgroundColor: 'rgba(128, 0, 0, 0.3)' }]} />
              <View style={[styles.legendCell, { backgroundColor: 'rgba(128, 0, 0, 0.6)' }]} />
              <View style={[styles.legendCell, { backgroundColor: Colors.primary }]} />
            </View>
            <Text style={styles.legendText}>Plus</Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsSection}>
          {/* Main Streak Card */}
          <View style={styles.streakCard}>
            <View style={styles.streakContent}>
              <Text style={styles.streakLabel}>Série Actuelle vs Meilleure</Text>
              <View style={styles.streakNumbers}>
                <Text style={styles.streakValue}>{globalStreak} j</Text>
                <Text style={styles.streakRecord}>/ {bestStreak} j record</Text>
              </View>
              <View style={styles.streakProgressBar}>
                <View
                  style={[
                    styles.streakProgressFill,
                    { width: `${bestStreak > 0 ? (globalStreak / bestStreak) * 100 : 0}%` },
                  ]}
                />
              </View>
            </View>
            <Ionicons
              name="flame"
              size={96}
              color="rgba(255, 255, 255, 0.1)"
              style={styles.streakIcon}
            />
          </View>

          {/* Two Stats Cards */}
          <View style={styles.statsRow}>
            {/* Success Rate */}
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>TAUX DE RÉUSSITE</Text>
              <View style={styles.statValueRow}>
                <Text style={styles.statValue}>{Math.round(monthlyRate * 100)}%</Text>
                <View style={styles.statIconContainer}>
                  <Ionicons name="trending-up" size={20} color="#10B981" />
                </View>
              </View>
              <Text style={styles.statChange}>+4% depuis le mois dernier</Text>
            </View>

            {/* Total Completed */}
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>TOTAL TERMINÉES</Text>
              <View style={styles.statValueRow}>
                <Text style={styles.statValue}>{totalCompleted}</Text>
                <View style={[styles.statIconContainer, { backgroundColor: 'rgba(128, 0, 0, 0.1)' }]}>
                  <Ionicons name="checkmark-done" size={20} color={Colors.primary} />
                </View>
              </View>
              <Text style={styles.statSubtitle}>Toutes habitudes confondues</Text>
            </View>
          </View>
        </View>

        {/* Recent Activities */}
        <View style={styles.activitiesSection}>
          <Text style={styles.sectionTitle}>Activités Récentes</Text>
          <View style={styles.activitiesList}>
            {recentActivities.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.activityCard}
                onPress={() => router.push(`/habit/${item.habit!.id}`)}
              >
                <View style={styles.activityLeft}>
                  <View style={styles.activityIconContainer}>
                    <Ionicons
                      name={item.habit!.icon as keyof typeof Ionicons.glyphMap}
                      size={20}
                      color={Colors.primary}
                    />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityName}>{item.habit!.name}</Text>
                    <Text style={styles.activityTime}>
                      {formatDate(item.log.date)}, {formatTime(item.log.date)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.activityPoints}>+1</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilter}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFilter(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilter(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choisir une habitude</Text>
              <TouchableOpacity onPress={() => setShowFilter(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={[{ id: null, name: 'Toutes les habitudes' }, ...habits]}
              keyExtractor={(item) => item.id || 'all'}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.filterItem}
                  onPress={() => {
                    setSelectedHabit(item.id);
                    setShowFilter(false);
                  }}
                >
                  <Text
                    style={[
                      styles.filterItemText,
                      selectedHabit === item.id && styles.filterItemTextSelected,
                    ]}
                  >
                    {item.name}
                  </Text>
                  {selectedHabit === item.id && (
                    <Ionicons name="checkmark" size={20} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: 'rgba(248, 245, 245, 0.8)',
    gap: Spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  calendarButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  filterContainer: {
    position: 'relative',
  },
  filterSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.2)',
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  filterText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: 120,
    gap: Spacing.xl,
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  monthNavButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  calendarMonth: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  dayLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.sm,
  },
  dayLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: 'rgba(128, 0, 0, 0.5)',
    width: 40,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.md,
  },
  calendarDay: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDayEmpty: {
    backgroundColor: 'transparent',
  },
  calendarDayNumber: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text,
  },
  calendarDayNumberLight: {
    color: '#FFFFFF',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    justifyContent: 'center',
  },
  legendText: {
    fontSize: 10,
    color: 'rgba(128, 0, 0, 0.5)',
  },
  legendColors: {
    flexDirection: 'row',
    gap: 4,
  },
  legendCell: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  statsSection: {
    gap: Spacing.md,
  },
  streakCard: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: Spacing.lg,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  streakContent: {
    position: 'relative',
    zIndex: 10,
  },
  streakLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: Spacing.xs,
  },
  streakNumbers: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  streakValue: {
    fontSize: 30,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  streakRecord: {
    fontSize: FontSize.sm,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  streakProgressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  streakProgressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 9999,
  },
  streakIcon: {
    position: 'absolute',
    right: -16,
    bottom: -16,
    zIndex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: 'rgba(128, 0, 0, 0.5)',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statChange: {
    fontSize: 10,
    fontWeight: FontWeight.medium,
    color: '#10B981',
  },
  statSubtitle: {
    fontSize: 10,
    fontWeight: FontWeight.medium,
    color: 'rgba(128, 0, 0, 0.5)',
  },
  activitiesSection: {
    gap: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  activitiesList: {
    gap: Spacing.sm,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.05)',
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(128, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: FontSize.xs,
    color: 'rgba(128, 0, 0, 0.5)',
  },
  activityPoints: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingTop: Spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  filterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 0, 0, 0.05)',
  },
  filterItemText: {
    fontSize: FontSize.md,
    color: Colors.text,
  },
  filterItemTextSelected: {
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
});
