import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { useAuthStore } from './src/store/authStore';

export default function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    // Initialize auth state on app start
    initialize();
  }, [initialize]);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
