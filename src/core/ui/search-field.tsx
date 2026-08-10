import { useEffect, useRef, useState } from 'react';
import { TextInput, View } from 'react-native';

import { useAppTheme } from '@/core/theme';
import { Icon } from '@/core/ui/icon';

type SearchFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
};

export function SearchField({ value, onChangeText, placeholder = 'Search', autoFocus }: SearchFieldProps) {
  const theme = useAppTheme();
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!autoFocus) return;
    const timeout = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timeout);
  }, [autoFocus]);

  return (
    <View style={{ position: 'relative', justifyContent: 'center' }}>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.text.secondary}
        accessibilityLabel={placeholder}
        clearButtonMode="while-editing"
        style={{
          ...theme.typography.body,
          color: theme.colors.text.primary,
          backgroundColor: theme.colors.surface.elevated,
          borderRadius: theme.radius.md,
          paddingLeft: theme.spacing.md * 2 + 16,
          paddingRight: theme.spacing.md,
          height: 44,
          borderWidth: 2,
          borderColor: focused ? theme.colors.accent.glow : 'transparent',
          ...(focused
            ? {
                shadowColor: theme.colors.accent.default,
                shadowOpacity: theme.scheme === 'dark' ? 0.18 : 0.1,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 0 },
                elevation: 4,
              }
            : null),
        }}
      />
      <View pointerEvents="none" style={{ position: 'absolute', left: theme.spacing.md }}>
        <Icon name="search" size={16} color={focused ? theme.colors.accent.default : theme.colors.text.secondary} />
      </View>
    </View>
  );
}
