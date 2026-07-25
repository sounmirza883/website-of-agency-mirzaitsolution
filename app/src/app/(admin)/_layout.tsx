import { Redirect, Slot } from 'expo-router';
import { useAuth } from '@/context/auth-context';

export default function AdminLayout() {
  const { user } = useAuth();

  if (!user) return <Redirect href="/(auth)/login" />;
  if (user.role !== 'admin') return <Redirect href="/" />;

  return <Slot />;
}
