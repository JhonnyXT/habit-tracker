import { View } from 'react-native';

import { useAppTheme } from '@/core/theme';
import type { HabitColorToken } from '@/core/theme';
import { Icon } from '@/core/ui/icon';
import type { IconName } from '@/core/ui/icons';

export const ICON_WELL_SIZE = 40;

type IconWellProps = {
  name: IconName;
  color: HabitColorToken;
  size?: number;
  shape?: 'circle' | 'rounded';
  muted?: boolean;
};

export function IconWell({
  name,
  color,
  size = ICON_WELL_SIZE,
  shape = 'circle',
  muted = false,
}: IconWellProps) {
  const theme = useAppTheme();
  const habit = theme.colors.habit[color];

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: shape === 'circle' ? theme.radius.full : theme.radius.sm,
        backgroundColor: muted ? theme.colors.surface.elevated : habit.tint,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon
        name={name}
        size={size * 0.5}
        color={muted ? theme.colors.text.secondary : habit.solid}
      />
    </View>
  );
}
