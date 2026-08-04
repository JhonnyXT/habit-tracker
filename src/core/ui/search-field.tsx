import { TextInput, View } from 'react-native';

import { useAppTheme } from '@/core/theme';
import { Icon } from '@/core/ui/icon';

type SearchFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function SearchField({ value, onChangeText, placeholder = 'Search' }: SearchFieldProps) {
  const theme = useAppTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        height: 44,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.surface.elevated,
      }}
    >
      <Icon name="search" size={16} color={theme.colors.text.secondary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.text.secondary}
        accessibilityLabel={placeholder}
        clearButtonMode="while-editing"
        style={{
          flex: 1,
          ...theme.typography.body,
          color: theme.colors.text.primary,
        }}
      />
    </View>
  );
}
