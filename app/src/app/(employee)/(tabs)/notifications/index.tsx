import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { useEmployeeNotifications } from '@/api/employee-hooks';

export default function NotificationsScreen() {
  const { data: notifications, isLoading } = useEmployeeNotifications();

  return (
    <ScrollView className="flex-1 bg-surface dark:bg-surface-dark">
      <View className="px-6 pb-10 pt-6">
        {isLoading ? (
          <ActivityIndicator />
        ) : !notifications?.length ? (
          <EmptyState message="No notifications." />
        ) : (
          <View className="gap-3">
            {notifications.map((n) => (
              <Card key={n.id}>
                <Text className="mb-1 text-sm font-semibold text-text dark:text-text-dark">{n.title}</Text>
                <Text className="mb-1 text-xs text-text-secondary dark:text-text-secondary-dark">{n.msg}</Text>
                <Text className="text-[10px] text-text-secondary dark:text-text-secondary-dark">{n.date}</Text>
              </Card>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
