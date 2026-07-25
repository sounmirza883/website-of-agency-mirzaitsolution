import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/auth-context';
import {
  checkIn,
  checkOut,
  createEmployeeTask,
  createLeaveRequest,
  fetchAssignedProjects,
  fetchAttendance,
  fetchEmployeeMessages,
  fetchEmployeeNotifications,
  fetchEmployeeTasks,
  fetchLeaveRequests,
  sendEmployeeMessage,
  updateEmployeeTaskStatus,
  type EmployeeTask,
} from './employee';

export function useAssignedProjects() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['assignedProjects'],
    queryFn: () => fetchAssignedProjects(token!),
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  });
}

export function useEmployeeTasks() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['employeeTasks'],
    queryFn: () => fetchEmployeeTasks(token!),
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateEmployeeTask() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof createEmployeeTask>[1]) => createEmployeeTask(token!, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employeeTasks'] }),
  });
}

export function useUpdateEmployeeTaskStatus() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: number; status: string }) => updateEmployeeTaskStatus(token!, vars.id, vars.status),
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ['employeeTasks'] });
      const prev = qc.getQueryData<EmployeeTask[]>(['employeeTasks']);
      qc.setQueryData<EmployeeTask[]>(['employeeTasks'], (old) =>
        old?.map((t) => (t.id === vars.id ? { ...t, status: vars.status } : t))
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['employeeTasks'], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['employeeTasks'] }),
  });
}

export function useAttendance() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['attendance'],
    queryFn: () => fetchAttendance(token!),
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCheckIn() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => checkIn(token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attendance'] }),
  });
}

export function useCheckOut() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => checkOut(token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attendance'] }),
  });
}

export function useLeaveRequests() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['leaveRequests'],
    queryFn: () => fetchLeaveRequests(token!),
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateLeaveRequest() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof createLeaveRequest>[1]) => createLeaveRequest(token!, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leaveRequests'] }),
  });
}

export function useEmployeeMessages(projectId: number | undefined) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['employeeMessages', projectId],
    queryFn: () => fetchEmployeeMessages(token!, projectId!),
    enabled: !!token && !!projectId,
    refetchInterval: 5000,
  });
}

export function useSendEmployeeMessage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { projectId: number; text: string }) => sendEmployeeMessage(token!, vars.projectId, vars.text),
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: ['employeeMessages', vars.projectId] }),
  });
}

export function useEmployeeNotifications() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['employeeNotifications'],
    queryFn: () => fetchEmployeeNotifications(token!),
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  });
}
