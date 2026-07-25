import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { useClientNotifications } from '@/api/client-role-hooks';

export default function ClientNotificationsScreen() {
  const { data, isLoading } = useClientNotifications();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface dark:bg-surface-dark">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface dark:bg-surface-dark">
      <FlatList
        data={data ?? []}
        keyExtractor={(n) => String(n.id)}
        contentContainerClassName="gap-3 p-4"
        ListEmptyComponent={<EmptyState message="No notifications yet" />}
        renderItem={({ item }) => (
          <Card>
            <Text className="text-base font-semibold text-text dark:text-text-dark">{item.title}</Text>
            <Text className="mt-1 text-sm text-text-secondary dark:text-text-secondary-dark">{item.msg}</Text>
            <Text className="mt-2 text-xs text-text-secondary dark:text-text-secondary-dark">{item.date}</Text>
          </Card>
        )}
      />
    </View>
  );
}
