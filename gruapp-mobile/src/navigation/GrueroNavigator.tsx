import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import GrueroDashboard from '../screens/gruero/GrueroDashboard';
import GrueroHistorial from '../screens/gruero/GrueroHistorial';
import GrueroPerfil from '../screens/gruero/GrueroPerfil';
import GrueroNotificaciones from '../screens/gruero/GrueroNotificaciones';
import GrueroGanancias from '../screens/gruero/GrueroGanancias'; // ✅ NUEVO
import GrueroPagosPendientes from '../screens/gruero/GrueroPagosPendientes'; // ✅ NUEVO
import { useNotificacionesStore } from '../store/notificacionesStore';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// ✅ NUEVO: Stack para el Perfil (incluye Ganancias y Pagos)
function PerfilStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GrueroPerfil" component={GrueroPerfil} />
      <Stack.Screen name="GrueroGanancias" component={GrueroGanancias} />
      <Stack.Screen name="GrueroPagosPendientes" component={GrueroPagosPendientes} />
    </Stack.Navigator>
  );
}

// Badge de notificaciones
function NotificationBadge({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
}

export default function GrueroNavigator() {
  const noLeidas = useNotificacionesStore((state) => state.noLeidas);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={GrueroDashboard}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Historial"
        component={GrueroHistorial}
        options={{
          tabBarLabel: 'Historial',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Notificaciones"
        component={GrueroNotificaciones}
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
      {/* ✅ MODIFICADO: Ahora usa el Stack */}
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