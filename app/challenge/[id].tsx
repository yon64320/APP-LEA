import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useChallengeStore } from '../../src/store/challengeStore';
import { useHabitStore } from '../../src/store/habitStore';
import { getToday, addDays } from '../../src/utils/date';
import { Colors } from '../../src/constants/colors';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../../src/constants/layout';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { Button } from '../../src/components/ui/Button';

export default function ChallengeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const getChallengeById = useChallengeStore((s) => s.getChallengeById);
  const challenge = id ? getChallengeById(id) : undefined;

  const activeChallenge = useChallengeStore((s) => (id ? s.getActiveChallenge(id) : undefined));
  const isCompleted = useChallengeStore((s) => (id ? s.isChallengeCompleted(id) : false));
  const startChallenge = useChallengeStore((s) => s.startChallenge);
  const abandonChallenge = useChallengeStore((s) => s.abandonChallenge);
  const addHabit = useHabitStore((s) => s.addHabit);
  const logs = useHabitStore((s) => s.logs);

  const [isStarting, setIsStarting] = useState(false);

  if (!challenge) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Défi introuvable</Text>
        </View>
      </SafeAreaView>
    );
  }

  const progress = useMemo(() => {
    if (!activeChallenge) return 0;
    const today = getToday();
    const start = new Date(activeChallenge.startDate + 'T00:00:00');
    const end = new Date(activeChallenge.endDate + 'T00:00:00');
    const current = new Date(today + 'T00:00:00');
    const totalDays = Math.max(Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)), 1);
    const elapsedDays = Math.ceil((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.min(Math.max(elapsedDays / totalDays, 0), 1);
  }, [activeChallenge]);

  const daysRemaining = useMemo(() => {
    if (!activeChallenge) return null;
    const today = getToday();
    const end = new Date(activeChallenge.endDate + 'T00:00:00');
    const current = new Date(today + 'T00:00:00');
    const diff = Math.ceil((end.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }, [activeChallenge]);

  const challengeStats = useMemo(() => {
    if (!activeChallenge) return null;

    const days = Array.from({ length: challenge.duration }, (_, index) => addDays(activeChallenge.startDate, index));
    const completedDates = new Set(
      logs
        .filter((log) => log.habitId === activeChallenge.habitId && log.completed && log.date >= activeChallenge.startDate && log.date <= activeChallenge.endDate)
        .map((log) => log.date)
    );

    const points = days.map((date) => ({ date, completed: completedDates.has(date) ? 1 : 0 }));
    const completedCount = points.filter((point) => point.completed === 1).length;
    return {
      points,
      completionRate: Math.round((completedCount / Math.max(challenge.duration, 1)) * 100),
      completedCount,
    };
  }, [activeChallenge, logs, challenge.duration]);

  const handleStartChallenge = async () => {
    setIsStarting(true);
    try {
      const habitId = await addHabit({
        name: challenge.habitConfig.name,
        type: challenge.habitConfig.type,
        target: challenge.habitConfig.target,
        unit: challenge.habitConfig.unit,
        frequency: { type: 'daily', days: [0, 1, 2, 3, 4, 5, 6] },
        color: challenge.color,
        icon: challenge.icon,
        category: challenge.category,
      });

      await startChallenge(challenge.id, habitId, challenge.duration);
      router.back();
    } catch {
      Alert.alert('Erreur', 'Impossible de démarrer le défi');
    } finally {
      setIsStarting(false);
    }
  };

  const handleAbandon = () => {
    Alert.alert('Abandonner le défi', 'Es-tu sûr de vouloir abandonner ce défi ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Abandonner',
        style: 'destructive',
        onPress: () => {
          if (id) {
            abandonChallenge(id);
            router.back();
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails du défi</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.challengeHeader}>
          <View style={[styles.iconContainer, { backgroundColor: challenge.color + '20', borderColor: challenge.color }]}>
            <Ionicons name={challenge.icon as keyof typeof Ionicons.glyphMap} size={48} color={challenge.color} />
          </View>
          <Text style={styles.challengeName}>{challenge.name}</Text>
          <Text style={styles.challengeDuration}>{challenge.duration} jours</Text>
        </View>

        <View style={styles.descriptionCard}>
          <Text style={styles.description}>{challenge.description}</Text>
        </View>

        {activeChallenge && (
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Progression</Text>
              <Text style={styles.progressValue}>{activeChallenge.completedDays} / {challenge.duration} jours</Text>
            </View>
            <ProgressBar progress={progress} color={challenge.color} height={10} animated />
            {daysRemaining !== null && (
              <Text style={styles.daysRemaining}>{daysRemaining} jour{daysRemaining > 1 ? 's' : ''} restant{daysRemaining > 1 ? 's' : ''}</Text>
            )}
          </View>
        )}

        {challengeStats && (
          <View style={styles.statsCard}>
            <Text style={styles.progressTitle}>Statistiques du défi</Text>
            <Text style={styles.statsSubtitle}>{challengeStats.completedCount}/{challenge.duration} jours réussis • {challengeStats.completionRate}%</Text>
            <View style={styles.chartRow}>
              {challengeStats.points.map((point) => (
                <View key={point.date} style={styles.chartBarWrap}>
                  <View
                    style={[
                      styles.chartBar,
                      {
                        height: point.completed ? 40 : 10,
                        backgroundColor: point.completed ? challenge.color : '#E5E7EB',
                      },
                    ]}
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        {isCompleted && (
          <View style={styles.completedCard}>
            <Ionicons name="checkmark-circle" size={48} color={Colors.success} />
            <Text style={styles.completedText}>Défi complété !</Text>
            <Text style={styles.completedSubtext}>Félicitations pour avoir terminé ce défi !</Text>
          </View>
        )}

        {!activeChallenge && !isCompleted && (
          <View style={styles.actions}>
            <Button title="Démarrer le défi" onPress={handleStartChallenge} disabled={isStarting} style={styles.startButton} />
          </View>
        )}

        {activeChallenge && !isCompleted && (
          <View style={styles.actions}>
            <Button title="Abandonner le défi" variant="ghost" onPress={handleAbandon} textStyle={{ color: Colors.error }} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.md },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.xl, paddingBottom: Spacing.xxxl },
  challengeHeader: { alignItems: 'center', marginBottom: Spacing.xl },
  iconContainer: { width: 96, height: 96, borderRadius: BorderRadius.xl, borderWidth: 3, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  challengeName: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.xs, textAlign: 'center' },
  challengeDuration: { fontSize: FontSize.md, color: Colors.textSecondary },
  descriptionCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: Spacing.lg, marginBottom: Spacing.lg, borderWidth: 1, borderColor: 'rgba(128, 0, 0, 0.1)' },
  description: { fontSize: FontSize.md, color: Colors.text, lineHeight: 24 },
  progressCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: Spacing.lg, marginBottom: Spacing.lg, borderWidth: 1, borderColor: 'rgba(128, 0, 0, 0.1)', gap: Spacing.md },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  progressValue: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primary },
  daysRemaining: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center' },
  statsCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: Spacing.lg, marginBottom: Spacing.lg, borderWidth: 1, borderColor: 'rgba(128, 0, 0, 0.1)', gap: Spacing.sm },
  statsSubtitle: { color: Colors.textSecondary, fontSize: FontSize.sm },
  chartRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginTop: Spacing.sm },
  chartBarWrap: { flex: 1, height: 44, justifyContent: 'flex-end' },
  chartBar: { borderRadius: 4 },
  completedCard: { backgroundColor: Colors.success + '10', borderRadius: 12, padding: Spacing.xl, alignItems: 'center', gap: Spacing.sm, borderWidth: 1, borderColor: Colors.success + '30' },
  completedText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.success },
  completedSubtext: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center' },
  actions: { marginTop: Spacing.xl },
  startButton: { width: '100%' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: Colors.textMuted, fontSize: FontSize.md },
});
