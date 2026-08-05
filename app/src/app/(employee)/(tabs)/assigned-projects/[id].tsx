import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import { StatusBadge } from '@/components/ui/status-badge';
import { MessageThread } from '@/components/chat/message-thread';
import { useAssignedProjects, useEmployeeMessages, useSendEmployeeMessage } from '@/api/employee-hooks';

export default function AssignedProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const projectId = Number(id);

  const { data: projects, isLoading: projectsLoading } = useAssignedProjects();
  const project = projects?.find((p) => p.id === projectId);
  const { data: messages, isLoading: messagesLoading } = useEmployeeMessages(projectId);
  const sendMessage = useSendEmployeeMessage();

  if (projectsLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface dark:bg-surface-dark">
        <ActivityIndicator />
      </View>
    );
  }

  if (!project) {
    return (
      <View className="flex-1 items-center justify-center bg-surface px-6 dark:bg-surface-dark">
        <Text className="text-center text-sm text-text-secondary dark:text-text-secondary-dark">
          Project not found.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface dark:bg-surface-dark">
      <View className="border-b border-surface-selected px-6 py-4 dark:border-surface-selected-dark">
        <View className="mb-1 flex-row items-center justify-between">
          <Text className="flex-1 pr-2 text-lg font-bold text-text dark:text-text-dark">{project.name}</Text>
          <StatusBadge status={project.status} />
        </View>
        <Text className="text-xs text-text-secondary dark:text-text-secondary-dark">Client: {project.client}</Text>
        <Text className="text-xs text-text-secondary dark:text-text-secondary-dark">
          Deadline: {project.deadline}
        </Text>
        <Text className="text-xs text-text-secondary dark:text-text-secondary-dark">
          Progress: {project.progress}%
        </Text>
      </View>
      <Text className="mb-2 px-6 text-sm font-semibold text-text dark:text-text-dark">Chat</Text>
      <MessageThread
        messages={messages}
        isLoading={messagesLoading}
        currentRole="employee"
        sending={sendMessage.isPending}
        onSend={async (text) => {
          await sendMessage.mutateAsync({ projectId, text });
        }}
      />
    </View>
  );
}
