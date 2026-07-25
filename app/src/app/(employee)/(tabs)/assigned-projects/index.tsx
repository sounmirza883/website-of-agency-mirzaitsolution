import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAssignedProjects } from '@/api/employee-hooks';

export default function AssignedProjectsScreen() {
  const { data: projects, isLoading } = useAssignedProjects();
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-surface dark:bg-surface-dark">
      <View className="px-6 pb-10 pt-6">
        {isLoading ? (
          <ActivityIndicator />
        ) : !projects?.length ? (
          <EmptyState message="No projects assigned yet." />
        ) : (
          <View className="gap-3">
            {projects.map((p) => (
              <Card key={p.id} onPress={() => router.push(`/assigned-projects/${p.id}`)}>
                <View className="mb-1 flex-row items-start justify-between">
                  <Text className="flex-1 pr-2 text-sm font-semibold text-text dark:text-text-dark">{p.name}</Text>
                  <StatusBadge status={p.status} />
                </View>
                <Text className="text-xs text-text-secondary dark:text-text-secondary-dark">Client: {p.client}</Text>
                <Text className="text-xs text-text-secondary dark:text-text-secondary-dark">
                  Deadline: {p.deadline}
                </Text>
              </Card>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
