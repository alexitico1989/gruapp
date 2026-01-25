import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterClienteScreen from '../screens/auth/RegisterCliente';
import RegisterGrueroMultiStep from '../screens/auth/RegisterGrueroMultiStep';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import VerifyCodeScreen from '../screens/auth/VerifyCodeScreen';       // ✅ Nueva pantalla
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen'; // ✅ Nueva pantalla

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Pantallas de autenticación */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />

      {/* Pantallas de registro */}
      <Stack.Screen name="RegisterCliente" component={RegisterClienteScreen} />
      <Stack.Screen name="RegisterGruero" component={RegisterGrueroMultiStep} />
    </Stack.Navigator>
  );
}
