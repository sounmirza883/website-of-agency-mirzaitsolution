import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ClientTabsLayout() {
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
        name="invoices"
        options={{ title: 'Invoices', headerShown: false, tabBarIcon: ({ color, size }) => <Ionicons name="card" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="tickets/index"
        options={{ title: 'Tickets', tabBarIcon: ({ color, size }) => <Ionicons name="help-buoy" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="notifications/index"
        options={{ title: 'Notifications', tabBarIcon: ({ color, size }) => <Ionicons name="notifications" color={color} size={size} /> }}
      />
    </Tabs>
  );
}
