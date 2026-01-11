import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { SocketProvider } from './src/contexts/SocketContext'; // ✅ IMPORTAR

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <SocketProvider>
        <AppNavigator />
      </SocketProvider>
    </>
  );
}