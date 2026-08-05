import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusPicker } from '@/components/forms/status-picker';
import { Field } from '@/components/forms/field';
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

      <View className="mb-3">
        <Field label="Title" value={title} onChangeText={setTitle} placeholder="Short headline" />
      </View>

      <View className="mb-3">
        <Field label="Message" value={msg} onChangeText={setMsg} placeholder="What you want them to know" multiline numberOfLines={3} />
      </View>

      <StatusPicker label="Audience" value={audience} options={[...AUDIENCE_OPTIONS]} onChange={(v) => setAudience(v as Audience)} />

      {audience === 'Specific Client' ? (
        <View className="mt-3">
          {clients.isLoading ? (
            <ActivityIndicator />
          ) : clientOptions.length === 0 ? (
            <Text className="text-sm text-text-secondary dark:text-text-secondary-dark">No clients available</Text>
          ) : (
            <StatusPicker
              label="Client"
              value={selectedClientName ?? ''}
              options={clientOptions.map((c) => c.name)}
              onChange={(name) => setClientId(clientOptions.find((c) => c.name === name)?.id ?? null)}
            />
          )}
        </View>
      ) : null}

      <View className="mt-4 flex-row gap-3">
        <Pressable disabled={!canSubmit} onPress={handleSubmit} className="rounded-lg bg-brand px-3 py-1.5 disabled:opacity-50">
          <Text className="text-xs font-medium text-[#f5ead8]">Send</Text>
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
            <Text className="text-xs font-medium text-[#f5ead8]">+ New</Text>
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
