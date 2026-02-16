import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '../../types';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/layout';

interface BadgeCardProps {
  badge: Badge;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export function BadgeCard({ badge, onPress, size = 'medium' }: BadgeCardProps) {
  const isUnlocked = !!badge.unlockedAt;
  const sizeMap = {
    small: { container: 60, icon: 24 },
    medium: { container: 80, icon: 32 },
    large: { container: 100, icon: 40 },
  };
  const dimensions = sizeMap[size];

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={[styles.container, { width: dimensions.container, height: dimensions.container }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.iconContainer,
          {
            width: dimensions.container - 16,
            height: dimensions.container - 16,
            backgroundColor: isUnlocked
              ? badge.color + '20'
              : 'rgba(128, 0, 0, 0.05)',
            borderColor: isUnlocked ? badge.color : 'rgba(128, 0, 0, 0.2)',
          },
        ]}
      >
        <Ionicons
          name={badge.icon as keyof typeof Ionicons.glyphMap}
          size={dimensions.icon}
          color={isUnlocked ? badge.color : 'rgba(128, 0, 0, 0.3)'}
        />
        {isUnlocked && (
          <View style={styles.checkmark}>
            <Ionicons name="checkmark-circle" size={16} color={badge.color} />
          </View>
        )}
      </View>
      {size !== 'small' && (
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.name,
              !isUnlocked && styles.nameLocked,
            ]}
            numberOfLines={1}
          >
            {badge.name}
          </Text>
          {size === 'large' && (
            <Text style={styles.description} numberOfLines={2}>
              {badge.description}
            </Text>
          )}
        </View>
      )}
    </Component>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  iconContainer: {
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  checkmark: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.full,
  },
  textContainer: {
    alignItems: 'center',
    width: '100%',
  },
  name: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    textAlign: 'center',
  },
  nameLocked: {
    color: Colors.textMuted,
    opacity: 0.5,
  },
  description: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
});
