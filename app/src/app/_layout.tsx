import '@/global.css';

import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme, Slot, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Figtree_400Regular, Figtree_600SemiBold, Figtree_700Bold } from '@expo-google-fonts/figtree';
import { Caprasimo_400Regular } from '@expo-google-fonts/caprasimo';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider, useAuth } from '@/context/auth-context';
import { createQueryClient } from '@/context/query-client';

SplashScreen.preventAutoHideAsync();

function RootNavigation() {
  const { loading } = useAuth();
  const [fontsLoaded] = useFonts({
    Figtree_400Regular,
    Figtree_600SemiBold,
    Figtree_700Bold,
    Caprasimo_400Regular,
  });

  useEffect(() => {
    if (!loading && fontsLoaded) SplashScreen.hideAsync();
  }, [loading, fontsLoaded]);

  if (loading || !fontsLoaded) return null;
  return <Slot />;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [queryClient] = useState<QueryClient>(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <RootNavigation />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
