import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { HabitCategory } from '../../src/types';
import { CATEGORIES } from '../../src/constants/presets';
import { useAppStore } from '../../src/store/appStore';
import { Colors } from '../../src/constants/colors';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../../src/constants/layout';
import { Button } from '../../src/components/ui/Button';

export default function GoalsScreen() {
  const [selected, setSelected] = useState<HabitCategory[]>([]);
  const setSelectedCategories = useAppStore((s) => s.setSelectedCategories);

  const toggleCategory = (key: HabitCategory) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );
  };

  const handleNext = () => {
    setSelectedCategories(selected);
    router.push('/onboarding/habits');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.step}>1/2</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Quels sont tes objectifs ?</Text>
        <Text style={styles.subtitle}>
          Choisis les domaines qui t'intéressent
        </Text>

        <View style={styles.grid}>
          {CATEGORIES.map((cat) => {
            const isSelected = selected.includes(cat.key as HabitCategory);
            return (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.card,
                  isSelected && {
                    borderColor: cat.color,
                    backgroundColor: cat.color + '15',
                  },
                ]}
                onPress={() => toggleCategory(cat.key as HabitCategory)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: cat.color + '20' },
                  ]}
                >
                  <Ionicons
                    name={cat.icon as keyof typeof Ionicons.glyphMap}
                    size={28}
                    color={cat.color}
                  />
                </View>
                <Text style={styles.cardLabel}>{cat.label}</Text>
                {isSelected && (
                  <View style={[styles.check, { backgroundColor: cat.color }]}>
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.bottom}>
        <Button
          title="Suivant"
          onPress={handleNext}
          size="lg"
          disabled={selected.length === 0}
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
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
  },
  title: {
    color: Colors.text,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    marginBottom: Spacing.xxl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  card: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.surfaceBorder,
    position: 'relative',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  cardLabel: {
    color: Colors.text,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  check: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 22,
    height: 22,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottom: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  button: {
    width: '100%',
  },
});
