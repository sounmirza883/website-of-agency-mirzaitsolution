import { useMemo } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { StatusPicker } from '@/components/forms/status-picker';
import { MessageThread } from '@/components/chat/message-thread';
import { EmptyState } from '@/components/ui/empty-state';
import {
  useAdminEmployees,
  useAdminMessages,
  useAdminProjects,
  useAssignAdminProjectEmployee,
  useSendAdminMessage,
  useUpdateAdminProjectStatus,
} from '@/api/admin-hooks';

const STATUS_OPTIONS = ['Pending', 'In Progress', 'Completed'];
const UNASSIGNED = 'Unassigned';

export default function AdminProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const projectId = Number(id);

  const projects = useAdminProjects();
  const employees = useAdminEmployees();
  const messages = useAdminMessages(projectId);
  const updateStatus = useUpdateAdminProjectStatus();
  const assignEmployee = useAssignAdminProjectEmployee();
  const sendMessage = useSendAdminMessage();

  const project = useMemo(() => projects.data?.find((p) => p.id === projectId), [projects.data, projectId]);

  const employeeOptions = useMemo(() => [UNASSIGNED, ...(employees.data?.map((e) => e.name) ?? [])], [employees.data]);
  const assignedEmployeeName = useMemo(() => {
    if (!project?.employeeId) return UNASSIGNED;
    return employees.data?.find((e) => e.id === project.employeeId)?.name ?? UNASSIGNED;
  }, [project?.employeeId, employees.data]);

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
          <Text className="mt-0.5 text-sm text-text-secondary dark:text-text-secondary-dark">{project.client}</Text>
          <Text className="mt-1 text-xs text-text-secondary dark:text-text-secondary-dark">Deadline: {project.deadline}</Text>
          <Text className="mt-1 text-xs text-text-secondary dark:text-text-secondary-dark">Progress: {project.progress}%</Text>
        </View>

        <View>
          <Text className="mb-2 text-sm font-semibold text-text dark:text-text-dark">Status</Text>
          <StatusPicker
            value={project.status}
            options={STATUS_OPTIONS}
            disabled={updateStatus.isPending}
            onChange={(status) => updateStatus.mutate({ id: project.id, status })}
          />
        </View>

        <View>
          <Text className="mb-2 text-sm font-semibold text-text dark:text-text-dark">Assigned Employee</Text>
          <StatusPicker
            value={assignedEmployeeName}
            options={employeeOptions}
            disabled={assignEmployee.isPending || employees.isLoading}
            onChange={(name) => {
              const employeeId = name === UNASSIGNED ? null : employees.data?.find((e) => e.name === name)?.id ?? null;
              assignEmployee.mutate({ id: project.id, employeeId });
            }}
          />
        </View>

        <View>
          <Text className="mb-2 text-sm font-semibold text-text dark:text-text-dark">Chat</Text>
        </View>
      </ScrollView>

      <View className="h-96 border-t border-surface-selected dark:border-surface-selected-dark">
        <MessageThread
          messages={messages.data}
          isLoading={messages.isLoading}
          currentRole="admin"
          sending={sendMessage.isPending}
          onSend={async (text) => {
            await sendMessage.mutateAsync({ projectId: project.id, text });
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
