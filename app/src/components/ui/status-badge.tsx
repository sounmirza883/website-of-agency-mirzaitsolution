import { Text, View } from 'react-native';

const PALETTE: Record<string, string> = {
  // greens
  Paid: 'bg-green-100 text-green-700',
  Approved: 'bg-green-100 text-green-700',
  Completed: 'bg-green-100 text-green-700',
  Done: 'bg-green-100 text-green-700',
  Active: 'bg-green-100 text-green-700',
  Closed: 'bg-green-100 text-green-700',
  // ambers
  Pending: 'bg-amber-100 text-amber-700',
  PendingVerification: 'bg-amber-100 text-amber-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  Open: 'bg-amber-100 text-amber-700',
  // reds
  Rejected: 'bg-red-100 text-red-700',
  Unpaid: 'bg-red-100 text-red-700',
  Inactive: 'bg-red-100 text-red-700',
};

export function StatusBadge({ status }: { status: string }) {
  const classes = PALETTE[status] ?? 'bg-gray-100 text-gray-700';
  return (
    <View className={`self-start rounded-full px-2 py-0.5 ${classes.split(' ')[0]}`}>
      <Text className={`text-xs font-medium ${classes.split(' ')[1]}`}>{status}</Text>
    </View>
  );
}
