import { Pressable, Text } from 'react-native';
import { useAuth } from '@/context/auth-context';

export function LogoutButton() {
  const { logout } = useAuth();
  return (
    <Pressable onPress={() => logout()} className="rounded-lg border border-surface-selected px-3 py-1.5 dark:border-surface-selected-dark">
      <Text className="text-sm font-medium text-text dark:text-text-dark">Log out</Text>
    </Pressable>
  );
}
