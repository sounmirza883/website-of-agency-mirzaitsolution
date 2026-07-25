import { Text, View } from 'react-native';

export function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <View className="flex-1 rounded-xl bg-surface-element p-4 dark:bg-surface-element-dark">
      <Text className="text-2xl font-bold text-text dark:text-text-dark">{value}</Text>
      <Text className="mt-0.5 text-xs text-text-secondary dark:text-text-secondary-dark">{label}</Text>
    </View>
  );
}
