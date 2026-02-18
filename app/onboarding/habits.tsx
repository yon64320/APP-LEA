import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '../../src/store/appStore';
import { useHabitStore } from '../../src/store/habitStore';
import { useAuthStore } from '../../src/store/authStore';
import { PRESET_HABITS, CATEGORIES } from '../../src/constants/presets';
import { PresetHabit } from '../../src/types';
import { Colors } from '../../src/constants/colors';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../../src/constants/layout';
import { Button } from '../../src/components/ui/Button';

export default function HabitsScreen() {
  const selectedCategories = useAppStore((s) => s.selectedCategories);
  const setOnboardingComplete = useAppStore((s) => s.setOnboardingComplete);
  const addHabit = useHabitStore((s) => s.addHabit);
  const session = useAuthStore((s) => s.session);

  const [selectedHabits, setSelectedHabits] = useState<PresetHabit[]>([]);

  // Vérifier que l'utilisateur est connecté
  useEffect(() => {
    if (!session) {
      router.replace('/auth/login');
    }
  }, [session]);

  // Afficher rien si pas connecté (en attendant la redirection)
  if (!session) {
    return <View style={{ flex: 1, backgroundColor: Colors.background }} />;
  }

  const filteredPresets = useMemo(() => {
    if (selectedCategories.length === 0) return PRESET_HABITS;
    return PRESET_HABITS.filter((h) =>
      selectedCategories.includes(h.category)
    );
  }, [selectedCategories]);

  const groupedPresets = useMemo(() => {
    const groups: Record<string, PresetHabit[]> = {};
    for (const preset of filteredPresets) {
      if (!groups[preset.category]) groups[preset.category] = [];
      groups[preset.category].push(preset);
    }
    return groups;
  }, [filteredPresets]);

  const toggleHabit = (habit: PresetHabit) => {
    // Haptics n'est pas supporté sur le web
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedHabits((prev) => {
      const exists = prev.find((h) => h.name === habit.name);
      if (exists) return prev.filter((h) => h.name !== habit.name);
      return [...prev, habit];
    });
  };

  const handleFinish = () => {
    for (const preset of selectedHabits) {
      addHabit({
        name: preset.name,
        type: preset.type,
        target: preset.target,
        unit: preset.unit,
        icon: preset.icon,
        color: preset.color,
        frequency: preset.frequency,
        category: preset.category,
      });
    }
    setOnboardingComplete();
    router.replace('/(tabs)');
  };

  const getCategoryLabel = (key: string) =>
    CATEGORIES.find((c) => c.key === key)?.label ?? key;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.step}>2/2</Text>
      </View>

      <Text style={styles.title}>Choisis tes habitudes</Text>
      <Text style={styles.subtitle}>
        Tu pourras en ajouter d'autres plus tard
      </Text>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {Object.entries(groupedPresets).map(([category, presets]) => (
          <View key={category} style={styles.group}>
            <Text style={styles.groupTitle}>
              {getCategoryLabel(category)}
            </Text>
            {presets.map((preset) => {
              const isSelected = selectedHabits.some(
                (h) => h.name === preset.name
              );
              return (
                <TouchableOpacity
                  key={preset.name}
                  style={[
                    styles.habitItem,
                    isSelected && {
                      borderColor: preset.color,
                      backgroundColor: preset.color + '10',
                    },
                  ]}
                  onPress={() => toggleHabit(preset)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.habitIcon,
                      { backgroundColor: preset.color + '20' },
                    ]}
                  >
                    <Ionicons
                      name={preset.icon as keyof typeof Ionicons.glyphMap}
                      size={20}
                      color={preset.color}
                    />
                  </View>
                  <View style={styles.habitInfo}>
                    <Text style={styles.habitName}>{preset.name}</Text>
                    {preset.target && (
                      <Text style={styles.habitTarget}>
                        Objectif : {preset.target} {preset.unit}
                      </Text>
                    )}
                  </View>
                  <View
                    style={[
                      styles.radioOuter,
                      isSelected && { borderColor: preset.color },
                    ]}
                  >
                    {isSelected && (
                      <View
                        style={[
                          styles.radioInner,
                          { backgroundColor: preset.color },
                        ]}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottom}>
        <Text style={styles.selectedCount}>
          {selectedHabits.length} habitude{selectedHabits.length > 1 ? 's' : ''}{' '}
          sélectionnée{selectedHabits.length > 1 ? 's' : ''}
        </Text>
        <Button
          title="Commencer le suivi"
          onPress={handleFinish}
          size="lg"
          disabled={selectedHabits.length === 0}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  step: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  title: {
    color: Colors.text,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  group: {
    marginBottom: Spacing.xl,
  },
  groupTitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  habitIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  habitTarget: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: BorderRadius.full,
  },
  bottom: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
  },
  selectedCount: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  button: {
    width: '100%',
  },
});
