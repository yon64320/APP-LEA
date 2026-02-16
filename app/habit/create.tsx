import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHabitStore } from '../../src/store/habitStore';
import { HabitType, FrequencyType } from '../../src/types';
import { Colors } from '../../src/constants/colors';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../../src/constants/layout';

const HABIT_COLORS = [
  Colors.primary,
  '#F97316', // orange
  '#10B981', // green
  '#3B82F6', // blue
  '#EC4899', // pink
  '#EAB308', // yellow
];

const HABIT_ICONS = [
  'fitness',
  'book',
  'leaf',
  'moon',
  'restaurant',
  'ellipsis-horizontal',
];

const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export default function CreateHabitScreen() {
  const addHabit = useHabitStore((s) => s.addHabit);

  const [name, setName] = useState('');
  const [type, setType] = useState<HabitType>('binary');
  const [target, setTarget] = useState('1');
  const [unit, setUnit] = useState('');
  const [frequency, setFrequency] = useState<FrequencyType>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [selectedColor, setSelectedColor] = useState<string>(Colors.primary);
  const [selectedIcon, setSelectedIcon] = useState('fitness');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [notes, setNotes] = useState('');

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = () => {
    if (!name.trim()) return;

      addHabit({
        name: name.trim(),
        type,
        target: type === 'quantitative' ? parseFloat(target) || null : null,
        unit: type === 'quantitative' ? unit : null,
        frequency: {
          type: frequency,
          days: frequency === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : selectedDays,
        },
        color: selectedColor,
        icon: selectedIcon,
        reminder: reminderEnabled
          ? {
              enabled: true,
              time: reminderTime,
            }
          : undefined,
        note: notes.trim() || undefined,
      });

    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>NOUVELLE HABITUDE</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section: Name */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>NOM DE L'HABITUDE</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Méditation matinale"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Section: Type & Goal */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TYPE D'OBJECTIF</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, type === 'binary' && styles.toggleButtonActive]}
              onPress={() => setType('binary')}
            >
              <Text
                style={[
                  styles.toggleText,
                  type === 'binary' && styles.toggleTextActive,
                ]}
              >
                Binaire
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, type === 'quantitative' && styles.toggleButtonActive]}
              onPress={() => setType('quantitative')}
            >
              <Text
                style={[
                  styles.toggleText,
                  type === 'quantitative' && styles.toggleTextActive,
                ]}
              >
                Quantitatif
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.goalRow}>
            <View style={styles.goalInputContainer}>
              <Text style={styles.goalLabel}>Objectif</Text>
              <TextInput
                style={styles.goalInput}
                placeholder="1"
                placeholderTextColor="#999"
                value={target}
                onChangeText={setTarget}
                keyboardType="numeric"
                editable={type === 'quantitative'}
              />
            </View>
            <View style={styles.goalInputContainer}>
              <Text style={styles.goalLabel}>Unité</Text>
              <TextInput
                style={styles.goalInput}
                placeholder="ml, min, etc."
                placeholderTextColor="#999"
                value={unit}
                onChangeText={setUnit}
                editable={type === 'quantitative'}
              />
            </View>
          </View>
        </View>

        {/* Section: Frequency */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>FRÉQUENCE</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.frequencyScroll}
            contentContainerStyle={styles.frequencyScrollContent}
          >
            <TouchableOpacity
              style={[
                styles.frequencyButton,
                frequency === 'daily' && styles.frequencyButtonActive,
              ]}
              onPress={() => setFrequency('daily')}
            >
              <Text
                style={[
                  styles.frequencyButtonText,
                  frequency === 'daily' && styles.frequencyButtonTextActive,
                ]}
              >
                Quotidien
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.frequencyButton,
                frequency === 'weekly' && styles.frequencyButtonActive,
              ]}
              onPress={() => setFrequency('weekly')}
            >
              <Text
                style={[
                  styles.frequencyButtonText,
                  frequency === 'weekly' && styles.frequencyButtonTextActive,
                ]}
              >
                Hebdomadaire
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.frequencyButton,
                frequency === 'custom' && styles.frequencyButtonActive,
              ]}
              onPress={() => setFrequency('custom')}
            >
              <Text
                style={[
                  styles.frequencyButtonText,
                  frequency === 'custom' && styles.frequencyButtonTextActive,
                ]}
              >
                Personnalisé
              </Text>
            </TouchableOpacity>
          </ScrollView>
          <View style={styles.daysRow}>
            {DAY_LABELS.map((label, index) => {
              const day = index === 0 ? 0 : index; // L=0, M=1, etc.
              const isSelected = selectedDays.includes(day);
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayButton,
                    isSelected && styles.dayButtonActive,
                  ]}
                  onPress={() => toggleDay(day)}
                >
                  <Text
                    style={[
                      styles.dayButtonText,
                      isSelected && styles.dayButtonTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section: Appearance */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>APPARENCE</Text>
          <View style={styles.appearanceCard}>
            <View style={styles.colorSection}>
              <View style={[styles.colorIconContainer, { backgroundColor: selectedColor }]}>
                <Ionicons name="water" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.colorPicker}>
                <Text style={styles.colorPickerLabel}>Choisir une couleur</Text>
                <View style={styles.colorSwatches}>
                  {HABIT_COLORS.map((color, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.colorSwatch,
                        { backgroundColor: color },
                        selectedColor === color && styles.colorSwatchSelected,
                      ]}
                      onPress={() => setSelectedColor(color)}
                    />
                  ))}
                </View>
              </View>
            </View>
            <View style={styles.iconGrid}>
              {HABIT_ICONS.map((icon, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.iconButton,
                    selectedIcon === icon && styles.iconButtonActive,
                  ]}
                  onPress={() => setSelectedIcon(icon)}
                >
                  <Ionicons
                    name={icon as keyof typeof Ionicons.glyphMap}
                    size={20}
                    color={selectedIcon === icon ? Colors.primary : 'rgba(128, 0, 0, 0.4)'}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Section: Reminder */}
        <View style={styles.section}>
          <View style={styles.reminderHeader}>
            <Text style={styles.sectionLabel}>RAPPEL QUOTIDIEN</Text>
            <Switch
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
              trackColor={{ false: '#D1D5DB', true: Colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          {reminderEnabled && (
            <View style={styles.reminderInput}>
              <Ionicons name="notifications" size={20} color={Colors.primary} />
              <TextInput
                style={styles.reminderTimeInput}
                value={reminderTime}
                onChangeText={setReminderTime}
                placeholder="08:00"
                placeholderTextColor="#999"
              />
            </View>
          )}
        </View>

        {/* Section: Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>NOTES OU MOTIVATIONS</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Pourquoi voulez-vous cette habitude ?"
            placeholderTextColor="#999"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      {/* Bottom CTA Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={!name.trim()}
        >
          <Text style={styles.submitButtonText}>Créer l'habitude</Text>
          <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 0, 0, 0.1)',
    backgroundColor: 'rgba(252, 248, 245, 0.8)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerSpacer: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: 100,
    gap: Spacing.xl,
  },
  section: {
    gap: Spacing.md,
  },
  sectionLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: 'rgba(128, 0, 0, 0.7)',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginLeft: 4,
  },
  input: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.2)',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.lg,
    color: Colors.text,
  },
  toggleContainer: {
    flexDirection: 'row',
    padding: 4,
    backgroundColor: 'rgba(128, 0, 0, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.1)',
    gap: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: 'rgba(128, 0, 0, 0.6)',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  goalRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  goalInputContainer: {
    flex: 1,
    gap: 4,
  },
  goalLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: '#666',
  },
  goalInput: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.1)',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  frequencyScroll: {
    marginHorizontal: -4,
  },
  frequencyScrollContent: {
    gap: Spacing.sm,
    paddingHorizontal: 4,
  },
  frequencyButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.2)',
    backgroundColor: 'transparent',
  },
  frequencyButtonActive: {
    backgroundColor: 'rgba(128, 0, 0, 0.05)',
    borderColor: Colors.primary,
  },
  frequencyButtonText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: '#666',
  },
  frequencyButtonTextActive: {
    color: Colors.primary,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  dayButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dayButtonText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: '#999',
  },
  dayButtonTextActive: {
    color: '#FFFFFF',
  },
  appearanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.1)',
    gap: Spacing.md,
  },
  colorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  colorIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorPicker: {
    flex: 1,
    gap: Spacing.sm,
  },
  colorPickerLabel: {
    fontSize: FontSize.xs,
    color: '#666',
    marginBottom: Spacing.xs,
  },
  colorSwatches: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  colorSwatch: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  colorSwatchSelected: {
    borderWidth: 3,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  iconButton: {
    width: 48,
    height: 48,
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: 'rgba(128, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonActive: {
    backgroundColor: 'rgba(128, 0, 0, 0.1)',
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reminderInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.1)',
    padding: Spacing.md,
  },
  reminderTimeInput: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    color: Colors.text,
  },
  notesInput: {
    width: '100%',
    minHeight: 80,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.1)',
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.xl,
    backgroundColor: 'rgba(252, 248, 245, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 0, 0, 0.1)',
  },
  submitButton: {
    width: '100%',
    height: 64,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
});
