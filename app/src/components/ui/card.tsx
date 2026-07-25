import { Pressable, View, type ViewProps } from 'react-native';

export function Card({ className, onPress, ...props }: ViewProps & { onPress?: () => void; className?: string }) {
  const content = (
    <View
      className={`rounded-xl border border-surface-selected bg-surface p-4 dark:border-surface-selected-dark dark:bg-surface-dark ${className ?? ''}`}
      {...props}
    />
  );
  if (!onPress) return content;
  return <Pressable onPress={onPress}>{content}</Pressable>;
}
