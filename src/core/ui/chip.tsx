import { useAppTheme } from '@/core/theme';
import { Icon } from '@/core/ui/icon';
import type { IconName } from '@/core/ui/icons';
import { PressableScale } from '@/core/ui/pressable-scale';
import { ThemedText } from '@/core/ui/themed-text';

type ChipProps = {
  label: string;
  icon?: IconName;
  selected?: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
};

export function Chip({ label, icon, selected = false, onPress, accessibilityLabel }: ChipProps) {
  const theme = useAppTheme();

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected }}
      activeScale={0.96}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.radius.full,
        backgroundColor: selected ? theme.colors.accent.subtle : theme.colors.surface.secondary,
      }}
    >
      {icon ? (
        <Icon
          name={icon}
          size={14}
          color={selected ? theme.colors.accent.default : theme.colors.text.secondary}
        />
      ) : null}
      <ThemedText
        variant="footnote"
        style={{
          fontWeight: '600',
          color: selected ? theme.colors.accent.default : theme.colors.text.primary,
        }}
      >
        {label}
      </ThemedText>
    </PressableScale>
  );
}
