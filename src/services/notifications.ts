import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationConfig {
  habitId: string;
  habitName: string;
  time: string; // HH:MM format
  enabled: boolean;
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    // Configure channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('habit-reminders', {
        name: 'Rappels d\'habitudes',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#800000',
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Schedule a daily notification for a habit
 */
export async function scheduleHabitNotification(
  config: NotificationConfig
): Promise<string | null> {
  try {
    if (!config.enabled) {
      await cancelHabitNotification(config.habitId);
      return null;
    }

    const [hours, minutes] = config.time.split(':').map(Number);
    const identifier = `habit-${config.habitId}`;

    // Cancel existing notification
    await Notifications.cancelScheduledNotificationAsync(identifier);

    // Schedule new notification (daily at specified time)
    const notificationId = await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: 'Rappel HabitFlow',
        body: `N'oublie pas : ${config.habitName}`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: {
          habitId: config.habitId,
          type: 'habit-reminder',
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour: hours,
        minute: minutes,
        repeats: true,
      } as Notifications.CalendarTriggerInput,
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
}

/**
 * Cancel a habit notification
 */
export async function cancelHabitNotification(habitId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(`habit-${habitId}`);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
}

/**
 * Cancel all habit notifications
 */
export async function cancelAllHabitNotifications(): Promise<void> {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    const habitNotifications = notifications.filter((n) =>
      n.identifier.startsWith('habit-')
    );
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications(): Promise<
  Notifications.NotificationRequest[]
> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}

/**
 * Send immediate test notification
 */
export async function sendTestNotification(): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Test HabitFlow',
        body: 'Les notifications fonctionnent !',
        sound: true,
      },
      trigger: null, // Immediate
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
  }
}
