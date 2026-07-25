import { Text, View } from 'react-native';

export function EmptyState({ message }: { message: string }) {
  return (
    <View className="items-center justify-center px-6 py-12">
      <Text className="text-center text-sm text-text-secondary dark:text-text-secondary-dark">{message}</Text>
    </View>
  );
}
