import { useState } from 'react';
import { View } from 'react-native';
import { DatePickerDialog } from '@expo/ui/jetpack-compose';
import { DateFieldButton, formatDate, type DateFieldProps } from './date-field-shared';

export { formatDate } from './date-field-shared';
export type { DateFieldProps } from './date-field-shared';

/** Material 3 date dialog. Typing the date by hand let malformed values reach the API. */
export function DateField({ label, value, onChange }: DateFieldProps) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <DateFieldButton label={label} value={value} onPress={() => setOpen(true)} />
      {open && (
        <DatePickerDialog
          onDateSelected={(date) => {
            onChange(formatDate(date));
            setOpen(false);
          }}
          onDismissRequest={() => setOpen(false)}
        />
      )}
    </View>
  );
}
