import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAdminLeaveRequests, useSetAdminLeaveRequestStatus } from '@/api/admin-hooks';
import type { AdminLeaveRequest } from '@/api/admin';

function LeaveRequestRow({ request }: { request: AdminLeaveRequest }) {
  const setStatus = useSetAdminLeaveRequestStatus();

  return (
    <Card>
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-2">
          <Text className="text-base font-semibold text-text dark:text-text-dark">{request.users?.name ?? 'Unknown employee'}</Text>
          <Text className="mt-0.5 text-sm text-text-secondary dark:text-text-secondary-dark">{request.type}</Text>
          <Text className="mt-1 text-xs text-text-secondary dark:text-text-secondary-dark">{request.reason}</Text>
          <Text className="mt-1 text-xs text-text-secondary dark:text-text-secondary-dark">
            {request.from} - {request.to}
          </Text>
        </View>
        <StatusBadge status={request.status} />
      </View>

      {request.status === 'Pending' ? (
        <View className="mt-3 flex-row gap-3">
          <Pressable
            disabled={setStatus.isPending}
            onPress={() => setStatus.mutate({ id: request.id, status: 'Approved' })}
            className="rounded-lg bg-brand px-3 py-1.5 disabled:opacity-50"
          >
            <Text className="text-xs font-medium text-white">Approve</Text>
          </Pressable>
          <Pressable
            disabled={setStatus.isPending}
            onPress={() => setStatus.mutate({ id: request.id, status: 'Rejected' })}
            className="rounded-lg border border-surface-selected px-3 py-1.5 disabled:opacity-50 dark:border-surface-selected-dark"
          >
            <Text className="text-xs font-medium text-text dark:text-text-dark">Reject</Text>
          </Pressable>
        </View>
      ) : null}
    </Card>
  );
}

export default function AdminLeaveRequestsScreen() {
  const { data, isLoading } = useAdminLeaveRequests();

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
        keyExtractor={(r) => String(r.id)}
        contentContainerClassName="gap-3 p-4"
        ListEmptyComponent={<EmptyState message="No leave requests yet" />}
        renderItem={({ item }) => <LeaveRequestRow request={item} />}
      />
    </View>
  );
}
