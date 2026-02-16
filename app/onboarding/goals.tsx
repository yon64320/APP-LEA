import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { HabitCategory } from '../../src/types';
import { CATEGORIES } from '../../src/constants/presets';
import { useAppStore } from '../../src/store/appStore';
import { Colors } from '../../src/constants/colors';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../../src/constants/layout';

// Mapping des icônes Material Symbols vers Ionicons
const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  'favorite': 'heart',
  'fitness_center': 'barbell',
  'checklist': 'checkmark-done',
  'auto_awesome': 'sparkles',
  'bedtime': 'moon',
  'menu_book': 'book',
  // Fallback pour les icônes existantes
  'heart': 'heart',
  'fitness': 'barbell',
  'rocket': 'rocket',
  'sparkles': 'sparkles',
  'moon': 'moon',
  'book': 'book',
};

export default function GoalsScreen() {
  const [selected, setSelected] = useState<HabitCategory[]>([]);
  const setSelectedCategories = useAppStore((s) => s.setSelectedCategories);

  const toggleCategory = (key: HabitCategory) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );
  };

  const handleNext = () => {
    setSelectedCategories(selected);
    router.push('/onboarding/habits');
  };

  const progress = 33.33; // 1/3

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <Text style={styles.appName}>HABITFLOW</Text>
            <Text style={styles.step}>1 / 3</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Qu'est-ce qui compte pour vous ?</Text>
          <Text style={styles.subtitle}>
            Sélectionnez vos centres d'intérêt pour personnaliser votre expérience.
          </Text>

          {/* Interest Grid - 2x3 */}
          <View style={styles.grid}>
            {CATEGORIES.slice(0, 6).map((cat) => {
              const isSelected = selected.includes(cat.key as HabitCategory);
              const iconName = iconMap[cat.icon] || 'ellipse';
              return (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.card,
                    isSelected && styles.cardSelected,
                  ]}
                  onPress={() => toggleCategory(cat.key as HabitCategory)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={iconName}
                    size={32}
                    color={Colors.primary}
                    style={styles.cardIcon}
                  />
                  <Text style={styles.cardLabel}>{cat.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Navigation */}
      <View style={styles.bottom}>
        <TouchableOpacity
          style={[styles.continueButton, selected.length === 0 && styles.continueButtonDisabled]}
          onPress={handleNext}
          disabled={selected.length === 0}
          activeOpacity={0.9}
        >
          <Text style={styles.continueButtonText}>Continuer</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundOnboarding,
  },
  header: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  headerContent: {
    gap: Spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  appName: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    letterSpacing: 1, // uppercase tracking-wider
    textTransform: 'uppercase',
  },
  step: {
    color: 'rgba(128, 0, 0, 0.8)', // text-primary/80
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  progressBarContainer: {
    width: '100%',
  },
  progressBar: {
    width: '100%',
    height: 8, // h-2
    backgroundColor: 'rgba(128, 0, 0, 0.2)', // bg-primary/20
    borderRadius: 9999, // rounded-full
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 9999,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 96, // pb-24
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  title: {
    color: Colors.text, // text-[#1d0c0c]
    fontSize: 30, // text-3xl
    fontWeight: FontWeight.bold,
    lineHeight: 36, // leading-tight
    marginBottom: Spacing.md,
  },
  subtitle: {
    color: 'rgba(29, 12, 12, 0.7)', // text-[#1d0c0c]/70
    fontSize: FontSize.base, // text-base
    lineHeight: 24, // leading-relaxed
    marginBottom: Spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  card: {
    width: '47%',
    backgroundColor: '#FFFFFF', // bg-white
    borderRadius: 12, // rounded-xl
    padding: Spacing.xl, // p-6
    borderWidth: 2,
    borderColor: 'rgba(128, 0, 0, 0.1)', // border-primary/10
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  cardSelected: {
    borderColor: Colors.primary, // border-primary
    backgroundColor: 'rgba(128, 0, 0, 0.05)', // bg-primary/5
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIcon: {
    marginBottom: Spacing.md,
  },
  cardLabel: {
    color: Colors.text, // text-[#1d0c0c]
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(252, 248, 248, 0.8)', // bg-background-light/80
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 0, 0, 0.05)', // border-primary/5
  },
  continueButton: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md, // py-4
    borderRadius: 12, // rounded-xl
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
  },
});
