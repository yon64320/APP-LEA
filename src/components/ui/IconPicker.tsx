import React from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing } from '../../constants/layout';
import { HABIT_ICONS } from '../../constants/presets';

interface IconPickerProps {
  selected: string;
  onSelect: (icon: string) => void;
  color?: string;
}

export function IconPicker({ selected, onSelect, color = Colors.primary }: IconPickerProps) {
  return (
    <ScrollView horizontal={false} style={styles.container}>
      <View style={styles.grid}>
        {HABIT_ICONS.map((icon) => (
          <TouchableOpacity
            key={icon}
            style={[
              styles.iconButton,
              selected === icon && { backgroundColor: color + '30', borderColor: color },
            ]}
            onPress={() => onSelect(icon)}
          >
            <Ionicons
              name={icon as keyof typeof Ionicons.glyphMap}
              size={24}
              color={selected === icon ? color : Colors.textSecondary}
            />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 200,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
});
