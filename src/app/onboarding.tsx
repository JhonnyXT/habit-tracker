import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useAppTheme, type HabitColorToken } from '@/core/theme';
import { strings } from '@/core/i18n';
import { ThemedText, Button, PressableScale, Icon, IconWell, Enter, type IconName } from '@/core/ui';
import { useOnboardingStore } from '@/features/onboarding/presentation/store';

type Pillar = {
  icon: IconName;
  color: HabitColorToken;
  title: string;
  body: string;
};

const pillars: Pillar[] = [
  {
    icon: 'moon',
    color: 'blue',
    title: strings.onboarding.privateTitle,
    body: strings.onboarding.privateBody,
  },
  {
    icon: 'chart',
    color: 'green',
    title: strings.onboarding.consistencyTitle,
    body: strings.onboarding.consistencyBody,
  },
  {
    icon: 'checkCircle',
    color: 'orange',
    title: strings.onboarding.startSmallTitle,
    body: strings.onboarding.startSmallBody,
  },
];

export default function OnboardingScreen() {
  const theme = useAppTheme();
  const complete = useOnboardingStore((state) => state.complete);

  const finish = (createHabit: boolean) => {
    Haptics.selectionAsync();
    complete(createHabit);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.surface.primary }}
      edges={['top', 'bottom']}
    >
      <View style={{ flex: 1, paddingHorizontal: theme.spacing.lg, justifyContent: 'center' }}>
        <Enter index={0} style={{ alignItems: 'center', gap: theme.spacing.sm }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: theme.radius.full,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.accent.subtle,
              marginBottom: theme.spacing.sm,
            }}
          >
            <Icon name="today" size={34} color={theme.colors.accent.default} />
          </View>

          <ThemedText variant="largeTitle" style={{ textAlign: 'center' }}>
            {strings.onboarding.title}
          </ThemedText>
          <ThemedText
            variant="subheadline"
            color="secondary"
            style={{ textAlign: 'center', maxWidth: 300 }}
          >
            {strings.onboarding.tagline}
          </ThemedText>
        </Enter>

        <View style={{ gap: theme.spacing.lg, marginTop: theme.spacing.xxl }}>
          {pillars.map((pillar, index) => (
            <Enter
              key={pillar.title}
              index={index + 1}
              style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.md }}
            >
              <IconWell name={pillar.icon} color={pillar.color} size={40} />

              <View style={{ flex: 1, gap: 2 }}>
                <ThemedText variant="headline">{pillar.title}</ThemedText>
                <ThemedText variant="footnote" color="secondary">
                  {pillar.body}
                </ThemedText>
              </View>
            </Enter>
          ))}
        </View>
      </View>

      <Enter
        index={4}
        style={{
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: theme.spacing.md,
          gap: theme.spacing.xs,
        }}
      >
        <Button label={strings.onboarding.createFirst} icon="add" onPress={() => finish(true)} />

        <PressableScale
          onPress={() => finish(false)}
          accessibilityRole="button"
          accessibilityLabel={strings.onboarding.skip}
          activeScale={0.98}
          style={{ alignItems: 'center', paddingVertical: theme.spacing.md }}
        >
          <ThemedText variant="subheadline" color="secondary">
            {strings.onboarding.skip}
          </ThemedText>
        </PressableScale>
      </Enter>
    </SafeAreaView>
  );
}
