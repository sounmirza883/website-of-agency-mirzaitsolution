import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAdminProjects } from '@/api/admin-hooks';

export default function AdminProjectsScreen() {
  const router = useRouter();
  const { data, isLoading } = useAdminProjects();

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
        keyExtractor={(p) => String(p.id)}
        contentContainerClassName="gap-3 p-4"
        ListEmptyComponent={<EmptyState message="No projects yet" />}
        renderItem={({ item }) => (
          <Card onPress={() => router.push(`/(admin)/(tabs)/projects/${item.id}`)}>
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-2">
                <Text className="text-base font-semibold text-text dark:text-text-dark">{item.name}</Text>
                <Text className="mt-0.5 text-sm text-text-secondary dark:text-text-secondary-dark">{item.client}</Text>
                <Text className="mt-1 text-xs text-text-secondary dark:text-text-secondary-dark">Deadline: {item.deadline}</Text>
              </View>
              <StatusBadge status={item.status} />
            </View>
          </Card>
        )}
      />
    </View>
  );
}
