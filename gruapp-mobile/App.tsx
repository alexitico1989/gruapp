import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { SocketProvider } from './src/contexts/SocketContext';
import Toast from 'react-native-toast-message'; // ✅ IMPORTAR TOAST
import { toastConfig } from './src/config/toastConfig'; // ✅ IMPORTAR CONFIG

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <SocketProvider>
        <AppNavigator />
      </SocketProvider>
      
      {/* ✅ TOAST AL FINAL */}
      <Toast config={toastConfig} />
    </>
  );
}