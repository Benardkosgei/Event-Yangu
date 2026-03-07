import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import { RootStackParamList } from './types';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { useAuthStore } from '../store/authStore';
import { Colors } from '../constants/colors';
import { SessionExpiredModal } from '../components/SessionExpiredModal';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { isAuthenticated, isInitialized } = useAuthStore();

  // Show loading screen while initializing auth
  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <>
      <NavigationContainer
        onReady={() => console.log('Navigation container ready')}
        onStateChange={(state) => console.log('Navigation state changed:', state)}
      >
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isAuthenticated ? (
            <Stack.Screen 
              name="Auth" 
              component={AuthNavigator}
            />
          ) : (
            <Stack.Screen 
              name="Main" 
              component={MainNavigator}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
      <SessionExpiredModal />
    </>
  );
};
