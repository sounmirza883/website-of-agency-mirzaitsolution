import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { StatTile } from '@/components/ui/stat-tile';
import { Field } from '@/components/forms/field';
import { ProgressBar } from '@/components/ui/progress-bar';
import { useEmployeeTasks, useMySchedule, useRunningEntry, useTimeEntries, useStartTimer, useStopTimer, useSetTaskProgress, useSubmitTaskReport, useUpdateEmployeeTaskStatus, useSubmitDailyReport } from '@/api/employee-hooks';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function humanise(ms: number) {
  const mins = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(mins / 60);
  return h > 0 ? `${h}h ${mins % 60}m` : `${mins}m`;
}

/** Ticks locally so the running total moves without polling the API each second. */
function Elapsed({ since }: { since: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return <Text className="text-xs text-text-secondary dark:text-text-secondary-dark">{humanise(now - new Date(since).getTime())} elapsed</Text>;
}

export default function MyWorkScreen() {
  const { data: tasks, isLoading } = useEmployeeTasks();
  const { data: schedule } = useMySchedule();
  const { data: running } = useRunningEntry();
  const { data: entries } = useTimeEntries();

  const startTimer = useStartTimer();
  const stopTimer = useStopTimer();
  const setProgress = useSetTaskProgress();
  const submitReport = useSubmitTaskReport();
  const setStatus = useUpdateEmployeeTaskStatus();
  const submitDaily = useSubmitDailyReport();

  const [error, setError] = useState('');
  const [reportFor, setReportFor] = useState<number | null>(null);
  const [summary, setSummary] = useState('');
  const [daily, setDaily] = useState('');
  const [dailySaved, setDailySaved] = useState(false);

  const openTasks = useMemo(() => (tasks ?? []).filter((t) => t.status !== 'Done'), [tasks]);

  const todayMs = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return (entries ?? []).reduce((sum, e) => {
      if (!e.endedAt) return sum;
      const s = new Date(e.startedAt);
      return s >= start ? sum + (new Date(e.endedAt).getTime() - s.getTime()) : sum;
    }, 0);
  }, [entries]);

  async function handleStart(taskId: number) {
    setError('');
    try {
      await startTimer.mutateAsync(taskId);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleComplete() {
    if (!reportFor || !summary.trim()) return;
    setError('');
    try {
      await submitReport.mutateAsync({ taskId: reportFor, payload: { summary } });
      // The report is the precondition for closing the task, so do both here.
      await setStatus.mutateAsync({ id: reportFor, status: 'Done' });
      setReportFor(null);
      setSummary('');
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <ScrollView className="flex-1 bg-surface dark:bg-surface-dark">
      <View className="px-6 pb-10 pt-6">
        <Text className="mb-4 text-xl font-bold text-text dark:text-text-dark">My Work</Text>

        {!!error && <Text className="mb-3 text-xs text-red-600">{error}</Text>}

        <View className="mb-4 flex-row gap-3">
          <StatTile label="Tracked today" value={humanise(todayMs)} />
          <StatTile label="Open tasks" value={openTasks.length} />
        </View>

        {schedule && (
          <Card className="mb-4">
            <Text className="text-sm font-semibold text-text dark:text-text-dark">
              {String(schedule.startTime).slice(0, 5)} – {String(schedule.endTime).slice(0, 5)}
            </Text>
            <Text className="mt-0.5 text-xs text-text-secondary dark:text-text-secondary-dark">
              {(schedule.workDays ?? []).map((d: number) => DAY_NAMES[d]).join(', ')}
            </Text>
          </Card>
        )}

        {running && (
          <Card className="mb-4">
            <Text className="text-sm font-semibold text-text dark:text-text-dark">
              Working on: {tasks?.find((t) => t.id === running.taskId)?.task ?? `task #${running.taskId}`}
            </Text>
            <Elapsed since={running.startedAt} />
            <Pressable
              onPress={() => stopTimer.mutate(running.id)}
              disabled={stopTimer.isPending}
              className="mt-3 items-center rounded-lg bg-brand py-2.5 disabled:opacity-50"
            >
              <Text className="text-sm font-semibold text-[#f5ead8]">{stopTimer.isPending ? 'Stopping…' : 'Stop Timer'}</Text>
            </Pressable>
          </Card>
        )}

        <Text className="mb-2 text-sm font-semibold text-text dark:text-text-dark">Assigned Tasks</Text>
        {isLoading ? (
          <ActivityIndicator />
        ) : openTasks.length === 0 ? (
          <EmptyState message="Nothing assigned right now." />
        ) : (
          <View className="mb-6 gap-3">
            {openTasks.map((t) => (
              <Card key={t.id}>
                <Text className="text-sm font-semibold text-text dark:text-text-dark">{t.task}</Text>
                <Text className="mb-2 mt-0.5 text-xs text-text-secondary dark:text-text-secondary-dark">
                  {t.project || 'No project'}{t.due ? ` · due ${t.due}` : ''}
                </Text>

                <ProgressBar value={(t as any).progress ?? 0} />

                <View className="mt-3 flex-row gap-2">
                  {running?.taskId === t.id ? (
                    <Pressable onPress={() => stopTimer.mutate(running.id)} className="flex-1 items-center rounded-lg border border-surface-selected py-2 dark:border-surface-selected-dark">
                      <Text className="text-xs font-medium text-text dark:text-text-dark">Stop</Text>
                    </Pressable>
                  ) : (
                    <Pressable onPress={() => handleStart(t.id)} disabled={startTimer.isPending} className="flex-1 items-center rounded-lg border border-surface-selected py-2 disabled:opacity-50 dark:border-surface-selected-dark">
                      <Text className="text-xs font-medium text-text dark:text-text-dark">Start</Text>
                    </Pressable>
                  )}
                  <Pressable onPress={() => { setProgress.mutate({ id: t.id, progress: Math.min(100, ((t as any).progress ?? 0) + 25) }); }} className="flex-1 items-center rounded-lg border border-surface-selected py-2 dark:border-surface-selected-dark">
                    <Text className="text-xs font-medium text-text dark:text-text-dark">+25%</Text>
                  </Pressable>
                  <Pressable onPress={() => { setReportFor(t.id); setSummary(''); }} className="flex-1 items-center rounded-lg bg-brand py-2">
                    <Text className="text-xs font-semibold text-[#f5ead8]">Complete</Text>
                  </Pressable>
                </View>

                {reportFor === t.id && (
                  <View className="mt-3 gap-2">
                    <Field label="What did you do?" value={summary} onChangeText={setSummary} placeholder="Required to close the task" multiline numberOfLines={3} />
                    <View className="flex-row gap-2">
                      <Pressable onPress={() => setReportFor(null)} className="flex-1 items-center rounded-lg border border-surface-selected py-2 dark:border-surface-selected-dark">
                        <Text className="text-xs font-medium text-text dark:text-text-dark">Cancel</Text>
                      </Pressable>
                      <Pressable onPress={handleComplete} disabled={submitReport.isPending || !summary.trim()} className="flex-1 items-center rounded-lg bg-brand py-2 disabled:opacity-50">
                        <Text className="text-xs font-semibold text-[#f5ead8]">{submitReport.isPending ? 'Saving…' : 'Submit & Complete'}</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </Card>
            ))}
          </View>
        )}

        <Text className="mb-2 text-sm font-semibold text-text dark:text-text-dark">Today&apos;s Report</Text>
        <Card>
          <Field label="What did you work on today?" value={daily} onChangeText={(v) => { setDaily(v); setDailySaved(false); }} placeholder="A short summary" multiline numberOfLines={3} />
          <Pressable
            onPress={async () => {
              setError('');
              try { await submitDaily.mutateAsync(daily); setDailySaved(true); } catch (err) { setError((err as Error).message); }
            }}
            disabled={submitDaily.isPending || !daily.trim()}
            className="mt-3 items-center rounded-lg bg-brand py-2.5 disabled:opacity-50"
          >
            <Text className="text-sm font-semibold text-[#f5ead8]">{submitDaily.isPending ? 'Saving…' : dailySaved ? 'Saved' : 'Submit'}</Text>
          </Pressable>
        </Card>
      </View>
    </ScrollView>
  );
}
