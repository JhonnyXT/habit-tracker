import { View } from 'react-native';

import { useAppTheme } from '@/core/theme';
import { ThemedText } from '@/core/ui/themed-text';

type EmptyStateProps = {
  title: string;
  message?: string;
};

export function EmptyState({ title, message }: EmptyStateProps) {
  const theme = useAppTheme();

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.xl,
        gap: theme.spacing.sm,
      }}
    >
      <ThemedText variant="title">{title}</ThemedText>
      {message ? (
        <ThemedText variant="subheadline" color="secondary" style={{ textAlign: 'center' }}>
          {message}
        </ThemedText>
      ) : null}
    </View>
  );
}
