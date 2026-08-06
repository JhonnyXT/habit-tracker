import { Modal, Pressable, ScrollView, Switch, View } from 'react-native';
import Animated, { useAnimatedStyle, interpolate } from 'react-native-reanimated';

import { useAppTheme } from '@/core/theme';
import { strings } from '@/core/i18n';
import { ThemedText, PressableScale, useModalProgress } from '@/core/ui';
import { CustomizeSection } from '@/features/habits/presentation/components/customize-section';

type TaskCustomizeSheetProps = {
  visible: boolean;
  urgent: boolean;
  onUrgentChange: (value: boolean) => void;
  pinned: boolean;
  onPinnedChange: (value: boolean) => void;
  onClose: () => void;
};

export function TaskCustomizeSheet({
  visible,
  urgent,
  onUrgentChange,
  pinned,
  onPinnedChange,
  onClose,
}: TaskCustomizeSheetProps) {
  const theme = useAppTheme();
  const { shouldRender, progress } = useModalProgress(visible);

  const scrimStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: interpolate(progress.value, [0, 1], [24, 0]) }],
  }));

  return (
    <Modal visible={shouldRender} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View
        style={[
          { flex: 1, backgroundColor: theme.colors.surface.scrim, justifyContent: 'flex-end' },
          scrimStyle,
        ]}
      >
        <Pressable
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
          onPress={onClose}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />

        <Animated.View
          accessibilityViewIsModal
          style={[
            {
              maxHeight: '85%',
              borderTopLeftRadius: theme.radius.xl,
              borderTopRightRadius: theme.radius.xl,
              backgroundColor: theme.colors.surface.primary,
            },
            cardStyle,
          ]}
        >
          <View style={{ alignItems: 'center', paddingTop: theme.spacing.sm }}>
            <View
              style={{
                width: 36,
                height: 4,
                borderRadius: theme.radius.full,
                backgroundColor: theme.colors.border.default,
              }}
            />
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: theme.spacing.md,
              paddingTop: theme.spacing.md,
              paddingBottom: theme.spacing.sm,
            }}
          >
            <PressableScale
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={strings.form.close}
              style={{
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.xs,
                borderRadius: theme.radius.full,
                backgroundColor: theme.colors.surface.secondary,
              }}
            >
              <ThemedText variant="body" style={{ fontWeight: '600' }}>
                {strings.form.close}
              </ThemedText>
            </PressableScale>

            <ThemedText variant="headline">{strings.form.taskCustomize}</ThemedText>

            <PressableScale
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={strings.form.done}
              style={{
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.xs,
                borderRadius: theme.radius.full,
                backgroundColor: theme.colors.surface.secondary,
              }}
            >
              <ThemedText variant="body" style={{ fontWeight: '600' }}>
                {strings.form.done}
              </ThemedText>
            </PressableScale>
          </View>

          <ScrollView
            contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}
            showsVerticalScrollIndicator={false}
          >
          <CustomizeSection icon="sliders" label={strings.form.taskBehaviorSection}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.md }}>
                <View style={{ flex: 1, gap: 2 }}>
                  <ThemedText variant="body" style={{ fontWeight: '600' }}>
                    {strings.form.taskUrgent}
                  </ThemedText>
                  <ThemedText variant="footnote" color="secondary">
                    {strings.form.taskUrgentNote}
                  </ThemedText>
                </View>
                <Switch
                  value={urgent}
                  onValueChange={onUrgentChange}
                  accessibilityLabel={strings.form.taskUrgent}
                  trackColor={{ true: theme.colors.accent.default }}
                />
              </View>

              <View
                style={{
                  height: 1,
                  backgroundColor: theme.colors.border.default,
                  marginVertical: theme.spacing.md,
                }}
              />

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ThemedText variant="body" style={{ flex: 1, fontWeight: '600' }}>
                  {strings.form.taskPinned}
                </ThemedText>
                <Switch
                  value={pinned}
                  onValueChange={onPinnedChange}
                  accessibilityLabel={strings.form.taskPinned}
                  trackColor={{ true: theme.colors.accent.default }}
                />
              </View>
            </View>
          </CustomizeSection>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
