import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { useClientInvoices, useSubmitInvoicePayment } from '@/api/client-role-hooks';

export default function ClientInvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [error, setError] = useState('');

  const invoices = useClientInvoices();
  const submitPayment = useSubmitInvoicePayment();

  const invoice = useMemo(() => invoices.data?.find((i) => i.id === id), [invoices.data, id]);

  async function handlePickImage() {
    setError('');
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Photo library permission is required to attach a receipt.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    const formData = new FormData();
    formData.append('file', {
      uri: asset.uri,
      name: asset.fileName ?? 'proof.jpg',
      type: asset.mimeType ?? 'image/jpeg',
    } as any);
    submitPayment.mutate(
      { id: id!, formData },
      { onError: (err) => setError((err as Error).message) }
    );
  }

  async function handlePickDocument() {
    setError('');
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    const formData = new FormData();
    formData.append('file', {
      uri: asset.uri,
      name: asset.name ?? 'proof.pdf',
      type: asset.mimeType ?? 'application/pdf',
    } as any);
    submitPayment.mutate(
      { id: id!, formData },
      { onError: (err) => setError((err as Error).message) }
    );
  }

  if (invoices.isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface dark:bg-surface-dark">
        <ActivityIndicator />
      </View>
    );
  }

  if (!invoice) {
    return (
      <View className="flex-1 bg-surface dark:bg-surface-dark">
        <EmptyState message="Invoice not found" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-surface dark:bg-surface-dark" contentContainerClassName="p-4 gap-4">
      <View>
        <Text className="text-xl font-bold text-text dark:text-text-dark">{invoice.project}</Text>
        <Text className="mt-1 text-2xl font-bold text-text dark:text-text-dark">{invoice.amount}</Text>
        <Text className="mt-1 text-xs text-text-secondary dark:text-text-secondary-dark">Due: {invoice.due}</Text>
        <View className="mt-2">
          <StatusBadge status={invoice.status} />
        </View>
      </View>

      {invoice.status === 'Unpaid' ? (
        <View className="gap-3">
          <Text className="text-sm font-semibold text-text dark:text-text-dark">Attach Proof of Payment</Text>
          {error ? <Text className="text-sm text-red-600">{error}</Text> : null}
          <View className="flex-row gap-3">
            <Pressable
              disabled={submitPayment.isPending}
              onPress={handlePickImage}
              className="flex-1 items-center rounded-lg bg-brand py-3 disabled:opacity-50"
            >
              <Text className="text-sm font-semibold text-[#f5ead8]">Upload Photo</Text>
            </Pressable>
            <Pressable
              disabled={submitPayment.isPending}
              onPress={handlePickDocument}
              className="flex-1 items-center rounded-lg border border-surface-selected py-3 disabled:opacity-50 dark:border-surface-selected-dark"
            >
              <Text className="text-sm font-semibold text-text dark:text-text-dark">Upload PDF</Text>
            </Pressable>
          </View>
          {submitPayment.isPending ? <ActivityIndicator /> : null}
        </View>
      ) : null}

      {invoice.status === 'PendingVerification' ? (
        <View className="gap-2">
          <Text className="text-sm text-text-secondary dark:text-text-secondary-dark">
            Your payment proof was submitted and is awaiting verification.
          </Text>
          {invoice.proofUrl ? (
            <Pressable
              onPress={() =>
                Linking.openURL(invoice.proofUrl!).catch(() => Alert.alert('Unable to open the submitted proof.'))
              }
            >
              <Text className="text-sm font-medium text-blue-600">View submitted proof</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {invoice.status === 'Paid' ? (
        <Text className="text-sm text-text-secondary dark:text-text-secondary-dark">This invoice has been paid.</Text>
      ) : null}
    </ScrollView>
  );
}
