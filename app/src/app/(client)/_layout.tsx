import { Redirect, Slot } from 'expo-router';
import { useAuth } from '@/context/auth-context';

export default function ClientLayout() {
  const { user } = useAuth();

  if (!user) return <Redirect href="/(auth)/login" />;
  if (user.role !== 'client') return <Redirect href="/" />;

  return <Slot />;
}
