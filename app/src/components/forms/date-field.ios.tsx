import { useState } from 'react';
import { View } from 'react-native';
import { DatePicker, Host } from '@expo/ui/swift-ui';
import { FieldLabel } from './field';
import { formatDate, type DateFieldProps } from './date-field-shared';

export { formatDate } from './date-field-shared';
export type { DateFieldProps } from './date-field-shared';

/** SwiftUI date picker. Typing the date by hand let malformed values reach the API. */
export function DateField({ label, value, onChange }: DateFieldProps) {
  const [selection, setSelection] = useState<Date | undefined>(undefined);
  return (
    <View>
      <FieldLabel>{label}</FieldLabel>
      <Host matchContents>
        <DatePicker
          title={label}
          selection={selection}
          displayedComponents={['date']}
          onDateChange={(date) => {
            setSelection(date);
            onChange(formatDate(date));
          }}
        />
      </Host>
    </View>
  );
}
