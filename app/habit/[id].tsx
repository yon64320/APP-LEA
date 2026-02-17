import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHabitStore } from '../../src/store/habitStore';
import { getHabitStats } from '../../src/utils/stats';
import { getToday } from '../../src/utils/date';
import { Colors } from '../../src/constants/colors';
import {
  Spacing,
  FontSize,
  FontWeight,
  BorderRadius,
} from '../../src/constants/layout';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { StatsCard } from '../../src/components/history/StatsCard';
import { Button } from '../../src/components/ui/Button';
import { useKeyboardToolbar } from '../../src/hooks/useKeyboardToolbar';
import { KeyboardToolbar } from '../../src/components/ui/KeyboardToolbar';

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const habits = useHabitStore((s) => s.habits);
  const logs = useHabitStore((s) => s.logs);
  const deleteHabit = useHabitStore((s) => s.deleteHabit);
  const toggleHabitCompletion = useHabitStore((s) => s.toggleHabitCompletion);
  const setHabitValue = useHabitStore((s) => s.setHabitValue);
  const getLogForHabitDate = useHabitStore((s) => s.getLogForHabitDate);
  const { isKeyboardVisible } = useKeyboardToolbar();

  const habit = habits.find((h) => h.id === id);
  const today = getToday();
  const todayLog = habit ? getLogForHabitDate(habit.id, today) : undefined;

  const [quantInput, setQuantInput] = useState(
    todayLog?.value?.toString() ?? ''
  );

  const stats = useMemo(() => {
    if (!habit) return null;
    return getHabitStats(habit, logs);
  }, [habit, logs]);

  if (!habit || !stats) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Habitude introuvable</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Supprimer l\'habitude',
      `Es-tu sûr de vouloir supprimer "${habit.name}" ? Cette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            deleteHabit(habit.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleSetValue = () => {
    const value = Number(quantInput);
    if (!isNaN(value) && value >= 0) {
      setHabitValue(habit.id, today, value);
    }
  };

  const frequencyLabel =
    habit.frequency.type === 'daily'
      ? 'Tous les jours'
      : habit.frequency.type === 'weekly'
        ? 'En semaine'
        : `${habit.frequency.days.length} jours/semaine`;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => router.push(`/habit/create?editId=${habit.id}`)}>
            <Ionicons name="create-outline" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete}>
            <Ionicons name="trash-outline" size={24} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        {/* Habit info header */}
        <View style={styles.infoHeader}>
          <View
            style={[
              styles.iconBox,
              { backgroundColor: habit.color + '20' },
            ]}
          >
            <Ionicons
              name={habit.icon as keyof typeof Ionicons.glyphMap}
              size={32}
              color={habit.color}
            />
          </View>
          <Text style={styles.habitName}>{habit.name}</Text>
          <Text style={styles.habitMeta}>
            {habit.type === 'quantitative'
              ? `Objectif : ${habit.target} ${habit.unit}`
              : 'Fait / Pas fait'}{' '}
            · {frequencyLabel}
          </Text>
        </View>

        {/* Today's action */}
        <View style={styles.todaySection}>
          <Text style={styles.sectionTitle}>Aujourd'hui</Text>
          {habit.type === 'binary' ? (
            <TouchableOpacity
              style={[
                styles.todayButton,
                todayLog?.completed && {
                  backgroundColor: habit.color + '20',
                  borderColor: habit.color,
                },
              ]}
              onPress={() => toggleHabitCompletion(habit.id, today)}
            >
              <Ionicons
                name={todayLog?.completed ? 'checkmark-circle' : 'ellipse-outline'}
                size={28}
                color={todayLog?.completed ? habit.color : Colors.textMuted}
              />
              <Text
                style={[
                  styles.todayButtonText,
                  todayLog?.completed && { color: habit.color },
                ]}
              >
                {todayLog?.completed ? 'Complété !' : 'Marquer comme fait'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.quantSection}>
              <View style={styles.quantRow}>
                <TextInput
                  style={styles.quantInput}
                  value={quantInput}
                  onChangeText={setQuantInput}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={Colors.textMuted}
                  onEndEditing={handleSetValue}
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    handleSetValue();
                    Keyboard.dismiss();
                  }}
                />
                <Text style={styles.quantUnit}>
                  / {habit.target} {habit.unit}
                </Text>
                <Button title="OK" size="sm" onPress={handleSetValue} />
              </View>
              <ProgressBar
                progress={
                  habit.target
                    ? (todayLog?.value ?? 0) / habit.target
                    : 0
                }
                color={habit.color}
                height={8}
              />
            </View>
          )}
        </View>

        {/* Stats */}
        <Text style={styles.sectionTitle}>Statistiques</Text>
        <View style={styles.statsGrid}>
          <StatsCard
            icon="flame"
            iconColor={Colors.streakFire}
            label="Streak actuel"
            value={stats.currentStreak}
          />
          <StatsCard
            icon="trophy"
            iconColor={Colors.streakGold}
            label="Meilleur"
            value={stats.bestStreak}
          />
        </View>
        <View style={[styles.statsGrid, { marginTop: Spacing.sm }]}>
          <StatsCard
            icon="stats-chart"
            iconColor={Colors.accent}
            label="Taux réussite"
            value={`${Math.round(stats.completionRate * 100)}%`}
          />
          <StatsCard
            icon="checkmark-done"
            iconColor={Colors.success}
            label="Total"
            value={stats.totalCompleted}
          />
        </View>

        {/* Note */}
        {habit.note && (
          <View style={styles.noteSection}>
            <Text style={styles.sectionTitle}>Note</Text>
            <View style={styles.noteCard}>
              <Text style={styles.noteText}>{habit.note}</Text>
            </View>
          </View>
        )}

        {/* Delete */}
        <Button
          title="Supprimer cette habitude"
          variant="ghost"
          onPress={handleDelete}
          style={styles.deleteButton}
          textStyle={{ color: Colors.error }}
        />
        </ScrollView>
      </KeyboardAvoidingView>
      <KeyboardToolbar visible={isKeyboardVisible} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  infoHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  habitName: {
    color: Colors.text,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
  },
  habitMeta: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  todaySection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.md,
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  todayButtonText: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  quantSection: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: Spacing.md,
  },
  quantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  quantInput: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: Colors.text,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    width: 80,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  quantUnit: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  noteSection: {
    marginTop: Spacing.xl,
  },
  noteCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  noteText: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    lineHeight: 22,
  },
  deleteButton: {
    marginTop: Spacing.xxl,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: FontSize.md,
  },
});
