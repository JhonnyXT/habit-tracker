import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import { strings } from '@/core/i18n';
import type { Weekday } from '@/features/habits/domain/entities/habit';
import { parseClockTime } from '@/features/reminders/domain/entities/reminder';
import type {
  NotificationPermission,
  NotificationScheduler,
  ScheduledReminder,
} from '@/features/reminders/domain/notification-scheduler';

const CHANNEL_ID = 'reminders';

const weekdayNumbers: Record<Weekday, number> = {
  sun: 1,
  mon: 2,
  tue: 3,
  wed: 4,
  thu: 5,
  fri: 6,
  sat: 7,
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function toPermission(status: Notifications.PermissionStatus): NotificationPermission {
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'undetermined';
}

export class ExpoNotificationScheduler implements NotificationScheduler {
  private channelReady = false;

  async getPermission(): Promise<NotificationPermission> {
    const { status } = await Notifications.getPermissionsAsync();
    return toPermission(status);
  }

  async requestPermission(): Promise<NotificationPermission> {
    const current = await Notifications.getPermissionsAsync();
    if (current.status === 'granted') return 'granted';
    if (!current.canAskAgain) return toPermission(current.status);

    const { status } = await Notifications.requestPermissionsAsync();
    return toPermission(status);
  }

  async schedule(reminder: ScheduledReminder): Promise<void> {
    await this.ensureChannel();
    await this.cancel(reminder.reminderId);

    const { hour, minute } = parseClockTime(reminder.time);
    const content: Notifications.NotificationContentInput = {
      title: reminder.habitName,
      body: strings.reminders.notificationBody,
      data: { habitId: reminder.habitId },
    };

    if (reminder.days && reminder.days.length > 0) {
      for (const day of reminder.days) {
        await Notifications.scheduleNotificationAsync({
          identifier: identifierFor(reminder.reminderId, day),
          content,
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: weekdayNumbers[day],
            hour,
            minute,
            channelId: CHANNEL_ID,
          },
        });
      }
      return;
    }

    await Notifications.scheduleNotificationAsync({
      identifier: identifierFor(reminder.reminderId),
      content,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        channelId: CHANNEL_ID,
      },
    });
  }

  async cancel(reminderId: string): Promise<void> {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();

    for (const notification of scheduled) {
      if (belongsTo(notification.identifier, reminderId)) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  }

  async cancelAll(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  private async ensureChannel(): Promise<void> {
    if (this.channelReady || Platform.OS !== 'android') return;

    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: strings.reminders.channelName,
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: null,
    });
    this.channelReady = true;
  }
}

function identifierFor(reminderId: string, day?: Weekday): string {
  return day ? `${reminderId}#${day}` : reminderId;
}

function belongsTo(identifier: string, reminderId: string): boolean {
  return identifier === reminderId || identifier.startsWith(`${reminderId}#`);
}
