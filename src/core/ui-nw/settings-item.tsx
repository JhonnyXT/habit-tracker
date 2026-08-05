import { Pressable, Text, View } from 'react-native';
import { useColorScheme } from 'nativewind';

import { Icon } from '@/core/ui/icon';
import type { IconName } from '@/core/ui/icons';
import {
  iconWellClassName,
  iconWellColor,
  platform,
  rippleColor,
  type IconWellTone,
} from '@/core/ui-nw/platform-tokens';

type SettingsItemProps = {
  label: string;
  icon?: IconName;
  tone?: IconWellTone;
  detail?: string;
  destructive?: boolean;
  showChevron?: boolean;
  onPress?: () => void;
  isLast?: boolean;
};

export function SettingsItem({
  label,
  icon,
  tone = 'primary',
  detail,
  destructive = false,
  showChevron = false,
  onPress,
  isLast = false,
}: SettingsItemProps) {
  const isPressable = onPress !== undefined;
  const { colorScheme } = useColorScheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={!isPressable}
      accessibilityRole={isPressable ? 'button' : undefined}
      accessibilityLabel={detail ? `${label}, ${detail}` : label}
      android_ripple={isPressable ? { color: rippleColor(colorScheme) } : undefined}
      className={`min-h-[52px] flex-row items-center gap-3 px-4 py-3 ${platform.pressFeedback} ${
        isLast ? '' : 'border-b border-neutral-200 dark:border-neutral-700/60'
      }`}
    >
      {icon ? (
        <View
          className={`size-8 items-center justify-center ${platform.iconRadius} ${iconWellClassName(tone)}`}
        >
          <Icon name={icon} size={16} color={iconWellColor(tone, colorScheme)} />
        </View>
      ) : null}

      <Text
        className={`flex-1 text-base ${
          destructive ? 'font-semibold text-danger-500 dark:text-danger-600' : 'text-neutral-900 dark:text-neutral-50'
        }`}
      >
        {label}
      </Text>

      {detail ? (
        <Text className="text-[15px] text-neutral-500 dark:text-neutral-400">{detail}</Text>
      ) : null}

      {showChevron ? (
        <Icon name="chevron" size={14} color="#9B9BA3" />
      ) : null}
    </Pressable>
  );
}
