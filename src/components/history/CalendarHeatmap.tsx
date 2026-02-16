import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/layout';
import { DayCompletion } from '../../types';
import {
  getFirstDayOfMonth,
  getDaysInMonth,
  getMonthName,
  getDayName,
  isToday,
  formatDate,
} from '../../utils/date';

interface CalendarHeatmapProps {
  year: number;
  month: number; // 0-indexed
  completions: DayCompletion[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

function getHeatmapColor(rate: number): string {
  if (rate === 0) return Colors.heatmap0;
  if (rate < 0.25) return Colors.heatmap1;
  if (rate < 0.5) return Colors.heatmap2;
  if (rate < 0.75) return Colors.heatmap3;
  return Colors.heatmap4;
}

export function CalendarHeatmap({
  year,
  month,
  completions,
  onPrevMonth,
  onNextMonth,
}: CalendarHeatmapProps) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Build calendar grid
  const cells: (DayCompletion | null)[] = [];
  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    cells.push(null);
  }
  // Day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDate(new Date(year, month, day));
    const completion = completions.find((c) => c.date === dateStr);
    cells.push(
      completion ?? { date: dateStr, total: 0, completed: 0, rate: 0 }
    );
  }

  return (
    <View style={styles.container}>
      {/* Month navigation */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onPrevMonth} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {getMonthName(month)} {year}
        </Text>
        <TouchableOpacity onPress={onNextMonth} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-forward" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Day headers */}
      <View style={styles.dayHeaders}>
        {[0, 1, 2, 3, 4, 5, 6].map((d) => (
          <Text key={d} style={styles.dayHeader}>
            {getDayName(d)}
          </Text>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.grid}>
        {cells.map((cell, index) => {
          if (cell === null) {
            return <View key={`empty-${index}`} style={styles.cell} />;
          }

          const dayNum = new Date(cell.date).getDate();
          const todayHighlight = isToday(cell.date);

          return (
            <View
              key={cell.date}
              style={[
                styles.cell,
                {
                  backgroundColor: getHeatmapColor(cell.rate),
                },
                todayHighlight && styles.todayCell,
              ]}
            >
              <Text
                style={[
                  styles.dayNumber,
                  todayHighlight && styles.todayText,
                  cell.rate > 0.5 && { color: Colors.text },
                ]}
              >
                {dayNum}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendLabel}>Moins</Text>
        {[Colors.heatmap0, Colors.heatmap1, Colors.heatmap2, Colors.heatmap3, Colors.heatmap4].map(
          (color, i) => (
            <View
              key={i}
              style={[styles.legendSquare, { backgroundColor: color }]}
            />
          )
        )}
        <Text style={styles.legendLabel}>Plus</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  monthTitle: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.sm,
    marginBottom: 2,
  },
  todayCell: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  dayNumber: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  todayText: {
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.lg,
  },
  legendLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginHorizontal: Spacing.xs,
  },
  legendSquare: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
});
