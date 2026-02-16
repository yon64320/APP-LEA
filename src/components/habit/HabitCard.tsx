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
import { ProgressBar } from '../ui/ProgressBar';

interface HabitCardProps {
  habit: Habit;
  log?: HabitLog;
  onToggle: () => void;
  onPress: () => void;
}

export function HabitCard({ habit, log, onToggle, onPress }: HabitCardProps) {
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

  const progress =
    habit.type === 'quantitative' && habit.target
      ? (log?.value ?? 0) / habit.target
      : isCompleted
        ? 1
        : 0;

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
                ? { backgroundColor: habit.color, borderColor: habit.color }
                : { borderColor: Colors.textMuted },
            ]}
            onPress={handleToggle}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {isCompleted && (
              <Ionicons name="checkmark" size={16} color="#fff" />
            )}
          </TouchableOpacity>

          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Ionicons
                name={habit.icon as keyof typeof Ionicons.glyphMap}
                size={18}
                color={habit.color}
                style={styles.icon}
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

            {habit.type === 'quantitative' && habit.target && (
              <View style={styles.quantRow}>
                <ProgressBar
                  progress={progress}
                  color={habit.color}
                  height={4}
                />
                <Text style={styles.quantLabel}>
                  {log?.value ?? 0}/{habit.target} {habit.unit}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: Spacing.sm,
  },
  name: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    flex: 1,
  },
  nameCompleted: {
    opacity: 0.6,
  },
  quantRow: {
    marginTop: Spacing.sm,
  },
  quantLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    marginTop: 4,
  },
});
