import { Modal, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, interpolate } from 'react-native-reanimated';

import { useAppTheme } from '@/core/theme';
import { WheelTimePicker } from '@/core/ui/wheel-time-picker';
import { useModalProgress } from '@/core/ui/use-modal-progress';

type TimePickerModalProps = {
  visible: boolean;
  value: Date;
  onCancel: () => void;
  onConfirm: (date: Date) => void;
};

export function TimePickerModal({ visible, value, onCancel, onConfirm }: TimePickerModalProps) {
  const theme = useAppTheme();
  const { shouldRender, progress } = useModalProgress(visible);

  const scrimStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.92, 1]) }],
  }));

  return (
    <Modal visible={shouldRender} transparent animationType="none" onRequestClose={onCancel}>
      <Animated.View
        style={[
          {
            flex: 1,
            backgroundColor: theme.colors.surface.scrim,
            alignItems: 'center',
            justifyContent: 'center',
            padding: theme.spacing.lg,
          },
          scrimStyle,
        ]}
      >
        <Pressable
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
          onPress={onCancel}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />

        <Animated.View
          accessibilityViewIsModal
          style={[{ width: '100%', maxWidth: 340 }, cardStyle]}
        >
          <WheelTimePicker value={value} onCancel={onCancel} onConfirm={onConfirm} />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
