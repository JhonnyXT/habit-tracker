import { View } from 'react-native';

import { useAppTheme } from '@/core/theme';
import { Icon, type IconName } from '@/core/ui/icon';
import { PressableScale } from '@/core/ui/pressable-scale';
import { ThemedText } from '@/core/ui/themed-text';

type ListRowProps = {
  label: string;
  icon?: IconName;

  iconColor?: string;

  detail?: string;
  detailColor?: string;
  showChevron?: boolean;
  destructive?: boolean;
  onPress?: () => void;
};

export function ListRow({
  label,
  icon,
  iconColor,
  detail,
  detailColor,
  showChevron = false,
  destructive = false,
  onPress,
}: ListRowProps) {
  const theme = useAppTheme();
  const labelColor = destructive ? theme.colors.state.danger : theme.colors.text.primary;

  return (
    <PressableScale
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={detail ? `${label}, ${detail}` : label}
      activeScale={0.99}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        paddingVertical: theme.spacing.sm + 2,
        paddingHorizontal: theme.spacing.md,
        minHeight: 48,
      }}
    >
      {icon ? (
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: theme.radius.sm,
            backgroundColor: iconColor ?? theme.colors.text.secondary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name={icon} size={16} color="#FFFFFF" />
        </View>
      ) : null}

      <ThemedText variant="body" style={{ flex: 1, color: labelColor }}>
        {label}
      </ThemedText>

      {detail ? (
        <ThemedText variant="body" style={{ color: detailColor ?? theme.colors.text.secondary }}>
          {detail}
        </ThemedText>
      ) : null}

      {showChevron ? (
        <Icon name="chevron" size={16} color={theme.colors.text.secondary} />
      ) : null}
    </PressableScale>
  );
}
