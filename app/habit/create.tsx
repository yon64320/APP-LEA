import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Modal,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHabitStore } from '../../src/store/habitStore';
import { HabitType, FrequencyType } from '../../src/types';
import { Colors } from '../../src/constants/colors';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../../src/constants/layout';
import { HABIT_ICONS } from '../../src/constants/presets';

const HABIT_COLORS = [Colors.primary, '#F97316', '#10B981', '#3B82F6', '#EC4899', '#EAB308'];
const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const DAY_VALUES = [1, 2, 3, 4, 5, 6, 0];

export default function CreateHabitScreen() {
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const habits = useHabitStore((s) => s.habits);
  const addHabit = useHabitStore((s) => s.addHabit);
  const updateHabit = useHabitStore((s) => s.updateHabit);

  const editingHabit = useMemo(() => habits.find((h) => h.id === editId), [habits, editId]);

  const [name, setName] = useState('');
  const [type, setType] = useState<HabitType>('binary');
  const [target, setTarget] = useState('1');
  const [unit, setUnit] = useState('');
  const [frequency, setFrequency] = useState<FrequencyType>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [selectedColor, setSelectedColor] = useState<string>(Colors.primary);
  const [selectedIcon, setSelectedIcon] = useState('fitness');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(0);
  const [notes, setNotes] = useState('');
  const [showIconModal, setShowIconModal] = useState(false);
  const [iconSearch, setIconSearch] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    if (!editingHabit) return;
    setName(editingHabit.name);
    setType(editingHabit.type);
    setTarget(editingHabit.target?.toString() ?? '1');
    setUnit(editingHabit.unit ?? '');
    setFrequency(editingHabit.frequency.type);
    setSelectedDays(editingHabit.frequency.days);
    setSelectedColor(editingHabit.color);
    setSelectedIcon(editingHabit.icon);
    setReminderEnabled(!!editingHabit.reminder?.enabled);
    const time = editingHabit.reminder?.time ?? '08:00';
    const [h, m] = time.split(':').map(Number);
    setHour(Number.isNaN(h) ? 8 : h);
    setMinute(Number.isNaN(m) ? 0 : m);
    setNotes(editingHabit.note ?? '');
  }, [editingHabit]);


  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const allIcons = useMemo(
    () => Object.keys(Ionicons.glyphMap).filter((icon) => icon.includes(iconSearch.toLowerCase())).slice(0, 300),
    [iconSearch]
  );

  const toggleDay = (day: number) => {
    setSelectedDays((prev) => {
      const updated = prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day];
      setFrequency('custom');
      return updated;
    });
  };

  const setPresetFrequency = (next: FrequencyType) => {
    setFrequency(next);
    if (next === 'daily') {
      setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
    }
    if (next === 'weekly') {
      setSelectedDays([1, 2, 3, 4, 5]);
    }
  };

  const reminderTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  const handleSubmit = () => {
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      type,
      target: type === 'quantitative' ? parseFloat(target) || null : null,
      unit: type === 'quantitative' ? unit || null : null,
      frequency: {
        type: frequency,
        days: frequency === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : frequency === 'weekly' ? [1, 2, 3, 4, 5] : selectedDays,
      },
      color: selectedColor,
      icon: selectedIcon,
      reminder: reminderEnabled ? { enabled: true, time: reminderTime } : undefined,
      note: notes.trim() || undefined,
    };

    if (editingHabit) {
      updateHabit(editingHabit.id, payload);
    } else {
      addHabit(payload);
    }

    router.back();
  };


  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{editingHabit ? 'MODIFIER HABITUDE' : 'NOUVELLE HABITUDE'}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>NOM DE L'HABITUDE</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} returnKeyType="done" onSubmitEditing={Keyboard.dismiss} placeholder="Ex: Méditation matinale" placeholderTextColor="#999" />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>TYPE D'OBJECTIF</Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity style={[styles.toggleButton, type === 'binary' && styles.toggleButtonActive]} onPress={() => setType('binary')}>
                <Text style={[styles.toggleText, type === 'binary' && styles.toggleTextActive]}>Binaire</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.toggleButton, type === 'quantitative' && styles.toggleButtonActive]} onPress={() => setType('quantitative')}>
                <Text style={[styles.toggleText, type === 'quantitative' && styles.toggleTextActive]}>Quantitatif</Text>
              </TouchableOpacity>
            </View>

            {type === 'quantitative' && (
              <View style={styles.goalRow}>
                <View style={styles.goalInputContainer}>
                  <Text style={styles.goalLabel}>Objectif</Text>
                  <TextInput style={styles.goalInput} placeholder="1" placeholderTextColor="#999" value={target} onChangeText={setTarget} keyboardType="numeric" returnKeyType="done" onSubmitEditing={Keyboard.dismiss} />
                </View>
                <View style={styles.goalInputContainer}>
                  <Text style={styles.goalLabel}>Unité</Text>
                  <TextInput style={styles.goalInput} placeholder="ml, min, etc." placeholderTextColor="#999" value={unit} onChangeText={setUnit} returnKeyType="done" onSubmitEditing={Keyboard.dismiss} />
                </View>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>FRÉQUENCE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.frequencyScroll} contentContainerStyle={styles.frequencyScrollContent}>
              {[
                { key: 'daily', label: 'Quotidien' },
                { key: 'weekly', label: 'Hebdomadaire' },
                { key: 'custom', label: 'Personnalisé' },
              ].map((item) => (
                <TouchableOpacity key={item.key} style={[styles.frequencyButton, frequency === item.key && styles.frequencyButtonActive]} onPress={() => setPresetFrequency(item.key as FrequencyType)}>
                  <Text style={[styles.frequencyButtonText, frequency === item.key && styles.frequencyButtonTextActive]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.daysRow}>
              {DAY_LABELS.map((label, index) => {
                const day = DAY_VALUES[index];
                const isSelected = selectedDays.includes(day);
                return (
                  <TouchableOpacity key={`${label}-${index}`} style={[styles.dayButton, isSelected && styles.dayButtonActive]} onPress={() => toggleDay(day)}>
                    <Text style={[styles.dayButtonText, isSelected && styles.dayButtonTextActive]}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>APPARENCE</Text>
            <View style={styles.appearanceCard}>
              <View style={styles.colorSection}>
                <View style={[styles.colorIconContainer, { backgroundColor: selectedColor }]}>
                  <Ionicons name={selectedIcon as keyof typeof Ionicons.glyphMap} size={24} color="#FFFFFF" />
                </View>
                <View style={styles.colorPicker}>
                  <Text style={styles.colorPickerLabel}>Choisir une couleur</Text>
                  <View style={styles.colorSwatches}>
                    {HABIT_COLORS.map((color) => (
                      <TouchableOpacity key={color} style={[styles.colorSwatch, { backgroundColor: color }, selectedColor === color && styles.colorSwatchSelected]} onPress={() => setSelectedColor(color)} />
                    ))}
                  </View>
                </View>
              </View>
              <View style={styles.iconGrid}>
                {HABIT_ICONS.slice(0, 11).map((icon) => (
                  <TouchableOpacity key={icon} style={[styles.iconButton, selectedIcon === icon && styles.iconButtonActive]} onPress={() => setSelectedIcon(icon)}>
                    <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={20} color={selectedIcon === icon ? Colors.primary : 'rgba(128, 0, 0, 0.5)'} />
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={styles.iconButton} onPress={() => setShowIconModal(true)}>
                  <Ionicons name="ellipsis-horizontal" size={20} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.reminderHeader}>
              <Text style={styles.sectionLabel}>RAPPEL QUOTIDIEN</Text>
              <Switch value={reminderEnabled} onValueChange={setReminderEnabled} trackColor={{ false: '#D1D5DB', true: Colors.primary }} thumbColor="#FFFFFF" />
            </View>
            {reminderEnabled && (
              <View style={styles.reminderCounterWrap}>
                <WheelPicker
                  label="Heures"
                  values={HOUR_VALUES}
                  selectedValue={hour}
                  onValueChange={setHour}
                />
                <Text style={styles.counterColon}>:</Text>
                <WheelPicker
                  label="Minutes"
                  values={MINUTE_VALUES}
                  selectedValue={minute}
                  onValueChange={setMinute}
                />
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>NOTES OU MOTIVATIONS</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Pourquoi voulez-vous cette habitude ?"
              placeholderTextColor="#999"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        {isKeyboardVisible && (
          <View style={styles.keyboardToolbar}>
            <TouchableOpacity onPress={Keyboard.dismiss} style={styles.keyboardDoneButton}>
              <Text style={styles.keyboardDoneText}>Terminer</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomBar}>
          <TouchableOpacity style={[styles.submitButton, !name.trim() && { opacity: 0.6 }]} onPress={handleSubmit} disabled={!name.trim()}>
            <Text style={styles.submitButtonText}>{editingHabit ? 'Enregistrer les changements' : "Créer l'habitude"}</Text>
            <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={showIconModal} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Toutes les icônes</Text>
            <TouchableOpacity onPress={() => setShowIconModal(false)}>
              <Ionicons name="close" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          <TextInput style={styles.input} placeholder="Rechercher une icône" placeholderTextColor="#999" value={iconSearch} onChangeText={setIconSearch} />
          <ScrollView contentContainerStyle={styles.modalGrid}>
            {allIcons.map((icon) => (
              <TouchableOpacity
                key={icon}
                style={[styles.iconButton, selectedIcon === icon && styles.iconButtonActive]}
                onPress={() => {
                  setSelectedIcon(icon);
                  setShowIconModal(false);
                }}
              >
                <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={20} color={selectedIcon === icon ? Colors.primary : 'rgba(128, 0, 0, 0.5)'} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const HOUR_VALUES = Array.from({ length: 24 }, (_, i) => i);
const MINUTE_VALUES = Array.from({ length: 60 }, (_, i) => i);
const ITEM_HEIGHT = 40;

function WheelPicker({
  label,
  values,
  selectedValue,
  onValueChange,
}: {
  label: string;
  values: number[];
  selectedValue: number;
  onValueChange: (value: number) => void;
}) {
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    const next = values[Math.max(0, Math.min(values.length - 1, index))];
    onValueChange(next);
  };

  return (
    <View style={styles.wheelCard}>
      <Text style={styles.goalLabel}>{label}</Text>
      <ScrollView
        style={styles.wheelScroll}
        contentContainerStyle={styles.wheelContent}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScroll}
      >
        {values.map((value) => (
          <TouchableOpacity key={`${label}-${value}`} style={styles.wheelItem} onPress={() => onValueChange(value)}>
            <Text style={[styles.wheelItemText, value === selectedValue && styles.wheelItemTextActive]}>
              {String(value).padStart(2, '0')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: 'rgba(128, 0, 0, 0.1)',
  },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primary, letterSpacing: 1, textTransform: 'uppercase' },
  headerSpacer: { width: 40 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: 120, gap: Spacing.xl },
  section: { gap: Spacing.md },
  sectionLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: 'rgba(128, 0, 0, 0.7)', letterSpacing: 1, textTransform: 'uppercase', marginLeft: 4 },
  input: { width: '100%', height: 56, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(128, 0, 0, 0.2)', backgroundColor: '#FFFFFF', paddingHorizontal: Spacing.md, fontSize: FontSize.lg, color: Colors.text },
  toggleContainer: { flexDirection: 'row', padding: 4, backgroundColor: 'rgba(128, 0, 0, 0.05)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(128, 0, 0, 0.1)', gap: 4 },
  toggleButton: { flex: 1, paddingVertical: Spacing.sm, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  toggleButtonActive: { backgroundColor: Colors.primary },
  toggleText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: 'rgba(128, 0, 0, 0.6)' },
  toggleTextActive: { color: '#FFFFFF' },
  goalRow: { flexDirection: 'row', gap: Spacing.md },
  goalInputContainer: { flex: 1, gap: 4 },
  goalLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.medium, color: '#666' },
  goalInput: { width: '100%', height: 48, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(128, 0, 0, 0.1)', backgroundColor: '#FFFFFF', paddingHorizontal: Spacing.md, fontSize: FontSize.md, color: Colors.text },
  frequencyScroll: { marginHorizontal: -4 },
  frequencyScrollContent: { gap: Spacing.sm, paddingHorizontal: 4 },
  frequencyButton: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: 'rgba(128, 0, 0, 0.2)', backgroundColor: 'transparent' },
  frequencyButtonActive: { backgroundColor: 'rgba(128, 0, 0, 0.05)', borderColor: Colors.primary },
  frequencyButtonText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: '#666' },
  frequencyButtonTextActive: { color: Colors.primary },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  dayButton: { width: 40, height: 40, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: 'rgba(128, 0, 0, 0.2)', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  dayButtonActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dayButtonText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: '#999' },
  dayButtonTextActive: { color: '#FFFFFF' },
  appearanceCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: Spacing.md, borderWidth: 1, borderColor: 'rgba(128, 0, 0, 0.1)', gap: Spacing.md },
  colorSection: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  colorIconContainer: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  colorPicker: { flex: 1, gap: Spacing.sm },
  colorPickerLabel: { fontSize: FontSize.xs, color: '#666', marginBottom: Spacing.xs },
  colorSwatches: { flexDirection: 'row', gap: Spacing.sm },
  colorSwatch: { width: 24, height: 24, borderRadius: BorderRadius.full, borderWidth: 2, borderColor: '#FFFFFF' },
  colorSwatchSelected: { borderWidth: 3, borderColor: Colors.primary },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, paddingTop: Spacing.sm },
  iconButton: { width: 48, height: 48, borderRadius: 8, backgroundColor: 'rgba(128, 0, 0, 0.05)', alignItems: 'center', justifyContent: 'center' },
  iconButtonActive: { backgroundColor: 'rgba(128, 0, 0, 0.1)', borderWidth: 1, borderColor: Colors.primary },
  reminderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reminderCounterWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  counterColon: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.primary },
  wheelCard: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(128, 0, 0, 0.1)', alignItems: 'center', minWidth: 120, maxHeight: 180, paddingVertical: Spacing.xs },
  wheelScroll: { width: '100%' },
  wheelContent: { paddingHorizontal: Spacing.md },
  wheelItem: { height: ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center' },
  wheelItemText: { fontSize: FontSize.lg, color: Colors.textSecondary },
  wheelItemTextActive: { color: Colors.primary, fontWeight: FontWeight.bold },
  notesInput: { width: '100%', minHeight: 90, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(128, 0, 0, 0.1)', backgroundColor: '#FFFFFF', padding: Spacing.md, fontSize: FontSize.md, color: Colors.text },
  keyboardToolbar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 94,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.1)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    alignItems: 'flex-end',
    zIndex: 20,
  },
  keyboardDoneButton: {
    backgroundColor: Colors.primary + '15',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  keyboardDoneText: {
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.sm,
  },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.xl, backgroundColor: 'rgba(252, 248, 245, 0.95)', borderTopWidth: 1, borderTopColor: 'rgba(128, 0, 0, 0.1)' },
  submitButton: { width: '100%', height: 58, backgroundColor: Colors.primary, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  submitButtonText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#FFFFFF' },
  modalContainer: { flex: 1, backgroundColor: Colors.background, padding: Spacing.lg },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  modalTitle: { color: Colors.text, fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  modalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, paddingVertical: Spacing.md },
});
