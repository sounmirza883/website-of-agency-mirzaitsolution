import { Text, View } from 'react-native';
import { FieldLabel, inputClass } from './field';

/**
 * The backend stores dates as display strings and every list screen renders them
 * verbatim. This is the exact format the web portals produce, so a date picked on
 * mobile has to match it or the same record reads differently per client.
 */
export function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export type DateFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

/** Labelled, tappable display of the chosen date. Shared by both native pickers. */
export function DateFieldButton({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  return (
    <View>
      <FieldLabel>{label}</FieldLabel>
      <Text
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        className={`${inputClass} ${value ? '' : 'text-text-secondary dark:text-text-secondary-dark'}`}
      >
        {value || 'Select a date'}
      </Text>
    </View>
  );
}
