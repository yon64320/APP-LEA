const DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const DAYS_FULL_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

export function getToday(): string {
  return formatDate(new Date());
}

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDateDisplay(dateStr: string): string {
  const date = parseDate(dateStr);
  const dayName = DAYS_FULL_FR[date.getDay()];
  const day = date.getDate();
  const month = MONTHS_FR[date.getMonth()];
  return `${dayName} ${day} ${month}`;
}

export function formatDateShort(dateStr: string): string {
  const date = parseDate(dateStr);
  const day = date.getDate();
  const month = MONTHS_FR[date.getMonth()].slice(0, 3);
  return `${day} ${month}`;
}

export function getDayName(dayIndex: number): string {
  return DAYS_FR[dayIndex];
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getMonthName(month: number): string {
  return MONTHS_FR[month];
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function addDays(dateStr: string, days: number): string {
  const date = parseDate(dateStr);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

export function getDaysBetween(start: string, end: string): string[] {
  const days: string[] = [];
  let current = start;
  while (current <= end) {
    days.push(current);
    current = addDays(current, 1);
  }
  return days;
}

export function isToday(dateStr: string): boolean {
  return dateStr === getToday();
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
}
