import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { Habit, HabitLog } from '../types';
import { getToday, formatDate } from '../utils/date';

interface HabitState {
  habits: Habit[];
  logs: HabitLog[];

  // Actions
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitCompletion: (habitId: string, date: string) => void;
  setHabitValue: (habitId: string, date: string, value: number) => void;

  // Queries
  getHabitsForDate: (date: string) => Habit[];
  getLogForHabitDate: (habitId: string, date: string) => HabitLog | undefined;
  getLogsForDate: (date: string) => HabitLog[];
  getLogsForHabit: (habitId: string) => HabitLog[];
  getCompletionRateForDate: (date: string) => number;
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      logs: [],

      addHabit: (habitData) => {
        const habit: Habit = {
          ...habitData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ habits: [...state.habits, habit] }));
      },

      updateHabit: (id, updates) => {
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === id ? { ...h, ...updates } : h
          ),
        }));
      },

      deleteHabit: (id) => {
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
          logs: state.logs.filter((l) => l.habitId !== id),
        }));
      },

      toggleHabitCompletion: (habitId, date) => {
        const existing = get().logs.find(
          (l) => l.habitId === habitId && l.date === date
        );

        if (existing) {
          set((state) => ({
            logs: state.logs.map((l) =>
              l.habitId === habitId && l.date === date
                ? { ...l, completed: !l.completed, value: l.completed ? 0 : 1 }
                : l
            ),
          }));
        } else {
          set((state) => ({
            logs: [
              ...state.logs,
              { habitId, date, value: 1, completed: true },
            ],
          }));
        }
      },

      setHabitValue: (habitId, date, value) => {
        const habit = get().habits.find((h) => h.id === habitId);
        const completed = habit?.target ? value >= habit.target : value > 0;

        const existing = get().logs.find(
          (l) => l.habitId === habitId && l.date === date
        );

        if (existing) {
          set((state) => ({
            logs: state.logs.map((l) =>
              l.habitId === habitId && l.date === date
                ? { ...l, value, completed }
                : l
            ),
          }));
        } else {
          set((state) => ({
            logs: [...state.logs, { habitId, date, value, completed }],
          }));
        }
      },

      getHabitsForDate: (date) => {
        const dayOfWeek = new Date(date).getDay();
        return get().habits.filter((habit) => {
          if (habit.frequency.type === 'daily') return true;
          return habit.frequency.days.includes(dayOfWeek);
        });
      },

      getLogForHabitDate: (habitId, date) => {
        return get().logs.find(
          (l) => l.habitId === habitId && l.date === date
        );
      },

      getLogsForDate: (date) => {
        return get().logs.filter((l) => l.date === date);
      },

      getLogsForHabit: (habitId) => {
        return get().logs.filter((l) => l.habitId === habitId);
      },

      getCompletionRateForDate: (date) => {
        const habits = get().getHabitsForDate(date);
        if (habits.length === 0) return 0;
        const logs = get().getLogsForDate(date);
        const completed = habits.filter((h) =>
          logs.some((l) => l.habitId === h.id && l.completed)
        ).length;
        return completed / habits.length;
      },
    }),
    {
      name: 'habit-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
