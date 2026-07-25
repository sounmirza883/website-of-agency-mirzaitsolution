import { Stack } from 'expo-router';

export default function AssignedProjectsLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: 'Assigned Projects' }} />
      <Stack.Screen name="[id]" options={{ title: 'Project' }} />
    </Stack>
  );
}
