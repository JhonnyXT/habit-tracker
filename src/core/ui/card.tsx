import { View, type ViewProps } from 'react-native';

import { useAppTheme } from '@/core/theme';
import { ThemedText } from '@/core/ui/themed-text';

type CardProps = ViewProps & {
  variant?: 'card' | 'inset';
  padded?: boolean;
};

export function Card({ variant = 'card', padded = true, style, ...rest }: CardProps) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        {
          backgroundColor:
            variant === 'card' ? theme.colors.surface.secondary : theme.colors.surface.elevated,
          borderRadius: theme.radius.lg,
          padding: padded ? theme.spacing.md : 0,
          overflow: 'hidden',
        },
        style,
      ]}
      {...rest}
    />
  );
}

export function SectionHeader({ children }: { children: string }) {
  const theme = useAppTheme();

  return (
    <ThemedText
      variant="sectionHeader"
      color="secondary"
      style={{
        marginBottom: theme.spacing.sm,
        marginLeft: theme.spacing.xs,
        textTransform: 'uppercase',
      }}
    >
      {children}
    </ThemedText>
  );
}

export function Divider({ inset = 0 }: { inset?: number }) {
  const theme = useAppTheme();

  return (
    <View
      style={{
        height: 1,
        backgroundColor: theme.colors.border.default,
        marginLeft: inset,
      }}
    />
  );
}
