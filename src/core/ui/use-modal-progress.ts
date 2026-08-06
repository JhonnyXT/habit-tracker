import { useEffect, useRef, useState } from 'react';
import { useSharedValue, withSpring, withTiming, type SharedValue } from 'react-native-reanimated';

import { spring, duration } from '@/core/theme/motion';

type ModalProgress = {
  shouldRender: boolean;
  progress: SharedValue<number>;
};

export function useModalProgress(visible: boolean): ModalProgress {
  const [shouldRender, setShouldRender] = useState(visible);
  const progress = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      progress.value = withSpring(1, spring.sheet);
      return;
    }

    progress.value = withTiming(0, { duration: duration.default });
    const timeout = setTimeout(() => setShouldRender(false), duration.default);
    return () => clearTimeout(timeout);
  }, [visible, progress]);

  return { shouldRender, progress };
}

export function useRetainedValue<T>(value: T | null): T | null {
  const ref = useRef<T | null>(value);
  if (value !== null) ref.current = value;
  return ref.current;
}
