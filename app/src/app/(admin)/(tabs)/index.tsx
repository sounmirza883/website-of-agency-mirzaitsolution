import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useAuth } from '@/context/auth-context';
import { LogoutButton } from '@/components/ui/logout-button';
import { StatTile } from '@/components/ui/stat-tile';
import { useAdminInvoices, useAdminLeaveRequests, useAdminProjects } from '@/api/admin-hooks';

export default function AdminHomeScreen() {
  const { user } = useAuth();
  const projects = useAdminProjects();
  const invoices = useAdminInvoices();
  const leaveRequests = useAdminLeaveRequests();

  const loading = projects.isLoading || invoices.isLoading || leaveRequests.isLoading;

  const totalProjects = projects.data?.length ?? 0;
  const pendingInvoices = invoices.data?.filter((i) => i.status !== 'Paid').length ?? 0;
  const pendingLeaveRequests = leaveRequests.data?.filter((l) => l.status === 'Pending').length ?? 0;

  return (
    <ScrollView className="flex-1 bg-surface dark:bg-surface-dark">
      <View className="px-6 pt-6">
        <View className="mb-6 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-text dark:text-text-dark">Welcome, {user?.name}</Text>
            <Text className="text-sm text-text-secondary dark:text-text-secondary-dark">Admin</Text>
          </View>
          <LogoutButton />
        </View>

        {loading ? (
          <View className="items-center justify-center py-12">
            <ActivityIndicator />
          </View>
        ) : (
          <View className="flex-row gap-3">
            <StatTile label="Total Projects" value={totalProjects} />
            <StatTile label="Pending Invoices" value={pendingInvoices} />
            <StatTile label="Pending Leave Requests" value={pendingLeaveRequests} />
          </View>
        )}
      </View>
    </ScrollView>
  );
}
