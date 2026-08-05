import { Pressable, ScrollView, Text, View } from 'react-native';
import { FieldLabel } from './field';

/**
 * Horizontal chip picker used everywhere the web app used drag-and-drop Kanban —
 * dragging is a poor touch-gesture fit on mobile, so status changes are a tap instead.
 *
 * A row of chips does not say what it selects, so callers should pass `label`.
 * It is optional only because the picker also serves as a tab bar in a few places.
 */
export function StatusPicker({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label?: string;
  value: string;
  options: string[];
  onChange: (status: string) => void;
  disabled?: boolean;
}) {
  const chips = (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="flex-row gap-2">
      {options.map((opt) => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            disabled={disabled}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(opt)}
            className={active ? 'rounded-full bg-brand px-3 py-1.5' : 'rounded-full border border-surface-selected px-3 py-1.5 dark:border-surface-selected-dark'}
          >
            <Text className={active ? 'text-xs font-medium text-[#f5ead8]' : 'text-xs font-medium text-text dark:text-text-dark'}>{opt}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );

  if (!label) return chips;
  return (
    <View>
      <FieldLabel>{label}</FieldLabel>
      {chips}
    </View>
  );
}
