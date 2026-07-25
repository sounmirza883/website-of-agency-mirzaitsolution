import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusPicker } from '@/components/forms/status-picker';
import { useAdminClients, useAdminNotifications, useCreateAdminNotification } from '@/api/admin-hooks';

const AUDIENCE_OPTIONS = ['Everyone', 'Employees', 'Specific Client'] as const;
type Audience = (typeof AUDIENCE_OPTIONS)[number];

function NewNotificationForm({ onDone }: { onDone: () => void }) {
  const [title, setTitle] = useState('');
  const [msg, setMsg] = useState('');
  const [audience, setAudience] = useState<Audience>('Everyone');
  const [clientId, setClientId] = useState<number | null>(null);

  const clients = useAdminClients();
  const create = useCreateAdminNotification();

  const clientOptions = clients.data ?? [];
  const selectedClientName = clientOptions.find((c) => c.id === clientId)?.name;

  function handleSubmit() {
    if (!title.trim() || !msg.trim()) return;
    if (audience === 'Specific Client' && !clientId) return;

    const targetRole = audience === 'Everyone' ? 'all' : audience === 'Employees' ? 'employee' : 'client';
    create.mutate(
      {
        title: title.trim(),
        msg: msg.trim(),
        targetRole,
        ...(audience === 'Specific Client' && clientId ? { targetUserId: clientId } : {}),
      },
      { onSuccess: onDone }
    );
  }

  const canSubmit = title.trim().length > 0 && msg.trim().length > 0 && (audience !== 'Specific Client' || !!clientId) && !create.isPending;

  return (
    <Card className="mb-3">
      <Text className="mb-3 text-base font-semibold text-text dark:text-text-dark">New Notification</Text>

      <Text className="mb-1 text-xs font-medium text-text-secondary dark:text-text-secondary-dark">Title</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
        className="mb-3 rounded-lg border border-surface-selected px-3 py-2 text-sm text-text dark:border-surface-selected-dark dark:text-text-dark"
      />

      <Text className="mb-1 text-xs font-medium text-text-secondary dark:text-text-secondary-dark">Message</Text>
      <TextInput
        value={msg}
        onChangeText={setMsg}
        placeholder="Message"
        multiline
        numberOfLines={3}
        className="mb-3 rounded-lg border border-surface-selected px-3 py-2 text-sm text-text dark:border-surface-selected-dark dark:text-text-dark"
      />

      <Text className="mb-1 text-xs font-medium text-text-secondary dark:text-text-secondary-dark">Audience</Text>
      <StatusPicker value={audience} options={[...AUDIENCE_OPTIONS]} onChange={(v) => setAudience(v as Audience)} />

      {audience === 'Specific Client' ? (
        <View className="mt-3">
          <Text className="mb-1 text-xs font-medium text-text-secondary dark:text-text-secondary-dark">Client</Text>
          {clients.isLoading ? (
            <ActivityIndicator />
          ) : clientOptions.length === 0 ? (
            <Text className="text-sm text-text-secondary dark:text-text-secondary-dark">No clients available</Text>
          ) : (
            <StatusPicker
              value={selectedClientName ?? ''}
              options={clientOptions.map((c) => c.name)}
              onChange={(name) => setClientId(clientOptions.find((c) => c.name === name)?.id ?? null)}
            />
          )}
        </View>
      ) : null}

      <View className="mt-4 flex-row gap-3">
        <Pressable disabled={!canSubmit} onPress={handleSubmit} className="rounded-lg bg-brand px-3 py-1.5 disabled:opacity-50">
          <Text className="text-xs font-medium text-white">Send</Text>
        </Pressable>
        <Pressable onPress={onDone} className="rounded-lg border border-surface-selected px-3 py-1.5 dark:border-surface-selected-dark">
          <Text className="text-xs font-medium text-text dark:text-text-dark">Cancel</Text>
        </Pressable>
      </View>
    </Card>
  );
}

export default function AdminNotificationsScreen() {
  const { data, isLoading } = useAdminNotifications();
  const [showForm, setShowForm] = useState(false);

  return (
    <View className="flex-1 bg-surface dark:bg-surface-dark">
      <View className="flex-row items-center justify-between px-4 pt-4">
        <Text className="text-base font-semibold text-text dark:text-text-dark">Notifications</Text>
        {!showForm ? (
          <Pressable onPress={() => setShowForm(true)} className="rounded-lg bg-brand px-3 py-1.5">
            <Text className="text-xs font-medium text-white">+ New</Text>
          </Pressable>
        ) : null}
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(n) => String(n.id)}
          contentContainerClassName="gap-3 p-4"
          ListHeaderComponent={showForm ? <NewNotificationForm onDone={() => setShowForm(false)} /> : null}
          ListEmptyComponent={<EmptyState message="No notifications yet" />}
          renderItem={({ item }) => (
            <Card>
              <Text className="text-base font-semibold text-text dark:text-text-dark">{item.title}</Text>
              <Text className="mt-0.5 text-sm text-text-secondary dark:text-text-secondary-dark">{item.msg}</Text>
              <Text className="mt-1 text-xs text-text-secondary dark:text-text-secondary-dark">{item.date}</Text>
            </Card>
          )}
        />
      )}
    </View>
  );
}
