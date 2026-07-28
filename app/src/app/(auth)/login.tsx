import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { useAuth } from '@/context/auth-context';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError('');
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 justify-center bg-surface px-6 dark:bg-surface-dark"
    >
      <Text className="mb-1 text-3xl font-bold text-text dark:text-text-dark">Mirza IT Solution</Text>
      <Text className="mb-8 text-base text-text-secondary dark:text-text-secondary-dark">Sign in to continue</Text>

      {error ? (
        <View className="mb-4 rounded-lg bg-red-50 px-3 py-2">
          <Text className="text-sm text-red-600">{error}</Text>
        </View>
      ) : null}

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        className="mb-3 rounded-lg border border-surface-selected px-4 py-3 text-base text-text dark:border-surface-selected-dark dark:text-text-dark"
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        className="mb-6 rounded-lg border border-surface-selected px-4 py-3 text-base text-text dark:border-surface-selected-dark dark:text-text-dark"
      />

      <Pressable
        onPress={handleSubmit}
        disabled={submitting || !email || !password}
        className="items-center rounded-lg bg-brand py-3 disabled:opacity-50"
      >
        {submitting ? <ActivityIndicator color="#f5ead8" /> : <Text className="text-base font-semibold text-[#f5ead8]">Sign In</Text>}
      </Pressable>
    </KeyboardAvoidingView>
  );
}
