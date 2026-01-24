import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNotificacionesStore } from '../../store/notificacionesStore';
import { colors, spacing } from '../../theme/colors';
import { useNavigation } from '@react-navigation/native';

export default function ClienteNotificaciones() {
  const navigation = useNavigation();
  const {
    notificaciones,
    noLeidas,
    marcarComoLeida,
    marcarTodasComoLeidas,
    eliminarNotificacion,
    limpiarTodas,
    cargarNotificaciones,
  } = useNotificacionesStore();

  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    cargarNotificaciones();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarNotificaciones();
    setRefreshing(false);
  };

  const getIconoNotificacion = (tipo: string) => {
    const iconos: Record<string, { name: string; color: string; bg: string }> = {
      SERVICIO_ACEPTADO: { name: 'checkmark-circle', color: '#10b981', bg: '#f0fdf4' },
      ESTADO_ACTUALIZADO: { name: 'information-circle', color: '#3b82f6', bg: '#f0f9ff' },
      SERVICIO_CANCELADO: { name: 'close-circle', color: '#ef4444', bg: '#fef2f2' },
      SERVICIO_COMPLETADO: { name: 'checkmark-done-circle', color: '#8b5cf6', bg: '#faf5ff' },
      RECLAMO_ACTUALIZADO: { name: 'alert-circle', color: '#f59e0b', bg: '#fffbeb' },
      GENERAL: { name: 'notifications', color: colors.primary, bg: '#f0f9ff' },
    };
    return iconos[tipo] || iconos.GENERAL;
  };

  const formatearTiempo = (fecha: Date) => {
    const ahora = new Date();
    const diff = ahora.getTime() - new Date(fecha).getTime();
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (minutos < 1) return 'Ahora';
    if (minutos < 60) return `Hace ${minutos} min`;
    if (horas < 24) return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
    return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
  };

  const handleNotificacionPress = (notif: any) => {
    if (!notif.leida) {
      marcarComoLeida(notif.id);
    }

    // Navegar según el tipo
    if (notif.servicioId) {
      navigation.navigate('Dashboard' as never);
    }
  };

  const renderNotificacion = ({ item }: { item: any }) => {
    const icono = getIconoNotificacion(item.tipo);

    return (
      <TouchableOpacity
        style={[
          styles.notificacionItem,
          !item.leida && styles.notificacionNoLeida,
        ]}
        onPress={() => handleNotificacionPress(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconoContainer, { backgroundColor: icono.bg }]}>
          <Ionicons name={icono.name as any} size={24} color={icono.color} />
        </View>

        <View style={styles.notificacionContent}>
          <View style={styles.notificacionHeader}>
            <Text style={styles.notificacionTitulo}>{item.titulo}</Text>
            {!item.leida && <View style={styles.puntoNoLeido} />}
          </View>
          <Text style={styles.notificacionMensaje}>{item.mensaje}</Text>
          <Text style={styles.notificacionTiempo}>
            {formatearTiempo(item.fecha)}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => eliminarNotificacion(item.id)}
          style={styles.eliminarButton}
        >
          <Ionicons name="close" size={20} color={colors.text.secondary} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Notificaciones</Text>
          {noLeidas > 0 && (
            <Text style={styles.subtitle}>{noLeidas} sin leer</Text>
          )}
        </View>
        <View style={styles.headerButtons}>
          {noLeidas > 0 && (
            <TouchableOpacity
              onPress={marcarTodasComoLeidas}
              style={styles.headerButton}
            >
              <Ionicons name="checkmark-done" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
          {notificaciones.length > 0 && (
            <TouchableOpacity
              onPress={limpiarTodas}
              style={styles.headerButton}
            >
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {notificaciones.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={64} color={colors.text.secondary} />
          <Text style={styles.emptyTitle}>Sin notificaciones</Text>
          <Text style={styles.emptyText}>
            Aquí aparecerán las actualizaciones de tus servicios
          </Text>
        </View>
      ) : (
        <FlatList
          data={notificaciones}
          renderItem={renderNotificacion}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 2,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerButton: {
    padding: spacing.xs,
  },
  listContainer: {
    padding: spacing.md,
  },
  notificacionItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  notificacionNoLeida: {
    backgroundColor: '#f0f9ff',
    borderColor: colors.primary,
  },
  iconoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  notificacionContent: {
    flex: 1,
  },
  notificacionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  notificacionTitulo: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.secondary,
    flex: 1,
  },
  puntoNoLeido: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  notificacionMensaje: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  notificacionTiempo: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  eliminarButton: {
    padding: spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.secondary,
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});