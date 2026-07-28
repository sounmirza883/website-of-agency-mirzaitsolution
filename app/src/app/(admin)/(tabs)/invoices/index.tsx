import { ActivityIndicator, FlatList, Linking, Pressable, Text, View } from 'react-native';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAdminInvoices, useVerifyAdminInvoice } from '@/api/admin-hooks';
import type { AdminInvoice } from '@/api/admin';

function InvoiceRow({ invoice }: { invoice: AdminInvoice }) {
  const verify = useVerifyAdminInvoice();

  return (
    <Card>
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-2">
          <Text className="text-base font-semibold text-text dark:text-text-dark">{invoice.client}</Text>
          <Text className="mt-0.5 text-sm text-text-secondary dark:text-text-secondary-dark">{invoice.amount}</Text>
          <Text className="mt-1 text-xs text-text-secondary dark:text-text-secondary-dark">{invoice.date}</Text>
        </View>
        <StatusBadge status={invoice.status} />
      </View>

      <View className="mt-3 flex-row flex-wrap items-center gap-3">
        {invoice.proofUrl ? (
          <Pressable onPress={() => Linking.openURL(invoice.proofUrl!)}>
            <Text className="text-sm font-medium text-blue-600">View Proof</Text>
          </Pressable>
        ) : null}

        {invoice.status === 'PendingVerification' ? (
          <>
            <Pressable
              disabled={verify.isPending}
              onPress={() => verify.mutate({ id: invoice.id, approve: true })}
              className="rounded-lg bg-brand px-3 py-1.5 disabled:opacity-50"
            >
              <Text className="text-xs font-medium text-[#f5ead8]">Verify</Text>
            </Pressable>
            <Pressable
              disabled={verify.isPending}
              onPress={() => verify.mutate({ id: invoice.id, approve: false })}
              className="rounded-lg border border-surface-selected px-3 py-1.5 disabled:opacity-50 dark:border-surface-selected-dark"
            >
              <Text className="text-xs font-medium text-text dark:text-text-dark">Reject</Text>
            </Pressable>
          </>
        ) : null}
      </View>
    </Card>
  );
}

export default function AdminInvoicesScreen() {
  const { data, isLoading } = useAdminInvoices();

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
        keyExtractor={(i) => String(i.id)}
        contentContainerClassName="gap-3 p-4"
        ListEmptyComponent={<EmptyState message="No invoices yet" />}
        renderItem={({ item }) => <InvoiceRow invoice={item} />}
      />
    </View>
  );
}
