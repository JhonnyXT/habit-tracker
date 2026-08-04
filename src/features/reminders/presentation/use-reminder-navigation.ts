import { useEffect, useRef } from 'react';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';

function habitIdFrom(response: Notifications.NotificationResponse | null): string | null {
  const habitId = response?.notification.request.content.data?.habitId;
  return typeof habitId === 'string' ? habitId : null;
}

export function useReminderNavigation(ready: boolean) {
  const lastResponse = Notifications.useLastNotificationResponse();
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (!ready || !lastResponse) return;

    const { identifier } = lastResponse.notification.request;
    if (handled.current === identifier) return;

    const habitId = habitIdFrom(lastResponse);
    if (!habitId) return;

    handled.current = identifier;
    router.push(`/habit/${habitId}`);
  }, [ready, lastResponse]);
}
