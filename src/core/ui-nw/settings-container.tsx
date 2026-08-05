import { View, Text, type ViewProps } from 'react-native';

import { platform } from '@/core/ui-nw/platform-tokens';

type SettingsContainerProps = ViewProps & {
  title?: string;
};

export function SettingsContainer({ title, children, className, ...rest }: SettingsContainerProps) {
  return (
    <>
      {title ? (
        <Text className="mb-2 ml-1 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          {title}
        </Text>
      ) : null}
      <View
        className={`overflow-hidden border border-neutral-200 bg-white dark:border-0 dark:bg-neutral-800 ${platform.cardRadius} ${platform.cardShadow} ${className ?? ''}`}
        {...rest}
      >
        {children}
      </View>
    </>
  );
}
