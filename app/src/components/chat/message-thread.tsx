import { useState } from 'react';
import { ActivityIndicator, FlatList, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';

export interface ThreadMessage {
  id: number;
  senderRole: string;
  text: string;
  time: string;
}

/**
 * Shared project-chat UI reused by admin/employee/client — each role wires its own
 * fetch/send hook into these props, this component only knows how to render + submit.
 */
export function MessageThread({
  messages,
  isLoading,
  currentRole,
  onSend,
  sending,
}: {
  messages: ThreadMessage[] | undefined;
  isLoading: boolean;
  currentRole: 'admin' | 'employee' | 'client';
  onSend: (text: string) => Promise<void> | void;
  sending: boolean;
}) {
  const [text, setText] = useState('');

  async function handleSend() {
    if (!text.trim()) return;
    const value = text;
    setText('');
    await onSend(value);
  }

  return (
    <View className="flex-1">
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={messages ?? []}
          keyExtractor={(m) => String(m.id)}
          contentContainerClassName="gap-2 p-4"
          ListEmptyComponent={
            <Text className="mt-8 text-center text-sm text-text-secondary dark:text-text-secondary-dark">No messages yet</Text>
          }
          renderItem={({ item }) => {
            const mine = item.senderRole === currentRole;
            return (
              <View className={mine ? 'items-end' : 'items-start'}>
                <View
                  className={
                    mine
                      ? 'max-w-[80%] rounded-2xl rounded-br-sm bg-black px-3 py-2'
                      : 'max-w-[80%] rounded-2xl rounded-bl-sm bg-surface-element px-3 py-2 dark:bg-surface-element-dark'
                  }
                >
                  <Text className={mine ? 'text-[10px] uppercase tracking-wide text-white/60' : 'text-[10px] uppercase tracking-wide text-text-secondary dark:text-text-secondary-dark'}>
                    {item.senderRole}
                  </Text>
                  <Text className={mine ? 'text-sm text-white' : 'text-sm text-text dark:text-text-dark'}>{item.text}</Text>
                  <Text className={mine ? 'mt-0.5 text-[10px] text-white/50' : 'mt-0.5 text-[10px] text-text-secondary dark:text-text-secondary-dark'}>
                    {item.time}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}
      <View className="flex-row items-center gap-2 border-t border-surface-selected p-3 dark:border-surface-selected-dark">
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Type a message…"
          className="flex-1 rounded-full border border-surface-selected px-4 py-2 text-sm text-text dark:border-surface-selected-dark dark:text-text-dark"
        />
        <Pressable onPress={handleSend} disabled={sending || !text.trim()} className="h-10 w-10 items-center justify-center rounded-full bg-black disabled:opacity-50">
          <Ionicons name="send" size={16} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}
