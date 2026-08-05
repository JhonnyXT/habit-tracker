import type { ReactNode } from 'react';
import { View } from 'react-native';

import { useAppTheme } from '@/core/theme';
import { CardDeck } from '@/core/ui/card-deck';
import { ThemedText } from '@/core/ui/themed-text';

type EmptyStateProps = {
  title: string;
  message?: string;
  deck?: boolean;
  illustration?: ReactNode;
};

export function EmptyState({ title, message, deck = false, illustration }: EmptyStateProps) {
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
      {illustration ? (
        <View style={{ marginBottom: theme.spacing.md }}>{illustration}</View>
      ) : deck ? (
        <View style={{ marginBottom: theme.spacing.md }}>
          <CardDeck />
        </View>
      ) : null}
      <ThemedText variant="title" style={{ textAlign: 'center', alignSelf: 'stretch' }}>
        {title}
      </ThemedText>
      {message ? (
        <ThemedText
          variant="subheadline"
          color="secondary"
          style={{ textAlign: 'center', alignSelf: 'stretch' }}
        >
          {message}
        </ThemedText>
      ) : null}
    </View>
  );
}
