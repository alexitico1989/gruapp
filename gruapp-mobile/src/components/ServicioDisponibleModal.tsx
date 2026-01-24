import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme/colors';

interface Servicio {
  id: string;
  origenDireccion: string;
  destinoDireccion: string;
  distanciaKm: number;
  totalGruero: number;
  tipoVehiculo: string;
  observaciones?: string;
}

interface Props {
  visible: boolean;
  servicio: Servicio | null;
  onAceptar: () => void;
  onRechazar: () => void;
  loading?: boolean;
}

const TIPO_VEHICULO_EMOJI: Record<string, string> = {
  AUTOMOVIL: '🚗',
  SUV: '🚙',
  CAMIONETA: '🛻',
  MOTO: '🏍️',
  FURGON: '🚐',
  CAMION_LIVIANO: '🚚',
};

export default function ServicioDisponibleModal({
  visible,
  servicio,
  onAceptar,
  onRechazar,
  loading = false,
}: Props) {
  if (!servicio) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onRechazar}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="notifications" size={24} color={colors.primary} />
            </View>
            <Text style={styles.headerTitle}>¡Nuevo Servicio!</Text>
            <Text style={styles.headerSubtitle}>Un cliente necesita tu ayuda</Text>
          </View>

          {/* Detalles del Servicio - ScrollView */}
          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              {/* Tipo de Vehículo */}
              <View style={styles.vehiculoContainer}>
                <Text style={styles.vehiculoEmoji}>
                  {TIPO_VEHICULO_EMOJI[servicio.tipoVehiculo] || '🚗'}
                </Text>
                <Text style={styles.vehiculoTexto}>{servicio.tipoVehiculo}</Text>
              </View>

              {/* Ubicaciones */}
              <View style={styles.ubicacionesContainer}>
                <View style={styles.ubicacionItem}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="location" size={16} color="#10b981" />
                  </View>
                  <View style={styles.ubicacionTexto}>
                    <Text style={styles.ubicacionLabel}>Origen</Text>
                    <Text style={styles.ubicacionValor} numberOfLines={2}>
                      {servicio.origenDireccion}
                    </Text>
                  </View>
                </View>

                <View style={styles.separador}>
                  <View style={styles.lineaPunteada} />
                </View>

                <View style={styles.ubicacionItem}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="navigate" size={16} color={colors.primary} />
                  </View>
                  <View style={styles.ubicacionTexto}>
                    <Text style={styles.ubicacionLabel}>Destino</Text>
                    <Text style={styles.ubicacionValor} numberOfLines={2}>
                      {servicio.destinoDireccion}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Info del Servicio */}
              <View style={styles.infoContainer}>
                <View style={styles.infoItem}>
                  <Ionicons name="car-outline" size={18} color={colors.text.secondary} />
                  <Text style={styles.infoTexto}>{servicio.distanciaKm.toFixed(1)} km</Text>
                </View>

                <View style={styles.infoDivider} />

                <View style={styles.infoItem}>
                  <Ionicons name="cash-outline" size={18} color="#16a34a" />
                  <Text style={styles.infoTexto}>
                    ${servicio.totalGruero.toLocaleString('es-CL')}
                  </Text>
                </View>
              </View>

              {/* Observaciones */}
              {servicio.observaciones && (
                <View style={styles.observacionesContainer}>
                  <Ionicons name="information-circle-outline" size={16} color={colors.text.secondary} />
                  <Text style={styles.observacionesTexto}>{servicio.observaciones}</Text>
                </View>
              )}

              {/* Ganancia Destacada */}
              <View style={styles.gananciaContainer}>
                <Text style={styles.gananciaLabel}>Ganarás</Text>
                <Text style={styles.gananciaValor}>
                  ${servicio.totalGruero.toLocaleString('es-CL')}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Botones */}
          <View style={styles.botonesContainer}>
            <TouchableOpacity
              style={styles.botonRechazar}
              onPress={onRechazar}
              disabled={loading}
            >
              <Ionicons name="close-circle-outline" size={20} color={colors.error} />
              <Text style={styles.botonRechazarTexto}>Rechazar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.botonAceptar, loading && styles.botonDisabled]}
              onPress={onAceptar}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.botonAceptarTexto}>Aceptar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 380,
    maxHeight: '80%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    alignItems: 'center',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  scrollContent: {
    maxHeight: 400,
  },
  content: {
    padding: spacing.md,
  },
  vehiculoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    backgroundColor: '#f0f9ff',
    borderRadius: 10,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  vehiculoEmoji: {
    fontSize: 24,
  },
  vehiculoTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary,
  },
  ubicacionesContainer: {
    marginBottom: spacing.md,
  },
  ubicacionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  ubicacionTexto: {
    flex: 1,
  },
  ubicacionLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  ubicacionValor: {
    fontSize: 13,
    color: colors.secondary,
    fontWeight: '500',
    lineHeight: 18,
  },
  separador: {
    paddingLeft: 14,
    paddingVertical: spacing.xs,
  },
  lineaPunteada: {
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
    borderStyle: 'dashed',
    height: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    padding: spacing.sm,
    borderRadius: 10,
    marginBottom: spacing.sm,
    justifyContent: 'space-around',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.secondary,
  },
  infoDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  observacionesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    padding: spacing.sm,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  observacionesTexto: {
    flex: 1,
    fontSize: 12,
    color: colors.secondary,
    lineHeight: 16,
  },
  gananciaContainer: {
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: '#dcfce7',
    borderRadius: 12,
  },
  gananciaLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  gananciaValor: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  botonesContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  botonRechazar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    borderRadius: 10,
    backgroundColor: '#fee2e2',
    gap: 4,
  },
  botonRechazarTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
  },
  botonAceptar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    borderRadius: 10,
    backgroundColor: colors.primary,
    gap: 4,
  },
  botonAceptarTexto: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  botonDisabled: {
    opacity: 0.6,
  },
});