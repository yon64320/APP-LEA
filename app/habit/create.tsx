import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHabitStore } from '../../src/store/habitStore';
import { HabitForm } from '../../src/components/habit/HabitForm';
import { Colors } from '../../src/constants/colors';
import { Spacing, FontSize, FontWeight } from '../../src/constants/layout';

export default function CreateHabitScreen() {
  const addHabit = useHabitStore((s) => s.addHabit);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Nouvelle habitude</Text>
        <View style={{ width: 28 }} />
      </View>
      <HabitForm
        onSubmit={(habit) => {
          addHabit(habit);
          router.back();
        }}
        onCancel={() => router.back()}
      />
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
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  title: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },
});
