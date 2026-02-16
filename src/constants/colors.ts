export const Colors = {
  // Backgrounds
  background: '#0F0F1A',
  surface: '#1A1A2E',
  surfaceLight: '#16213E',
  surfaceBorder: '#2A2A4A',

  // Primary
  primary: '#7C3AED',
  primaryLight: '#8B5CF6',
  primaryDark: '#6D28D9',

  // Accent
  accent: '#3B82F6',
  accentLight: '#60A5FA',

  // Success
  success: '#10B981',
  successLight: '#34D399',
  successDark: '#059669',

  // Warning
  warning: '#F59E0B',
  warningLight: '#FBBF24',

  // Error
  error: '#EF4444',
  errorLight: '#F87171',

  // Text
  text: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',

  // Streak colors
  streakFire: '#F97316',
  streakGold: '#EAB308',

  // Habit colors palette
  habitColors: [
    '#7C3AED', // Purple
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#8B5CF6', // Violet
    '#14B8A6', // Teal
  ],

  // Heatmap
  heatmap0: '#1A1A2E',
  heatmap1: '#1E3A5F',
  heatmap2: '#1E5A8F',
  heatmap3: '#1E7ABF',
  heatmap4: '#10B981',
} as const;

export type ColorKey = keyof typeof Colors;
