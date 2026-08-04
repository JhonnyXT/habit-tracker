import type {
  NotificationPermission,
  NotificationScheduler,
} from '@/features/reminders/domain/notification-scheduler';

export function getNotificationPermissionUseCase(scheduler: NotificationScheduler) {
  return (): Promise<NotificationPermission> => scheduler.getPermission();
}

export function requestNotificationPermissionUseCase(scheduler: NotificationScheduler) {
  return (): Promise<NotificationPermission> => scheduler.requestPermission();
}
