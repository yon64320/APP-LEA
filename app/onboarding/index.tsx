import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../../src/constants/layout';
import { Button } from '../../src/components/ui/Button';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="rocket" size={64} color={Colors.primary} />
        </View>

        <Text style={styles.title}>HabitFlow</Text>
        <Text style={styles.subtitle}>
          Construis la discipline.{'\n'}Chaque jour compte.
        </Text>

        <View style={styles.features}>
          {[
            { icon: 'checkmark-circle', text: 'Suivi simple et rapide' },
            { icon: 'flame', text: 'Streaks motivants' },
            { icon: 'stats-chart', text: 'Visualise ta progression' },
          ].map((feature, i) => (
            <View key={i} style={styles.featureRow}>
              <Ionicons
                name={feature.icon as keyof typeof Ionicons.glyphMap}
                size={22}
                color={Colors.success}
              />
              <Text style={styles.featureText}>{feature.text}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.bottom}>
        <Button
          title="Commencer"
          onPress={() => router.push('/onboarding/goals')}
          size="lg"
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },
  title: {
    color: Colors.text,
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.md,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.lg,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: Spacing.xxxl,
  },
  features: {
    gap: Spacing.lg,
    width: '100%',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  featureText: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  bottom: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xxl,
  },
  button: {
    width: '100%',
  },
});
