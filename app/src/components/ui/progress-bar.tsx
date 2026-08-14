import { Text, View } from 'react-native';

/**
 * Matches the bar the web portals use. Value is clamped because task progress
 * comes from user input.
 */
export function ProgressBar({ value, showLabel = true }: { value: number; showLabel?: boolean }) {
  const pct = Math.max(0, Math.min(100, Math.round(value || 0)));
  return (
    <View className="flex-row items-center gap-2">
      <View className="h-2 flex-1 overflow-hidden rounded-full bg-surface-selected dark:bg-surface-selected-dark">
        <View className="h-2 rounded-full bg-brand" style={{ width: `${pct}%` }} />
      </View>
      {showLabel && <Text className="w-9 text-right text-xs text-text-secondary dark:text-text-secondary-dark">{pct}%</Text>}
    </View>
  );
}
