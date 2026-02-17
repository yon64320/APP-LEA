import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Habit } from '../types';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Demander les permissions de notification
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // Setup Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'HabitFlow',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'default',
      });
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Envoyer une notification de test
 */
export async function sendTestNotification(habitName?: string): Promise<void> {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn('Notification permissions not granted');
      return;
    }

    const title = 'Test HabitFlow';
    const body = habitName
      ? `C'est l'heure de compléter "${habitName}" ! 🎯`
      : `C'est l'heure de vérifier tes habitudes ! 🚀`;

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        badge: 1,
        data: {
          habitName: habitName || 'test',
          type: 'habit_reminder',
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2,
      },
    });

    console.log('Test notification scheduled');
  } catch (error) {
    console.error('Error sending test notification:', error);
  }
}

/**
 * Planifier une notification quotidienne pour une habitude
 */
export async function scheduleHabitReminder(habit: Habit): Promise<void> {
  if (!habit.reminder?.enabled || !habit.reminder?.time) {
    return;
  }

  try {
    const [hourStr, minuteStr] = habit.reminder.time.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    if (Number.isNaN(hour) || Number.isNaN(minute)) {
      console.error('Invalid reminder time format');
      return;
    }

    const identifier = `habit-${habit.id}`;

    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: 'Rappel HabitFlow',
        body: `C'est l'heure de compléter "${habit.name}" ! 🎯`,
        sound: 'default',
        badge: 1,
        data: {
          habitId: habit.id,
          habitName: habit.name,
          type: 'habit_reminder',
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });

    console.log(`Scheduled daily reminder for habit "${habit.name}" at ${habit.reminder.time}`);
  } catch (error) {
    console.error('Error scheduling habit reminder:', error);
  }
}

/**
 * Annuler la notification quotidienne pour une habitude
 */
export async function cancelHabitReminder(habitId: string): Promise<void> {
  try {
    const identifier = `habit-${habitId}`;
    await Notifications.cancelScheduledNotificationAsync(identifier);
    console.log(`Cancelled reminder for habit ${habitId}`);
  } catch (error) {
    console.error('Error cancelling habit reminder:', error);
  }
}
