import { Text, type TextProps } from 'react-native';

import { useAppTheme } from '@/core/theme';
import type { TypeRole } from '@/core/theme';

type ThemedTextProps = TextProps & {
  variant?: TypeRole;
  color?: 'primary' | 'secondary';
};

export function ThemedText({ variant = 'body', color = 'primary', style, ...rest }: ThemedTextProps) {
  const theme = useAppTheme();

  return (
    <Text
      style={[
        theme.typography[variant],
        { color: theme.colors.text[color] },
        style,
      ]}
      {...rest}
    />
  );
}
