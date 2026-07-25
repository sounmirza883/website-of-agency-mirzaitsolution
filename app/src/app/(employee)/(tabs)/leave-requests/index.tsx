import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { useCreateLeaveRequest, useLeaveRequests } from '@/api/employee-hooks';

const inputClass =
  'rounded-lg border border-surface-selected px-3 py-2 text-sm text-text dark:border-surface-selected-dark dark:text-text-dark';

export default function LeaveRequestsScreen() {
  const { data: leaveRequests, isLoading } = useLeaveRequests();
  const createLeave = useCreateLeaveRequest();

  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState('');
  const [reason, setReason] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [error, setError] = useState('');

  async function handleCreate() {
    setError('');
    if (!type.trim() || !reason.trim() || !from.trim() || !to.trim()) {
      setError('All fields are required');
      return;
    }
    try {
      await createLeave.mutateAsync({ type, reason, from, to });
      setType('');
      setReason('');
      setFrom('');
      setTo('');
      setShowForm(false);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <ScrollView className="flex-1 bg-surface dark:bg-surface-dark">
      <View className="px-6 pb-10 pt-6">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-xl font-bold text-text dark:text-text-dark">Leave Requests</Text>
          <Pressable onPress={() => setShowForm((s) => !s)} className="rounded-lg bg-brand px-3 py-1.5">
            <Text className="text-sm font-medium text-white">{showForm ? 'Cancel' : '+ New Request'}</Text>
          </Pressable>
        </View>

        {showForm && (
          <View className="mb-6 gap-3 rounded-xl border border-surface-selected p-4 dark:border-surface-selected-dark">
            <TextInput
              value={type}
              onChangeText={setType}
              placeholder="Type (e.g. Sick, Vacation)"
              placeholderTextColor="#9ca3af"
              className={inputClass}
            />
            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder="Reason"
              placeholderTextColor="#9ca3af"
              className={inputClass}
            />
            <TextInput
              value={from}
              onChangeText={setFrom}
              placeholder="From date (e.g. Aug 1, 2026)"
              placeholderTextColor="#9ca3af"
              className={inputClass}
            />
            <TextInput
              value={to}
              onChangeText={setTo}
              placeholder="To date (e.g. Aug 3, 2026)"
              placeholderTextColor="#9ca3af"
              className={inputClass}
            />
            {!!error && <Text className="text-xs text-red-600">{error}</Text>}
            <Pressable
              onPress={handleCreate}
              disabled={createLeave.isPending}
              className="items-center rounded-lg bg-brand py-2.5 disabled:opacity-50"
            >
              <Text className="text-sm font-semibold text-white">
                {createLeave.isPending ? 'Submitting…' : 'Submit Request'}
              </Text>
            </Pressable>
          </View>
        )}

        {isLoading ? (
          <ActivityIndicator />
        ) : !leaveRequests?.length ? (
          <EmptyState message="No leave requests yet." />
        ) : (
          <View className="gap-3">
            {leaveRequests.map((lr) => (
              <Card key={lr.id}>
                <View className="mb-1 flex-row items-start justify-between">
                  <Text className="flex-1 pr-2 text-sm font-semibold text-text dark:text-text-dark">{lr.type}</Text>
                  <StatusBadge status={lr.status} />
                </View>
                <Text className="mb-1 text-xs text-text-secondary dark:text-text-secondary-dark">{lr.reason}</Text>
                <Text className="text-xs text-text-secondary dark:text-text-secondary-dark">
                  {lr.from} → {lr.to}
                </Text>
              </Card>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
