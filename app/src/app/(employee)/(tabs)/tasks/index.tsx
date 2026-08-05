import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { StatusPicker } from '@/components/forms/status-picker';
import { Field } from '@/components/forms/field';
import { DateField } from '@/components/forms/date-field';
import { useCreateEmployeeTask, useEmployeeTasks, useUpdateEmployeeTaskStatus } from '@/api/employee-hooks';

const STATUS_OPTIONS = ['Pending', 'In Progress', 'Done'];

// Must match the web portal's options exactly — both write to the same column.
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];

export default function TasksScreen() {
  const { data: tasks, isLoading } = useEmployeeTasks();
  const updateStatus = useUpdateEmployeeTaskStatus();
  const createTask = useCreateEmployeeTask();

  const [showForm, setShowForm] = useState(false);
  const [project, setProject] = useState('');
  const [task, setTask] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [due, setDue] = useState('');
  const [error, setError] = useState('');

  async function handleCreate() {
    setError('');
    if (!project.trim() || !task.trim() || !due.trim()) {
      setError('Project, task, and due date are required');
      return;
    }
    try {
      await createTask.mutateAsync({ project, task, priority, due });
      setProject('');
      setTask('');
      setPriority('Medium');
      setDue('');
      setShowForm(false);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <ScrollView className="flex-1 bg-surface dark:bg-surface-dark">
      <View className="px-6 pb-10 pt-6">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-xl font-bold text-text dark:text-text-dark">Tasks</Text>
          <Pressable onPress={() => setShowForm((s) => !s)} className="rounded-lg bg-brand px-3 py-1.5">
            <Text className="text-sm font-medium text-[#f5ead8]">{showForm ? 'Cancel' : '+ New Task'}</Text>
          </Pressable>
        </View>

        {showForm && (
          <View className="mb-6 gap-3 rounded-xl border border-surface-selected p-4 dark:border-surface-selected-dark">
            <Field label="Project" value={project} onChangeText={setProject} placeholder="Project name" />
            <Field label="Task" value={task} onChangeText={setTask} placeholder="What needs doing" />
            <StatusPicker label="Priority" value={priority} options={PRIORITY_OPTIONS} onChange={setPriority} />
            <DateField label="Due Date" value={due} onChange={setDue} />
            {!!error && <Text className="text-xs text-red-600">{error}</Text>}
            <Pressable
              onPress={handleCreate}
              disabled={createTask.isPending}
              className="items-center rounded-lg bg-brand py-2.5 disabled:opacity-50"
            >
              <Text className="text-sm font-semibold text-[#f5ead8]">
                {createTask.isPending ? 'Creating…' : 'Create Task'}
              </Text>
            </Pressable>
          </View>
        )}

        {isLoading ? (
          <ActivityIndicator />
        ) : !tasks?.length ? (
          <EmptyState message="No tasks assigned yet." />
        ) : (
          <View className="gap-3">
            {tasks.map((t) => (
              <Card key={t.id}>
                <View className="mb-2 flex-row items-start justify-between">
                  <View className="flex-1 pr-2">
                    <Text className="text-sm font-semibold text-text dark:text-text-dark">{t.task}</Text>
                    <Text className="text-xs text-text-secondary dark:text-text-secondary-dark">{t.project}</Text>
                  </View>
                  <StatusBadge status={t.status} />
                </View>
                <Text className="mb-3 text-xs text-text-secondary dark:text-text-secondary-dark">
                  Priority: {t.priority} · Due: {t.due}
                </Text>
                <StatusPicker
                  value={t.status}
                  options={STATUS_OPTIONS}
                  onChange={(status) => updateStatus.mutate({ id: t.id, status })}
                  disabled={updateStatus.isPending}
                />
              </Card>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
