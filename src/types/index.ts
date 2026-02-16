export type HabitType = 'binary' | 'quantitative';

export type FrequencyType = 'daily' | 'weekly' | 'custom';

export type HabitCategory =
  | 'health'
  | 'sport'
  | 'productivity'
  | 'personal_development'
  | 'sleep'
  | 'reading';

export interface Frequency {
  type: FrequencyType;
  days: number[]; // 0=Sunday, 1=Monday, ... 6=Saturday
}

export interface Habit {
  id: string;
  name: string;
  type: HabitType;
  target: number | null;
  unit: string | null;
  frequency: Frequency;
  color: string;
  icon: string;
  createdAt: string;
  reminder?: {
    enabled: boolean;
    time: string; // HH:MM
  };
  note?: string;
  category?: HabitCategory;
}

export interface HabitLog {
  habitId: string;
  date: string; // YYYY-MM-DD
  value: number;
  completed: boolean;
}

export interface DayCompletion {
  date: string;
  total: number;
  completed: number;
  rate: number;
}

export interface HabitStats {
  currentStreak: number;
  bestStreak: number;
  completionRate: number;
  totalCompleted: number;
}

export interface PresetHabit {
  name: string;
  type: HabitType;
  target: number | null;
  unit: string | null;
  icon: string;
  color: string;
  category: HabitCategory;
  frequency: Frequency;
}
