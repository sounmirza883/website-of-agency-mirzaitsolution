import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useAuth } from '@/context/auth-context';
import { LogoutButton } from '@/components/ui/logout-button';
import { StatTile } from '@/components/ui/stat-tile';
import { useClientInvoices, useClientProjects, useClientTickets } from '@/api/client-role-hooks';

export default function ClientHomeScreen() {
  const { user } = useAuth();
  const projects = useClientProjects();
  const invoices = useClientInvoices();
  const tickets = useClientTickets();

  const isLoading = projects.isLoading || invoices.isLoading || tickets.isLoading;

  const activeProjectsCount = projects.data?.filter((p) => p.status !== 'Completed' && p.status !== 'Done').length ?? 0;
  const pendingInvoicesCount =
    invoices.data?.filter((i) => i.status === 'Unpaid' || i.status === 'PendingVerification').length ?? 0;
  const openTicketsCount = tickets.data?.filter((t) => t.status === 'Open').length ?? 0;

  return (
    <ScrollView className="flex-1 bg-surface dark:bg-surface-dark">
      <View className="px-6 pt-6">
        <View className="mb-6 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-text dark:text-text-dark">Welcome, {user?.name}</Text>
            <Text className="text-sm text-text-secondary dark:text-text-secondary-dark">{user?.company ?? 'Client'}</Text>
          </View>
          <LogoutButton />
        </View>

        {isLoading ? (
          <View className="items-center justify-center py-8">
            <ActivityIndicator />
          </View>
        ) : (
          <View className="flex-row gap-3">
            <StatTile label="Active Projects" value={activeProjectsCount} />
            <StatTile label="Unpaid/Pending Invoices" value={pendingInvoicesCount} />
            <StatTile label="Open Tickets" value={openTicketsCount} />
          </View>
        )}
      </View>
    </ScrollView>
  );
}
