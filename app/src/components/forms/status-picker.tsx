import { Pressable, ScrollView, Text } from 'react-native';

/**
 * Horizontal chip picker used everywhere the web app used drag-and-drop Kanban —
 * dragging is a poor touch-gesture fit on mobile, so status changes are a tap instead.
 */
export function StatusPicker({
  value,
  options,
  onChange,
  disabled,
}: {
  value: string;
  options: string[];
  onChange: (status: string) => void;
  disabled?: boolean;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="flex-row gap-2">
      {options.map((opt) => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            disabled={disabled}
            onPress={() => onChange(opt)}
            className={active ? 'rounded-full bg-black px-3 py-1.5' : 'rounded-full border border-surface-selected px-3 py-1.5 dark:border-surface-selected-dark'}
          >
            <Text className={active ? 'text-xs font-medium text-white' : 'text-xs font-medium text-text dark:text-text-dark'}>{opt}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
