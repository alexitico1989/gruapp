import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterClienteScreen from '../screens/auth/RegisterCliente';
import RegisterGrueroMultiStep from '../screens/auth/RegisterGrueroMultiStep';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="RegisterCliente" component={RegisterClienteScreen} />
      <Stack.Screen name="RegisterGruero" component={RegisterGrueroMultiStep} />
    </Stack.Navigator>
  );
}