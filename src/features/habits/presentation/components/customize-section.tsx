import { View } from 'react-native';

import { useAppTheme } from '@/core/theme';
import { ThemedText, Icon } from '@/core/ui';
import type { IconName } from '@/core/ui/icons';

type CustomizeSectionProps = {
  icon: IconName;
  label: string;
  children: React.ReactNode;
};

export function CustomizeSection({ icon, label, children }: CustomizeSectionProps) {
  const theme = useAppTheme();

  return (
    <View
      style={{
        borderRadius: theme.radius.xl,
        backgroundColor: theme.colors.surface.secondary,
        padding: theme.spacing.md,
        gap: theme.spacing.md,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
        <Icon name={icon} size={14} color={theme.colors.text.secondary} />
        <ThemedText variant="footnote" color="secondary" style={{ fontWeight: '600' }}>
          {label.toUpperCase()}
        </ThemedText>
      </View>
      {children}
    </View>
  );
}
