import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Habit, HabitType, FrequencyType, Frequency } from '../../types';
import { Colors } from '../../constants/colors';
import {
  BorderRadius,
  Spacing,
  FontSize,
  FontWeight,
} from '../../constants/layout';
import { Button } from '../ui/Button';
import { IconPicker } from '../ui/IconPicker';
import { ColorPicker } from '../ui/ColorPicker';
import { getDayName } from '../../utils/date';

interface HabitFormProps {
  initialValues?: Partial<Habit>;
  onSubmit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  submitLabel?: string;
}

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];
const WEEKDAYS = [1, 2, 3, 4, 5];

export function HabitForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'Créer',
}: HabitFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [type, setType] = useState<HabitType>(initialValues?.type ?? 'binary');
  const [target, setTarget] = useState(
    initialValues?.target?.toString() ?? ''
  );
  const [unit, setUnit] = useState(initialValues?.unit ?? '');
  const [frequencyType, setFrequencyType] = useState<FrequencyType>(
    initialValues?.frequency?.type ?? 'daily'
  );
  const [selectedDays, setSelectedDays] = useState<number[]>(
    initialValues?.frequency?.days ?? ALL_DAYS
  );
  const [icon, setIcon] = useState(initialValues?.icon ?? 'star');
  const [color, setColor] = useState(
    initialValues?.color ?? Colors.habitColors[0]
  );
  const [note, setNote] = useState(initialValues?.note ?? '');
  const [reminderEnabled, setReminderEnabled] = useState(
    initialValues?.reminder?.enabled ?? false
  );
  const [reminderTime, setReminderTime] = useState(
    initialValues?.reminder?.time ?? '08:00'
  );

  const handleSubmit = () => {
    if (!name.trim()) return;

    const frequency: Frequency = {
      type: frequencyType,
      days:
        frequencyType === 'daily'
          ? ALL_DAYS
          : frequencyType === 'weekly'
            ? WEEKDAYS
            : selectedDays,
    };

    onSubmit({
      name: name.trim(),
      type,
      target: type === 'quantitative' ? Number(target) || null : null,
      unit: type === 'quantitative' ? unit || null : null,
      frequency,
      icon,
      color,
      note: note || undefined,
      reminder: reminderEnabled
        ? { enabled: true, time: reminderTime }
        : undefined,
    });
  };

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Name */}
      <Text style={styles.label}>Nom de l'habitude</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Ex: Méditer 10 minutes"
        placeholderTextColor={Colors.textMuted}
      />

      {/* Type */}
      <Text style={styles.label}>Type</Text>
      <View style={styles.segmented}>
        <TouchableOpacity
          style={[styles.segment, type === 'binary' && styles.segmentActive]}
          onPress={() => setType('binary')}
        >
          <Text
            style={[
              styles.segmentText,
              type === 'binary' && styles.segmentTextActive,
            ]}
          >
            Fait / Pas fait
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.segment,
            type === 'quantitative' && styles.segmentActive,
          ]}
          onPress={() => setType('quantitative')}
        >
          <Text
            style={[
              styles.segmentText,
              type === 'quantitative' && styles.segmentTextActive,
            ]}
          >
            Quantitatif
          </Text>
        </TouchableOpacity>
      </View>

      {/* Target & Unit (quantitative only) */}
      {type === 'quantitative' && (
        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Objectif</Text>
            <TextInput
              style={styles.input}
              value={target}
              onChangeText={setTarget}
              placeholder="30"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>Unité</Text>
            <TextInput
              style={styles.input}
              value={unit}
              onChangeText={setUnit}
              placeholder="min"
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        </View>
      )}

      {/* Frequency */}
      <Text style={styles.label}>Fréquence</Text>
      <View style={styles.segmented}>
        {(['daily', 'weekly', 'custom'] as FrequencyType[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.segment,
              frequencyType === f && styles.segmentActive,
            ]}
            onPress={() => setFrequencyType(f)}
          >
            <Text
              style={[
                styles.segmentText,
                frequencyType === f && styles.segmentTextActive,
              ]}
            >
              {f === 'daily'
                ? 'Quotidien'
                : f === 'weekly'
                  ? 'Semaine'
                  : 'Personnalisé'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Day picker (custom only) */}
      {frequencyType === 'custom' && (
        <View style={styles.dayPicker}>
          {ALL_DAYS.map((day) => (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayButton,
                selectedDays.includes(day) && {
                  backgroundColor: color + '30',
                  borderColor: color,
                },
              ]}
              onPress={() => toggleDay(day)}
            >
              <Text
                style={[
                  styles.dayText,
                  selectedDays.includes(day) && { color },
                ]}
              >
                {getDayName(day)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Icon */}
      <Text style={styles.label}>Icône</Text>
      <IconPicker selected={icon} onSelect={setIcon} color={color} />

      {/* Color */}
      <Text style={[styles.label, { marginTop: Spacing.lg }]}>Couleur</Text>
      <ColorPicker selected={color} onSelect={setColor} />

      {/* Reminder */}
      <View style={styles.reminderRow}>
        <Text style={styles.label}>Rappel</Text>
        <Switch
          value={reminderEnabled}
          onValueChange={setReminderEnabled}
          trackColor={{ false: Colors.surfaceBorder, true: color + '80' }}
          thumbColor={reminderEnabled ? color : Colors.textMuted}
        />
      </View>

      {reminderEnabled && (
        <TextInput
          style={styles.input}
          value={reminderTime}
          onChangeText={setReminderTime}
          placeholder="08:00"
          placeholderTextColor={Colors.textMuted}
        />
      )}

      {/* Note */}
      <Text style={styles.label}>Note (optionnel)</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={note}
        onChangeText={setNote}
        placeholder="Ajouter une note..."
        placeholderTextColor={Colors.textMuted}
        multiline
        numberOfLines={3}
      />

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Annuler"
          variant="ghost"
          onPress={onCancel}
          style={{ flex: 1 }}
        />
        <Button
          title={submitLabel}
          onPress={handleSubmit}
          disabled={!name.trim()}
          style={{ flex: 1 }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  input: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: Colors.text,
    fontSize: FontSize.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  segmented: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  segment: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  segmentActive: {
    backgroundColor: Colors.primary + '25',
    borderColor: Colors.primary,
  },
  segmentText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  segmentTextActive: {
    color: Colors.primaryLight,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfField: {
    flex: 1,
  },
  dayPicker: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  dayButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  dayText: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xxl,
  },
});
