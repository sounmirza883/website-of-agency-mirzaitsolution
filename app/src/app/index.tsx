import { Redirect } from 'expo-router';
import { useAuth } from '@/context/auth-context';

export default function RootIndex() {
  const { user } = useAuth();

  if (!user) return <Redirect href="/(auth)/login" />;
  if (user.role === 'admin') return <Redirect href="/(admin)/(tabs)" />;
  if (user.role === 'employee') return <Redirect href="/(employee)/(tabs)" />;
  return <Redirect href="/(client)/(tabs)" />;
}
