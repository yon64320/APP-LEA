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
import { useChallengeStore } from '../../src/store/challengeStore';
import { useHabitStore } from '../../src/store/habitStore';
import { CHALLENGES } from '../../src/constants/challenges';
import { ChallengeCard } from '../../src/components/challenges/ChallengeCard';
import { Colors } from '../../src/constants/colors';
import { Spacing, FontSize, FontWeight } from '../../src/constants/layout';

export default function ChallengesScreen() {
  const activeChallenges = useChallengeStore((s) => s.activeChallenges);
  const getActiveChallenge = useChallengeStore((s) => s.getActiveChallenge);
  const isChallengeCompleted = useChallengeStore((s) => s.isChallengeCompleted);
  const habits = useHabitStore((s) => s.habits);

  const availableChallenges = useMemo(() => {
    return CHALLENGES.filter(
      (c) => !getActiveChallenge(c.id) && !isChallengeCompleted(c.id)
    );
  }, [activeChallenges]);

  const activeChallengesList = useMemo(() => {
    return activeChallenges
      .filter((ac) => ac.status === 'active')
      .map((ac) => {
        const challenge = CHALLENGES.find((c) => c.id === ac.challengeId);
        return challenge ? { challenge, activeChallenge: ac } : null;
      })
      .filter((item): item is { challenge: typeof CHALLENGES[0]; activeChallenge: typeof activeChallenges[0] } =>
        item !== null
      );
  }, [activeChallenges]);

  const completedChallenges = useMemo(() => {
    return CHALLENGES.filter((c) => isChallengeCompleted(c.id));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Défis</Text>
          <Text style={styles.subtitle}>
            Relevez des défis pour rester motivé
          </Text>
        </View>

        {/* Active Challenges */}
        {activeChallengesList.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>En cours</Text>
            {activeChallengesList.map(({ challenge, activeChallenge }) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                activeChallenge={activeChallenge}
                onPress={() => router.push(`/challenge/${challenge.id}`)}
              />
            ))}
          </View>
        )}

        {/* Available Challenges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Défis disponibles ({availableChallenges.length})
          </Text>
          {availableChallenges.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons
                name="trophy-outline"
                size={48}
                color={Colors.textMuted}
              />
              <Text style={styles.emptyText}>
                Tous les défis ont été complétés !
              </Text>
            </View>
          ) : (
            availableChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onPress={() => router.push(`/challenge/${challenge.id}`)}
              />
            ))
          )}
        </View>

        {/* Completed Challenges */}
        {completedChallenges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Complétés ({completedChallenges.length})
            </Text>
            {completedChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onPress={() => router.push(`/challenge/${challenge.id}`)}
              />
            ))}
          </View>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
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
    textAlign: 'center',
  },
});
