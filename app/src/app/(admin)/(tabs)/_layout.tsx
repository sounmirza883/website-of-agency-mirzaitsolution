import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AdminTabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="projects"
        options={{ title: 'Projects', headerShown: false, tabBarIcon: ({ color, size }) => <Ionicons name="briefcase" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="invoices/index"
        options={{ title: 'Invoices', tabBarIcon: ({ color, size }) => <Ionicons name="card" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="users/index"
        options={{ title: 'Users', tabBarIcon: ({ color, size }) => <Ionicons name="people" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="leave-requests/index"
        options={{ title: 'Leave', tabBarIcon: ({ color, size }) => <Ionicons name="calendar" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="notifications/index"
        options={{ title: 'Notifications', tabBarIcon: ({ color, size }) => <Ionicons name="notifications" color={color} size={size} /> }}
      />
    </Tabs>
  );
}
