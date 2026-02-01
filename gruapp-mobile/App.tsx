import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { SocketProvider } from './src/contexts/SocketContext';
import { PushNotificationProvider, usePushNotification } from './src/contexts/PushNotificationContext';
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/config/toastConfig';
import { OneSignal } from 'react-native-onesignal';

function AppContent() {
  const { setPendingNotification } = usePushNotification();

  useEffect(() => {
    try {
      OneSignal.initialize('6bd4669f-3b51-4f2c-9ca8-fcbb321e7365');
      OneSignal.Notifications.requestPermission(true);
      console.log('✅ OneSignal initialized');

      // Cuando el usuario toca una notificación (app en segundo plano o cerrada)
      OneSignal.Notifications.addEventListener('click', (event: any) => {
        console.log('📱 Notificación clickeada:', event.result.notification.additionalData);
        const data = event.result.notification.additionalData as any;
        if (data && data.tipo) {
          setPendingNotification(data);
        }
      });
    } catch (e) {
      console.error('❌ OneSignal init error:', e);
    }
  }, [setPendingNotification]);

  return (
    <>
      <StatusBar style="auto" />
      <SocketProvider>
        <AppNavigator />
      </SocketProvider>
      <Toast config={toastConfig} />
    </>
  );
}

export default function App() {
  return (
    <PushNotificationProvider>
      <AppContent />
    </PushNotificationProvider>
  );
}