import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import ClienteDashboard from '../screens/cliente/ClienteDashboard';
import ClienteHistorial from '../screens/cliente/ClienteHistorial';
import ClientePerfil from '../screens/cliente/ClientePerfil';
import ClienteReclamosScreen from '../screens/cliente/ClienteReclamosScreen';
import ClienteNotificaciones from '../screens/cliente/ClienteNotificaciones'; // ✅ NUEVO
import { useNotificacionesStore } from '../store/notificacionesStore'; // ✅ NUEVO
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack para el Perfil (incluye la pantalla de reclamos)
function PerfilStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ClientePerfil" component={ClientePerfil} />
      <Stack.Screen name="ClienteReclamos" component={ClienteReclamosScreen} />
    </Stack.Navigator>
  );
}

// ✅ NUEVO: Badge de notificaciones
function NotificationBadge({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
}

export default function ClienteNavigator() {
  const noLeidas = useNotificacionesStore((state) => state.noLeidas); // ✅ NUEVO

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={ClienteDashboard}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Historial"
        component={ClienteHistorial}
        options={{
          tabBarLabel: 'Historial',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
        }}
      />
      {/* ✅ NUEVO: Tab de Notificaciones */}
      <Tab.Screen
        name="Notificaciones"
        component={ClienteNotificaciones}
        options={{
          tabBarLabel: 'Notificaciones',
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="notifications" size={size} color={color} />
              <NotificationBadge count={noLeidas} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={PerfilStack}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ✅ NUEVO: Estilos para el badge
const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});