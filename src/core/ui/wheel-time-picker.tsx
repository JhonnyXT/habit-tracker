import { memo, useCallback, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { useAppTheme } from '@/core/theme';
import { strings } from '@/core/i18n';
import { Button } from '@/core/ui/button';
import { PressableScale } from '@/core/ui/pressable-scale';
import { ThemedText } from '@/core/ui/themed-text';

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 3;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

type WheelItemProps = {
  value: number;
  selected: boolean;
  accent?: boolean;
  format: (value: number) => string;
  onPress: () => void;
};

const WheelItem = memo(function WheelItem({ value, selected, accent, format, onPress }: WheelItemProps) {
  const theme = useAppTheme();
  return (
    <Pressable onPress={onPress} style={{ height: ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center' }}>
      <ThemedText
        variant={selected ? 'title' : 'body'}
        style={{
          fontWeight: selected ? '700' : '500',
          color: selected
            ? accent
              ? theme.colors.accent.default
              : theme.colors.text.primary
            : theme.colors.text.secondary,
          opacity: selected ? 1 : 0.4,
        }}
      >
        {format(value)}
      </ThemedText>
    </Pressable>
  );
});

type WheelColumnProps = {
  values: number[];
  selectedValue: number;
  onSelect: (value: number) => void;
  format: (value: number) => string;
  accent?: boolean;
  accessibilityLabel: string;
};

const getItemLayout = (_data: unknown, index: number) => ({
  length: ITEM_HEIGHT,
  offset: ITEM_HEIGHT * index,
  index,
});

const keyExtractor = (value: number) => String(value);

const WheelColumn = memo(function WheelColumn({
  values,
  selectedValue,
  onSelect,
  format,
  accent,
  accessibilityLabel,
}: WheelColumnProps) {
  const theme = useAppTheme();
  const listRef = useRef<FlatList<number>>(null);

  const selectIndex = useCallback((index: number, animated: boolean) => {
    listRef.current?.scrollToIndex({ index, animated });
  }, []);

  const onMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(values.length - 1, index));
      const value = values[clamped];
      if (value !== selectedValue) {
        Haptics.selectionAsync();
        onSelect(value);
      }
    },
    [values, selectedValue, onSelect],
  );

  const renderItem = useCallback(
    ({ item }: { item: number }) => (
      <WheelItem
        value={item}
        selected={item === selectedValue}
        accent={accent}
        format={format}
        onPress={() => selectIndex(values.indexOf(item), true)}
      />
    ),
    [selectedValue, accent, format, selectIndex, values],
  );

  return (
    <View
      style={{ height: WHEEL_HEIGHT, width: 64 }}
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ text: format(selectedValue) }}
    >
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: ITEM_HEIGHT,
          left: 0,
          right: 0,
          height: ITEM_HEIGHT,
          borderRadius: theme.radius.md,
          backgroundColor: accent ? theme.colors.accent.subtle : theme.colors.surface.elevated,
        }}
      />
      <FlatList
        ref={listRef}
        data={values}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        initialScrollIndex={values.indexOf(selectedValue)}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT }}
        onMomentumScrollEnd={onMomentumScrollEnd}
        maxToRenderPerBatch={VISIBLE_ITEMS + 2}
        windowSize={3}
        removeClippedSubviews
      />
    </View>
  );
});

const hourValues = Array.from({ length: 12 }, (_, index) => index + 1);
const minuteValues = Array.from({ length: 60 }, (_, index) => index);
const twoDigits = (value: number) => String(value).padStart(2, '0');

export type WheelTimePickerProps = {
  value: Date;
  onCancel: () => void;
  onConfirm: (date: Date) => void;
};

export function WheelTimePicker({ value, onCancel, onConfirm }: WheelTimePickerProps) {
  const theme = useAppTheme();
  const initialHour24 = value.getHours();
  const [hour12, setHour12] = useState(
    initialHour24 % 12 === 0 ? 12 : initialHour24 % 12,
  );
  const [minute, setMinute] = useState(value.getMinutes());
  const [period, setPeriod] = useState<'AM' | 'PM'>(initialHour24 >= 12 ? 'PM' : 'AM');

  const onConfirmPress = () => {
    const hour24 = period === 'AM' ? hour12 % 12 : (hour12 % 12) + 12;
    const date = new Date(value);
    date.setHours(hour24, minute, 0, 0);
    onConfirm(date);
  };

  return (
    <View
      style={{
        backgroundColor: theme.colors.surface.secondary,
        borderRadius: theme.radius.xl,
        overflow: 'hidden',
      }}
    >
      <View style={{ paddingTop: theme.spacing.md, alignItems: 'center' }}>
        <ThemedText variant="headline">{strings.form.selectTime}</ThemedText>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.spacing.sm,
          paddingVertical: theme.spacing.md,
        }}
      >
        <WheelColumn
          values={hourValues}
          selectedValue={hour12}
          onSelect={setHour12}
          format={twoDigits}
          accent
          accessibilityLabel={strings.a11y.hourWheel}
        />
        <ThemedText variant="title" style={{ color: theme.colors.text.secondary }}>
          :
        </ThemedText>
        <WheelColumn
          values={minuteValues}
          selectedValue={minute}
          onSelect={setMinute}
          format={twoDigits}
          accessibilityLabel={strings.a11y.minuteWheel}
        />

        <View style={{ marginLeft: theme.spacing.sm, gap: theme.spacing.xxs }}>
          {(['AM', 'PM'] as const).map((option) => {
            const selected = period === option;
            return (
              <PressableScale
                key={option}
                onPress={() => {
                  Haptics.selectionAsync();
                  setPeriod(option);
                }}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={option === 'AM' ? strings.a11y.periodAM : strings.a11y.periodPM}
                style={{
                  paddingHorizontal: theme.spacing.sm,
                  paddingVertical: 6,
                  borderRadius: theme.radius.sm,
                  backgroundColor: selected ? theme.colors.accent.default : theme.colors.surface.elevated,
                }}
              >
                <ThemedText
                  variant="footnote"
                  style={{
                    color: selected ? theme.colors.text.onSolid : theme.colors.text.secondary,
                    fontWeight: '600',
                  }}
                >
                  {option === 'AM' ? strings.a11y.periodAM : strings.a11y.periodPM}
                </ThemedText>
              </PressableScale>
            );
          })}
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: theme.spacing.md,
          paddingHorizontal: theme.spacing.md,
          paddingBottom: theme.spacing.md,
        }}
      >
        <PressableScale onPress={onCancel} accessibilityRole="button" accessibilityLabel={strings.form.cancel}>
          <View style={{ paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.sm }}>
            <ThemedText variant="body" color="secondary" style={{ fontWeight: '600' }}>
              {strings.form.cancel}
            </ThemedText>
          </View>
        </PressableScale>
        <Button label="OK" onPress={onConfirmPress} accessibilityLabel={strings.form.selectTime} />
      </View>
    </View>
  );
}
