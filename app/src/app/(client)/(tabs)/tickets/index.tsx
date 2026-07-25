import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { StatusPicker } from '@/components/forms/status-picker';
import { useClientTickets, useCreateClientTicket, useUpdateClientTicketStatus } from '@/api/client-role-hooks';
import type { ClientTicket } from '@/api/client-role';

const TICKET_STATUS_OPTIONS = ['Open', 'Closed'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];

function TicketRow({ ticket }: { ticket: ClientTicket }) {
  const updateStatus = useUpdateClientTicketStatus();

  return (
    <Card>
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-2">
          <Text className="text-base font-semibold text-text dark:text-text-dark">{ticket.subject}</Text>
          <Text className="mt-0.5 text-xs text-text-secondary dark:text-text-secondary-dark">Priority: {ticket.priority}</Text>
          <Text className="mt-1 text-xs text-text-secondary dark:text-text-secondary-dark">Updated: {ticket.updated}</Text>
        </View>
        <StatusBadge status={ticket.status} />
      </View>
      <View className="mt-3">
        <StatusPicker
          value={ticket.status}
          options={TICKET_STATUS_OPTIONS}
          disabled={updateStatus.isPending}
          onChange={(status) => updateStatus.mutate({ id: ticket.id, status })}
        />
      </View>
    </Card>
  );
}

function NewTicketForm({ onDone }: { onDone: () => void }) {
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');
  const createTicket = useCreateClientTicket();

  async function handleSubmit() {
    if (!subject.trim()) return;
    await createTicket.mutateAsync({ subject: subject.trim(), priority, description: description.trim() });
    setSubject('');
    setDescription('');
    setPriority('Medium');
    onDone();
  }

  return (
    <Card className="mb-3">
      <Text className="mb-2 text-sm font-semibold text-text dark:text-text-dark">New Ticket</Text>
      <TextInput
        value={subject}
        onChangeText={setSubject}
        placeholder="Subject"
        className="mb-3 rounded-lg border border-surface-selected px-3 py-2 text-sm text-text dark:border-surface-selected-dark dark:text-text-dark"
      />
      <Text className="mb-2 text-xs font-medium text-text-secondary dark:text-text-secondary-dark">Priority</Text>
      <View className="mb-3">
        <StatusPicker value={priority} options={PRIORITY_OPTIONS} onChange={setPriority} disabled={createTicket.isPending} />
      </View>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Description"
        multiline
        numberOfLines={3}
        className="mb-3 rounded-lg border border-surface-selected px-3 py-2 text-sm text-text dark:border-surface-selected-dark dark:text-text-dark"
      />
      <View className="flex-row gap-3">
        <Pressable
          disabled={createTicket.isPending || !subject.trim()}
          onPress={handleSubmit}
          className="flex-1 items-center rounded-lg bg-brand py-2.5 disabled:opacity-50"
        >
          {createTicket.isPending ? <ActivityIndicator color="#fff" /> : <Text className="text-sm font-semibold text-white">Submit</Text>}
        </Pressable>
        <Pressable
          onPress={onDone}
          className="flex-1 items-center rounded-lg border border-surface-selected py-2.5 dark:border-surface-selected-dark"
        >
          <Text className="text-sm font-semibold text-text dark:text-text-dark">Cancel</Text>
        </Pressable>
      </View>
    </Card>
  );
}

export default function ClientTicketsScreen() {
  const { data, isLoading } = useClientTickets();
  const [showForm, setShowForm] = useState(false);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface dark:bg-surface-dark">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface dark:bg-surface-dark">
      <View className="flex-row items-center justify-between p-4 pb-0">
        <Text className="text-lg font-bold text-text dark:text-text-dark">Tickets</Text>
        {!showForm ? (
          <Pressable onPress={() => setShowForm(true)} className="rounded-lg bg-brand px-3 py-1.5">
            <Text className="text-xs font-medium text-white">+ New Ticket</Text>
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={data ?? []}
        keyExtractor={(t) => String(t.id)}
        contentContainerClassName="gap-3 p-4"
        ListHeaderComponent={showForm ? <NewTicketForm onDone={() => setShowForm(false)} /> : null}
        ListEmptyComponent={!showForm ? <EmptyState message="No tickets yet" /> : null}
        renderItem={({ item }) => <TicketRow ticket={item} />}
      />
    </View>
  );
}
