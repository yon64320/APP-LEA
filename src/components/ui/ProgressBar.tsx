import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '../../constants/colors';
import { BorderRadius, FontSize, FontWeight } from '../../constants/layout';

interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: string;
  height?: number;
  showLabel?: boolean;
  animated?: boolean;
}

export function ProgressBar({
  progress,
  color = Colors.primary,
  height = 8,
  showLabel = false,
  animated = true,
}: ProgressBarProps) {
  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    const clampedProgress = Math.min(Math.max(progress, 0), 1);
    if (animated) {
      animatedWidth.value = withTiming(clampedProgress, {
        duration: 600,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      animatedWidth.value = clampedProgress;
    }
  }, [progress, animated]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value * 100}%` as unknown as number,
  }));

  const percentage = Math.round(progress * 100);

  return (
    <View style={styles.container}>
      {showLabel && (
        <Text style={styles.label}>{percentage}%</Text>
      )}
      <View style={[styles.track, { height }]}>
        <Animated.View
          style={[
            styles.fill,
            { backgroundColor: color, height },
            animatedStyle,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    color: Colors.text,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    marginBottom: 4,
    textAlign: 'right',
  },
  track: {
    width: '100%',
    backgroundColor: Colors.surfaceBorder,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: BorderRadius.full,
  },
});
