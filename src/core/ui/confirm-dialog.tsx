import { Modal, Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, interpolate } from 'react-native-reanimated';

import { useAppTheme } from '@/core/theme';
import type { HabitColorToken } from '@/core/theme';
import { Button } from '@/core/ui/button';
import { IconWell } from '@/core/ui/icon-well';
import type { IconName } from '@/core/ui/icons';
import { PressableScale } from '@/core/ui/pressable-scale';
import { ThemedText } from '@/core/ui/themed-text';
import { useModalProgress } from '@/core/ui/use-modal-progress';

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onDismiss: () => void;
  cancelLabel?: string;
  icon?: IconName;
  iconColor?: HabitColorToken;
  destructive?: boolean;
};

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  onConfirm,
  onDismiss,
  cancelLabel,
  icon,
  iconColor = 'orange',
  destructive = false,
}: ConfirmDialogProps) {
  const theme = useAppTheme();
  const { shouldRender, progress } = useModalProgress(visible);

  const scrimStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.92, 1]) }],
  }));

  return (
    <Modal visible={shouldRender} transparent animationType="none" onRequestClose={onDismiss}>
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
          onPress={onDismiss}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />

        <Animated.View
          accessibilityViewIsModal
          accessibilityRole="alert"
          style={[
            {
              width: '100%',
              maxWidth: 340,
              borderRadius: theme.radius.xl,
              backgroundColor: theme.colors.surface.secondary,
              padding: theme.spacing.lg,
              gap: theme.spacing.md,
              alignItems: 'center',
            },
            cardStyle,
          ]}
        >
          {icon ? <IconWell name={icon} color={iconColor} size={56} /> : null}

          <View style={{ gap: theme.spacing.sm, alignItems: 'center' }}>
            <ThemedText variant="title" style={{ textAlign: 'center' }}>
              {title}
            </ThemedText>
            <ThemedText variant="subheadline" color="secondary" style={{ textAlign: 'center' }}>
              {message}
            </ThemedText>
          </View>

          <View style={{ width: '100%', gap: theme.spacing.xs }}>
            <Button
              label={confirmLabel}
              onPress={onConfirm}
              variant={destructive ? 'destructive' : 'primary'}
            />

            {cancelLabel ? (
              <PressableScale onPress={onDismiss} accessibilityRole="button">
                <View style={{ paddingVertical: theme.spacing.md, alignItems: 'center' }}>
                  <ThemedText variant="body" color="secondary">
                    {cancelLabel}
                  </ThemedText>
                </View>
              </PressableScale>
            ) : null}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
