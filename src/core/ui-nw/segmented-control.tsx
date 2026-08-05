import { Pressable, Text, View } from 'react-native';
import { useColorScheme } from 'nativewind';

import { platform, rippleColor } from '@/core/ui-nw/platform-tokens';

type SegmentedControlProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  accessibilityLabel: string;
};

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  accessibilityLabel,
}: SegmentedControlProps<T>) {
  const { colorScheme } = useColorScheme();

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      className={`flex-row border border-neutral-200 bg-white p-1 dark:border-0 dark:bg-neutral-800 ${platform.cardRadius}`}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            android_ripple={{ color: rippleColor(colorScheme) }}
            className={`flex-1 items-center overflow-hidden py-2 ${platform.pillRadius} ${platform.pressFeedback} ${
              selected ? 'bg-primary-500' : ''
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                selected ? 'text-white' : 'text-neutral-600 dark:text-neutral-300'
              }`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
