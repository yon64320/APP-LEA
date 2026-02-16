import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/layout';

interface StatsCardProps {
  icon: string;
  iconColor: string;
  label: string;
  value: string | number;
}

export function StatsCard({ icon, iconColor, label, value }: StatsCardProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.iconBox, { backgroundColor: iconColor + '20' }]}>
        <Ionicons
          name={icon as keyof typeof Ionicons.glyphMap}
          size={22}
          color={iconColor}
        />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  value: {
    color: Colors.text,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    marginTop: 2,
    textAlign: 'center',
  },
});
