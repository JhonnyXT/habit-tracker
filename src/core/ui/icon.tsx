import { Platform, type ColorValue } from 'react-native';
import { SymbolView } from 'expo-symbols';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { icons, type IconName } from '@/core/ui/icons';

type IconProps = {
  name: IconName;
  size?: number;
  color?: ColorValue;
};

export function Icon({ name, size = 20, color }: IconProps) {
  const entry = icons[name];

  if (Platform.OS === 'ios') {
    return <SymbolView name={entry.sf} size={size} tintColor={color} resizeMode="scaleAspectFit" />;
  }

  const Set = entry.fallback.set === 'material' ? MaterialCommunityIcons : Ionicons;
  return <Set name={entry.fallback.name as never} size={size} color={color as string} />;
}
