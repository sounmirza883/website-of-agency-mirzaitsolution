import { Text, TextInput, View, type TextInputProps } from 'react-native';

export const inputClass =
  'rounded-lg border border-surface-selected px-3 py-2 text-sm text-text dark:border-surface-selected-dark dark:text-text-dark';

export const labelClass = 'mb-1 text-xs font-medium text-text-secondary dark:text-text-secondary-dark';

/** Placeholder grey. Not a theme token, but the value already used across the employee screens. */
export const placeholderColor = '#9ca3af';

export function FieldLabel({ children }: { children: string }) {
  return <Text className={labelClass}>{children}</Text>;
}

/**
 * Labelled text input. A placeholder alone disappears the moment you type, so
 * every field carries a visible label naming it.
 */
export function Field({ label, ...props }: { label: string } & TextInputProps) {
  return (
    <View>
      <FieldLabel>{label}</FieldLabel>
      <TextInput accessibilityLabel={label} placeholderTextColor={placeholderColor} className={inputClass} {...props} />
    </View>
  );
}
