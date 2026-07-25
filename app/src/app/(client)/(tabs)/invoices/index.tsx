import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { useClientInvoices } from '@/api/client-role-hooks';

export default function ClientInvoicesScreen() {
  const router = useRouter();
  const { data, isLoading } = useClientInvoices();

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
        keyExtractor={(i) => String(i.id)}
        contentContainerClassName="gap-3 p-4"
        ListEmptyComponent={<EmptyState message="No invoices yet" />}
        renderItem={({ item }) => (
          <Card onPress={() => router.push(`/(client)/(tabs)/invoices/${item.id}`)}>
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-2">
                <Text className="text-base font-semibold text-text dark:text-text-dark">{item.project}</Text>
                <Text className="mt-0.5 text-sm text-text-secondary dark:text-text-secondary-dark">{item.amount}</Text>
                <Text className="mt-1 text-xs text-text-secondary dark:text-text-secondary-dark">Due: {item.due}</Text>
              </View>
              <StatusBadge status={item.status} />
            </View>
          </Card>
        )}
      />
    </View>
  );
}
