import { Platform, View, type GestureResponderEvent } from 'react-native';

import { useAppTheme, minTouchTarget } from '@/core/theme';
import { Icon } from '@/core/ui/icon';
import type { IconName } from '@/core/ui/icons';
import { PressableScale } from '@/core/ui/pressable-scale';
import { ThemedText } from '@/core/ui/themed-text';

type ButtonVariant = 'primary' | 'secondary' | 'destructive';

type ButtonProps = {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  icon?: IconName;
  disabled?: boolean;
  accessibilityLabel?: string;

  tint?: string;
};

const minHeight = Platform.select({ ios: minTouchTarget.ios, android: minTouchTarget.android }) ?? 44;

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  accessibilityLabel,
  tint,
}: ButtonProps) {
  const theme = useAppTheme();

  const background = {
    primary: tint ?? theme.colors.accent.default,
    secondary: theme.colors.surface.elevated,
    destructive: theme.colors.state.dangerSubtle,
  }[variant];

  const foreground = {
    primary: theme.colors.text.onSolid,
    secondary: theme.colors.text.primary,
    destructive: theme.colors.state.danger,
  }[variant];

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: Boolean(disabled) }}
      style={{
        minHeight: minHeight + 6,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: theme.radius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: background,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
        {icon ? <Icon name={icon} size={18} color={foreground} /> : null}
        <ThemedText variant="headline" style={{ color: foreground }}>
          {label}
        </ThemedText>
      </View>
    </PressableScale>
  );
}
