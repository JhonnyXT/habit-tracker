import { View, type ViewProps } from 'react-native';

import { useAppTheme } from '@/core/theme';

type ThemedViewProps = ViewProps & {
  surface?: 'primary' | 'secondary' | 'elevated';
};

export function ThemedView({ surface = 'primary', style, ...rest }: ThemedViewProps) {
  const theme = useAppTheme();

  return <View style={[{ backgroundColor: theme.colors.surface[surface] }, style]} {...rest} />;
}
