import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHabitStore } from '../src/store/habitStore';
import { Colors } from '../src/constants/colors';
import { Spacing, FontSize, FontWeight } from '../src/constants/layout';

export default function HabitsScreen() {
  const habits = useHabitStore((s) => s.habits);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Mes habitudes</Text>
        <TouchableOpacity onPress={() => router.push('/habit/create')}>
          <Ionicons name="add" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {habits.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="list-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>Aucune habitude pour le moment.</Text>
          </View>
        ) : (
          habits.map((habit) => (
            <TouchableOpacity
              key={habit.id}
              style={styles.habitItem}
              onPress={() => router.push(`/habit/${habit.id}`)}
            >
              <View style={styles.leftRow}>
                <View style={[styles.iconBox, { backgroundColor: habit.color + '20' }]}>
                  <Ionicons
                    name={habit.icon as keyof typeof Ionicons.glyphMap}
                    size={20}
                    color={habit.color}
                  />
                </View>
                <View>
                  <Text style={styles.habitName}>{habit.name}</Text>
                  <Text style={styles.habitMeta}>
                    {habit.type === 'binary'
                      ? 'Binaire'
                      : `${habit.target ?? 0} ${habit.unit ?? ''}`}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  content: { padding: Spacing.xl, gap: Spacing.md, paddingBottom: Spacing.xxxl },
  empty: { alignItems: 'center', paddingVertical: Spacing.xxxl, gap: Spacing.md },
  emptyText: { color: Colors.textMuted, fontSize: FontSize.md },
  habitItem: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 12,
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitName: { color: Colors.text, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  habitMeta: { color: Colors.textSecondary, fontSize: FontSize.sm },
});
