import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { Habit, HabitLog } from '../../types';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, FontSize, FontWeight } from '../../constants/layout';
import { CATEGORIES } from '../../constants/presets';

// Helper function to get category label
function getCategoryLabel(category?: string): string {
  if (!category) return 'Général';
  const cat = CATEGORIES.find((c) => c.key === category);
  return cat?.label || category;
}

// Helper function to format time
function formatTime(time?: string | null): string {
  if (!time) return 'Aucune heure';
  try {
    // Format: "HH:mm" -> "HH:MM"
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const min = minutes || '00';
    // Format simple HH:MM
    return `${String(hour).padStart(2, '0')}:${min}`;
  } catch {
    return time;
  }
}


interface HabitCardProps {
  habit: Habit;
  log?: HabitLog;
  onToggle: () => void;
  onPress: () => void;
  onAdjust?: (delta: number) => void;
}

export function HabitCard({ habit, log, onToggle, onPress, onAdjust }: HabitCardProps) {
  const scale = useSharedValue(1);
  const isCompleted = log?.completed ?? false;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleToggle = () => {
    scale.value = withSequence(
      withTiming(0.95, { duration: 50 }),
      withSpring(1, { damping: 15, stiffness: 400 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[
          styles.card,
          isCompleted && { borderColor: habit.color + '60' },
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.content}>
          <TouchableOpacity
            style={[
              styles.checkbox,
              isCompleted
                ? { backgroundColor: Colors.primary, borderColor: Colors.primary }
                : { borderColor: 'rgba(128, 0, 0, 0.3)' }, // border-primary/30
            ]}
            onPress={handleToggle}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {isCompleted && (
              <Ionicons name="checkmark" size={18} color="#fff" />
            )}
          </TouchableOpacity>

          <View style={styles.infoContainer}>
            <View style={styles.nameRow}>
              <Ionicons
                name={habit.icon as keyof typeof Ionicons.glyphMap}
                size={18}
                color={Colors.primary}
                style={styles.habitIcon}
              />
              <Text
                style={[
                  styles.name,
                  isCompleted && styles.nameCompleted,
                ]}
                numberOfLines={1}
              >
                {habit.name}
              </Text>
            </View>
            <Text style={styles.timeText}>
              {getCategoryLabel(habit.category)} • {habit.reminder?.time ? formatTime(habit.reminder.time) : 'Aucune heure'}
            </Text>
          </View>
        </View>
        {habit.type === 'quantitative' && onAdjust ? (
          <View style={styles.adjustControls}>
            <TouchableOpacity style={styles.adjustButton} onPress={() => onAdjust(-1)}>
              <Ionicons name="remove" size={16} color={Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.adjustValue}>
              {Math.round(log?.value ?? 0)}{habit.unit ? ` ${habit.unit}` : ''}
            </Text>
            <TouchableOpacity style={styles.adjustButton} onPress={() => onAdjust(1)}>
              <Ionicons name="add" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-vertical" size={20} color="#D1D5DB" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF', // bg-white
    borderRadius: 8, // rounded-lg
    padding: Spacing.md, // p-4
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.05)', // border-primary/5
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24, // size-6
    height: 24,
    borderRadius: 4, // rounded (pas full)
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md, // gap-4
  },
  info: {
    flex: 1,
  },
  infoContainer: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  habitIcon: {
    marginRight: Spacing.sm,
  },
  name: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    flex: 1,
  },
  nameCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  timeText: {
    color: 'rgba(29, 12, 12, 0.4)', // text-gray-400 ou text-primary/60
    fontSize: FontSize.xs,
    marginTop: 2,
  },

  adjustControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  adjustButton: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary + '10',
  },
  adjustValue: {
    minWidth: 52,
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },

  moreButton: {
    padding: Spacing.xs,
  },
});
