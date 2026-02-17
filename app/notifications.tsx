import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHabitStore } from '../src/store/habitStore';
import { Colors } from '../src/constants/colors';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../src/constants/layout';
import { scheduleHabitReminder, cancelHabitReminder } from '../src/services/notifications';

export default function NotificationsScreen() {
  const habits = useHabitStore((s) => s.habits);
  const updateHabit = useHabitStore((s) => s.updateHabit);
  const [loading, setLoading] = useState<string | null>(null);

  const handleToggleReminder = async (habitId: string, habitName: string, currentReminder: { enabled: boolean; time: string } | undefined) => {
    setLoading(habitId);
    try {
      const isCurrentlyEnabled = currentReminder?.enabled ?? false;
      const newEnabled = !isCurrentlyEnabled;
      const time = currentReminder?.time ?? '08:00';

      // Update habit
      await updateHabit(habitId, {
        reminder: { enabled: newEnabled, time },
      });

      // Schedule or cancel OS notification
      if (newEnabled) {
        const habit = habits.find((h) => h.id === habitId);
        if (habit) {
          await scheduleHabitReminder({ ...habit, reminder: { enabled: true, time } });
        }
      } else {
        await cancelHabitReminder(habitId);
      }

      Alert.alert(
        'Succès',
        newEnabled
          ? `Rappel activé pour "${habitName}" à ${time}`
          : `Rappel désactivé pour "${habitName}"`
      );
    } catch (error) {
      console.error('Error toggling reminder:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le rappel');
    } finally {
      setLoading(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Habit List */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {habits.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="bell-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>Aucune habitude créée</Text>
          </View>
        ) : (
          habits.map((habit) => {
            const isEnabled = habit.reminder?.enabled ?? false;
            const time = habit.reminder?.time ?? '08:00';

            return (
              <View key={habit.id} style={styles.habitCard}>
                <View style={styles.habitInfo}>
                  <View style={[styles.habitIcon, { backgroundColor: habit.color + '20' }]}>
                    <Ionicons
                      name={habit.icon as keyof typeof Ionicons.glyphMap}
                      size={24}
                      color={habit.color}
                    />
                  </View>
                  <View style={styles.habitDetails}>
                    <Text style={styles.habitName}>{habit.name}</Text>
                    {isEnabled && (
                      <Text style={styles.reminderTime}>Rappel à {time}</Text>
                    )}
                  </View>
                </View>
                <Switch
                  value={isEnabled}
                  onValueChange={() => handleToggleReminder(habit.id, habit.name, habit.reminder)}
                  disabled={loading === habit.id}
                  trackColor={{ false: '#D1D5DB', true: Colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            );
          })
        )}
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
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
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  habitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  habitIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitDetails: {
    flex: 1,
  },
  habitName: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  reminderTime: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
});
