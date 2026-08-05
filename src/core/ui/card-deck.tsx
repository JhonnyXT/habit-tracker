import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  useReducedMotion,
  Easing,
} from 'react-native-reanimated';

import { useAppTheme } from '@/core/theme';

const CARD_WIDTH = 132;
const CARD_HEIGHT = 78;
const STAGGER_MS = 60;
const ENTER_MS = 280;

const layers = [
  { rotate: '-8deg', translateY: 10, translateX: -10 },
  { rotate: '7deg', translateY: 6, translateX: 10 },
  { rotate: '0deg', translateY: 0, translateX: 0 },
];

function Layer({ rotate, translateY, translateX, order, background }: {
  rotate: string;
  translateY: number;
  translateX: number;
  order: number;
  background: string;
}) {
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(reducedMotion ? 1 : 0);

  useEffect(() => {
    progress.value = withDelay(
      order * STAGGER_MS,
      withTiming(1, { duration: ENTER_MS, easing: Easing.out(Easing.quad) }),
    );
  }, [order, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: translateY + (1 - progress.value) * 10 },
      { translateX },
      { rotate },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          borderRadius: 20,
          backgroundColor: background,
        },
        animatedStyle,
      ]}
    />
  );
}

export function CardDeck() {
  const theme = useAppTheme();
  const backgrounds = [theme.colors.surface.elevated, theme.colors.surface.elevated, theme.colors.surface.secondary];

  return (
    <View style={{ width: CARD_WIDTH + 20, height: CARD_HEIGHT + 20, alignItems: 'center', justifyContent: 'center' }}>
      {layers.map((layer, index) => (
        <Layer key={index} order={index} background={backgrounds[index]} {...layer} />
      ))}
    </View>
  );
}
