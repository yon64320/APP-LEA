export const Colors = {
  // Backgrounds - Exactement comme dans le HTML
  background: '#f8f5f5', // background-light du HTML
  backgroundOnboarding: '#fcf8f8', // background-light du onboarding
  backgroundGradient: '#f8f5f5', // Pas de gradient, même couleur
  surface: '#FFFFFF', // Cartes blanches sur fond beige
  surfaceLight: '#FFFFFF',
  surfaceBorder: 'rgba(128, 0, 0, 0.1)', // primary/10

  // Primary - Exactement #800000 du HTML
  primary: '#800000', // Rouge foncé/marron exact
  primaryLight: '#A00000',
  primaryDark: '#600000',

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

  // Text - Exactement comme dans le HTML
  text: '#1d0c0c', // Texte principal très foncé (presque noir)
  textSecondary: 'rgba(29, 12, 12, 0.7)', // text/70
  textMuted: 'rgba(29, 12, 12, 0.5)', // text/50
  textOnDark: '#FFFFFF', // Texte blanc sur cartes sombres
  textSecondaryOnDark: '#B8B8B8', // Texte gris sur cartes sombres

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
