import { View } from 'react-native';

import { useAppTheme } from '@/core/theme';
import { Icon, type IconName } from '@/core/ui/icon';
import { ThemedText } from '@/core/ui/themed-text';

type StatCardProps = {
  icon?: IconName;
  iconColor?: string;
  value: string;
  label: string;

  background?: string;
};

export function StatCard({ icon, iconColor, value, label, background }: StatCardProps) {
  const theme = useAppTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: background ?? theme.colors.surface.elevated,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.md,
        gap: theme.spacing.xs,
        alignItems: 'center',
      }}
    >
      {icon ? <Icon name={icon} size={18} color={iconColor ?? theme.colors.text.secondary} /> : null}
      <ThemedText variant="statValue">{value}</ThemedText>
      <ThemedText variant="footnote" color="secondary" style={{ textAlign: 'center' }}>
        {label}
      </ThemedText>
    </View>
  );
}
