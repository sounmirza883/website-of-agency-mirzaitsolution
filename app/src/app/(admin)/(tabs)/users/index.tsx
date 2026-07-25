import { useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { StatusPicker } from '@/components/forms/status-picker';
import { useAdminClients, useAdminEmployees } from '@/api/admin-hooks';

const TABS = ['Employees', 'Clients'] as const;

export default function AdminUsersScreen() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Employees');
  const employees = useAdminEmployees();
  const clients = useAdminClients();

  const isLoading = tab === 'Employees' ? employees.isLoading : clients.isLoading;

  return (
    <View className="flex-1 bg-surface dark:bg-surface-dark">
      <View className="p-4 pb-0">
        <StatusPicker value={tab} options={[...TABS]} onChange={(v) => setTab(v as (typeof TABS)[number])} />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : tab === 'Employees' ? (
        <FlatList
          data={employees.data ?? []}
          keyExtractor={(e) => String(e.id)}
          contentContainerClassName="gap-3 p-4"
          ListEmptyComponent={<EmptyState message="No employees yet" />}
          renderItem={({ item }) => (
            <Card>
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-2">
                  <Text className="text-base font-semibold text-text dark:text-text-dark">{item.name}</Text>
                  <Text className="mt-0.5 text-sm text-text-secondary dark:text-text-secondary-dark">{item.email}</Text>
                  <Text className="mt-1 text-xs text-text-secondary dark:text-text-secondary-dark">
                    {[item.dept, item.position].filter(Boolean).join(' - ')}
                  </Text>
                </View>
                <StatusBadge status={item.status} />
              </View>
            </Card>
          )}
        />
      ) : (
        <FlatList
          data={clients.data ?? []}
          keyExtractor={(c) => String(c.id)}
          contentContainerClassName="gap-3 p-4"
          ListEmptyComponent={<EmptyState message="No clients yet" />}
          renderItem={({ item }) => (
            <Card>
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-2">
                  <Text className="text-base font-semibold text-text dark:text-text-dark">{item.name}</Text>
                  <Text className="mt-0.5 text-sm text-text-secondary dark:text-text-secondary-dark">{item.email}</Text>
                  {item.company ? (
                    <Text className="mt-1 text-xs text-text-secondary dark:text-text-secondary-dark">{item.company}</Text>
                  ) : null}
                </View>
                <StatusBadge status={item.status} />
              </View>
            </Card>
          )}
        />
      )}
    </View>
  );
}
