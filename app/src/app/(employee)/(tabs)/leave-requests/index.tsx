import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { Field } from '@/components/forms/field';
import { DateField } from '@/components/forms/date-field';
import { StatusPicker } from '@/components/forms/status-picker';
import { useCreateLeaveRequest, useLeaveRequests } from '@/api/employee-hooks';

// Must match the web portal's options exactly — both write to the same column.
const LEAVE_TYPES = ['Sick Leave', 'Personal Leave', 'Annual Leave'];

export default function LeaveRequestsScreen() {
  const { data: leaveRequests, isLoading } = useLeaveRequests();
  const createLeave = useCreateLeaveRequest();

  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState(LEAVE_TYPES[0]);
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
            <Text className="text-sm font-medium text-[#f5ead8]">{showForm ? 'Cancel' : '+ New Request'}</Text>
          </Pressable>
        </View>

        {showForm && (
          <View className="mb-6 gap-3 rounded-xl border border-surface-selected p-4 dark:border-surface-selected-dark">
            <StatusPicker label="Leave Type" value={type} options={LEAVE_TYPES} onChange={setType} />
            <Field label="Reason" value={reason} onChangeText={setReason} placeholder="Why you need the leave" />
            <DateField label="From Date" value={from} onChange={setFrom} />
            <DateField label="To Date" value={to} onChange={setTo} />
            {!!error && <Text className="text-xs text-red-600">{error}</Text>}
            <Pressable
              onPress={handleCreate}
              disabled={createLeave.isPending}
              className="items-center rounded-lg bg-brand py-2.5 disabled:opacity-50"
            >
              <Text className="text-sm font-semibold text-[#f5ead8]">
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
