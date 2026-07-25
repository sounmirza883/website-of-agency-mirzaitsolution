import { useMemo } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MessageThread } from '@/components/chat/message-thread';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { useClientMessages, useClientMilestones, useClientProjects, useSendClientMessage } from '@/api/client-role-hooks';

export default function ClientProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const projectId = Number(id);

  const projects = useClientProjects();
  const milestones = useClientMilestones();
  const messages = useClientMessages(projectId);
  const sendMessage = useSendClientMessage();

  const project = useMemo(() => projects.data?.find((p) => p.id === projectId), [projects.data, projectId]);
  const projectMilestones = useMemo(
    () => (project ? milestones.data?.filter((m) => m.project === project.name) ?? [] : []),
    [milestones.data, project]
  );

  if (projects.isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface dark:bg-surface-dark">
        <ActivityIndicator />
      </View>
    );
  }

  if (!project) {
    return (
      <View className="flex-1 bg-surface dark:bg-surface-dark">
        <EmptyState message="Project not found" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface dark:bg-surface-dark"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <ScrollView className="flex-1" contentContainerClassName="p-4 gap-4">
        <View>
          <Text className="text-xl font-bold text-text dark:text-text-dark">{project.name}</Text>
          <Text className="mt-1 text-xs text-text-secondary dark:text-text-secondary-dark">Deadline: {project.deadline}</Text>
          <Text className="mt-1 text-xs text-text-secondary dark:text-text-secondary-dark">Progress: {project.progress}%</Text>
          <View className="mt-2">
            <StatusBadge status={project.status} />
          </View>
        </View>

        <View>
          <Text className="mb-2 text-sm font-semibold text-text dark:text-text-dark">Milestones</Text>
          {milestones.isLoading ? (
            <ActivityIndicator />
          ) : projectMilestones.length === 0 ? (
            <EmptyState message="No milestones yet" />
          ) : (
            <View className="gap-2">
              {projectMilestones.map((m) => (
                <View
                  key={m.id}
                  className="flex-row items-center justify-between rounded-lg border border-surface-selected p-3 dark:border-surface-selected-dark"
                >
                  <View className="flex-1 pr-2">
                    <Text className="text-sm text-text dark:text-text-dark">{m.task}</Text>
                    <Text className="mt-0.5 text-xs text-text-secondary dark:text-text-secondary-dark">{m.date}</Text>
                  </View>
                  <StatusBadge status={m.status} />
                </View>
              ))}
            </View>
          )}
        </View>

        <Text className="text-sm font-semibold text-text dark:text-text-dark">Chat</Text>
      </ScrollView>

      <View className="h-96 border-t border-surface-selected dark:border-surface-selected-dark">
        <MessageThread
          messages={messages.data}
          isLoading={messages.isLoading}
          currentRole="client"
          sending={sendMessage.isPending}
          onSend={async (text) => {
            await sendMessage.mutateAsync({ projectId: project.id, text });
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
