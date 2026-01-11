import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/authStore';
import AuthNavigator from './AuthNavigator';
import ClienteNavigator from './ClienteNavigator';
import GrueroNavigator from './GrueroNavigator';
import SplashScreen from '../screens/SplashScreen';

export default function AppNavigator() {
  const { isAuthenticated, isLoading, loadAuth, user } = useAuthStore();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    loadAuth();
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#ff7a3d" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthNavigator />
      ) : user?.role === 'CLIENTE' ? (
        <ClienteNavigator />
      ) : user?.role === 'GRUERO' ? (
        <GrueroNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}