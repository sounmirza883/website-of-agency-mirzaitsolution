import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useAuth } from '@/context/auth-context';
import { LogoutButton } from '@/components/ui/logout-button';
import { StatTile } from '@/components/ui/stat-tile';
import { useAssignedProjects, useAttendance, useCheckIn, useCheckOut, useEmployeeTasks } from '@/api/employee-hooks';

export default function EmployeeHomeScreen() {
  const { user } = useAuth();
  const { data: attendance, isLoading: attendanceLoading } = useAttendance();
  const { data: projects, isLoading: projectsLoading } = useAssignedProjects();
  const { data: tasks, isLoading: tasksLoading } = useEmployeeTasks();
  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();
  const [error, setError] = useState('');

  // Matches the date format the backend stores (see frontend/employee/app/attendance/page.tsx),
  // so `todayRow` lookup lines up with server-formatted attendance rows.
  const today = useMemo(
    () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    []
  );
  const todayRow = attendance?.find((a) => a.date === today);
  const canCheckIn = !todayRow;
  const canCheckOut = !!todayRow && !todayRow.checkOut;

  const openTasksCount = tasks?.filter((t) => t.status !== 'Done').length ?? 0;

  async function handleCheckIn() {
    setError('');
    try {
      await checkInMutation.mutateAsync();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleCheckOut() {
    setError('');
    try {
      await checkOutMutation.mutateAsync();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <ScrollView className="flex-1 bg-surface dark:bg-surface-dark">
      <View className="px-6 pb-10 pt-6">
        <View className="mb-6 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-text dark:text-text-dark">Welcome, {user?.name}</Text>
            <Text className="text-sm text-text-secondary dark:text-text-secondary-dark">Employee</Text>
          </View>
          <LogoutButton />
        </View>

        <View className="mb-6 rounded-xl border border-surface-selected bg-surface-element p-4 dark:border-surface-selected-dark dark:bg-surface-element-dark">
          <Text className="mb-1 text-base font-semibold text-text dark:text-text-dark">Attendance</Text>
          {attendanceLoading ? (
            <ActivityIndicator />
          ) : (
            <>
              <Text className="mb-3 text-sm text-text-secondary dark:text-text-secondary-dark">
                {todayRow
                  ? `Checked in at ${todayRow.checkIn}${todayRow.checkOut ? ` · Checked out at ${todayRow.checkOut}` : ''}`
                  : "You haven't checked in today"}
              </Text>
              <View className="flex-row gap-3">
                <Pressable
                  onPress={handleCheckIn}
                  disabled={!canCheckIn || checkInMutation.isPending}
                  className="flex-1 items-center rounded-lg bg-green-600 py-3 disabled:opacity-40"
                >
                  <Text className="text-sm font-semibold text-[#f5ead8]">
                    {checkInMutation.isPending ? 'Checking In…' : 'Check In'}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleCheckOut}
                  disabled={!canCheckOut || checkOutMutation.isPending}
                  className="flex-1 items-center rounded-lg bg-brand py-3 disabled:opacity-40"
                >
                  <Text className="text-sm font-semibold text-[#f5ead8]">
                    {checkOutMutation.isPending ? 'Checking Out…' : 'Check Out'}
                  </Text>
                </Pressable>
              </View>
              {!!error && <Text className="mt-2 text-xs text-red-600">{error}</Text>}
            </>
          )}
        </View>

        <View className="flex-row gap-3">
          <StatTile label="Assigned Projects" value={projectsLoading ? '…' : projects?.length ?? 0} />
          <StatTile label="Open Tasks" value={tasksLoading ? '…' : openTasksCount} />
        </View>
      </View>
    </ScrollView>
  );
}
