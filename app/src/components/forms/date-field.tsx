import { TextInput, View } from 'react-native';
import { FieldLabel, inputClass, placeholderColor } from './field';
import type { DateFieldProps } from './date-field-shared';

export { formatDate } from './date-field-shared';
export type { DateFieldProps } from './date-field-shared';

/**
 * Web fallback. iOS and Android resolve date-field.ios.tsx / date-field.android.tsx,
 * which open the real platform picker; Expo web has no native picker to open, so
 * the date is typed here — matching what every platform did before.
 */
export function DateField({ label, value, onChange }: DateFieldProps) {
  return (
    <View>
      <FieldLabel>{label}</FieldLabel>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChange}
        placeholder="e.g. Aug 1, 2026"
        placeholderTextColor={placeholderColor}
        className={inputClass}
      />
    </View>
  );
}
