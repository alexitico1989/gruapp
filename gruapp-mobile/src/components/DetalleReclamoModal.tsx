import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme/colors';

interface Reclamo {
  id: string;
  tipo: string;
  descripcion: string;
  estado: string;
  prioridad: string;
  createdAt: string;
  resolucion?: string;
  resueltoAt?: string;
  servicio: {
    id: string;
    origenDireccion: string;
    destinoDireccion: string;
  };
}

interface Props {
  visible: boolean;
  reclamo: Reclamo | null;
  onClose: () => void;
}

export default function DetalleReclamoModal({ visible, reclamo, onClose }: Props) {
  if (!reclamo) return null;

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTipoLabel = (tipo: string) => {
    const tipos: Record<string, string> = {
      PROBLEMA_SERVICIO: 'Problema con el Servicio',
      PROBLEMA_PAGO: 'Problema de Pago',
      MALTRATO: 'Maltrato',
      OTRO: 'Otro',
    };
    return tipos[tipo] || tipo;
  };

  const getEstadoInfo = (estado: string) => {
    const estados: Record<string, { label: string; bg: string; text: string; icon: string }> = {
      PENDIENTE: {
        label: 'Pendiente',
        bg: '#fef3c7',
        text: '#d97706',
        icon: 'time-outline',
      },
      EN_REVISION: {
        label: 'En Revisión',
        bg: '#dbeafe',
        text: '#2563eb',
        icon: 'search-outline',
      },
      RESUELTO: {
        label: 'Resuelto',
        bg: '#dcfce7',
        text: '#16a34a',
        icon: 'checkmark-circle',
      },
      RECHAZADO: {
        label: 'Rechazado',
        bg: '#fee2e2',
        text: '#dc2626',
        icon: 'close-circle',
      },
    };
    return estados[estado] || estados.PENDIENTE;
  };

  const getPrioridadInfo = (prioridad: string) => {
    const prioridades: Record<string, { label: string; color: string; icon: string }> = {
      ALTA: { label: 'Alta', color: '#dc2626', icon: 'alert-circle' },
      MEDIA: { label: 'Media', color: '#f59e0b', icon: 'alert' },
      BAJA: { label: 'Baja', color: '#6b7280', icon: 'information-circle' },
    };
    return prioridades[prioridad] || prioridades.MEDIA;
  };

  const estadoInfo = getEstadoInfo(reclamo.estado);
  const prioridadInfo = getPrioridadInfo(reclamo.prioridad);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Detalle del Reclamo</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.content} 
            contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }}
            showsVerticalScrollIndicator={false}
            >
            {/* Estado y Prioridad */}
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.estadoBadge,
                  { backgroundColor: estadoInfo.bg },
                ]}
              >
                <Ionicons name={estadoInfo.icon as any} size={20} color={estadoInfo.text} />
                <Text style={[styles.estadoText, { color: estadoInfo.text }]}>
                  {estadoInfo.label}
                </Text>
              </View>
              <View style={styles.prioridadBadge}>
                <Ionicons
                  name={prioridadInfo.icon as any}
                  size={18}
                  color={prioridadInfo.color}
                />
                <Text style={[styles.prioridadText, { color: prioridadInfo.color }]}>
                  Prioridad {prioridadInfo.label}
                </Text>
              </View>
            </View>

            {/* Tipo */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Tipo de Reclamo</Text>
              <Text style={styles.tipoText}>{getTipoLabel(reclamo.tipo)}</Text>
            </View>

            {/* Descripción */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Descripción</Text>
              <Text style={styles.descripcionText}>{reclamo.descripcion}</Text>
            </View>

            {/* Servicio Relacionado */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Servicio Relacionado</Text>
              <View style={styles.servicioCard}>
                <View style={styles.servicioIdContainer}>
                  <Ionicons name="car-outline" size={18} color={colors.primary} />
                  <Text style={styles.servicioIdText}>
                    Servicio #{reclamo.servicio.id.substring(0, 8).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.ubicacionItem}>
                  <Ionicons name="location" size={16} color="#10b981" />
                  <Text style={styles.ubicacionText} numberOfLines={2}>
                    {reclamo.servicio.origenDireccion}
                  </Text>
                </View>
                <View style={styles.ubicacionItem}>
                  <Ionicons name="navigate" size={16} color={colors.primary} />
                  <Text style={styles.ubicacionText} numberOfLines={2}>
                    {reclamo.servicio.destinoDireccion}
                  </Text>
                </View>
              </View>
            </View>

            {/* Fecha de Creación */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Fecha de Creación</Text>
              <View style={styles.fechaContainer}>
                <Ionicons name="calendar-outline" size={16} color={colors.text.secondary} />
                <Text style={styles.fechaText}>{formatearFecha(reclamo.createdAt)}</Text>
              </View>
            </View>

            {/* Resolución (si existe) */}
            {reclamo.resolucion && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>
                  {reclamo.estado === 'RESUELTO' ? '✅ Resolución' : '❌ Motivo de Rechazo'}
                </Text>
                <View
                  style={[
                    styles.resolucionCard,
                    {
                      backgroundColor:
                        reclamo.estado === 'RESUELTO' ? '#dcfce7' : '#fee2e2',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.resolucionText,
                      {
                        color: reclamo.estado === 'RESUELTO' ? '#16a34a' : '#dc2626',
                      },
                    ]}
                  >
                    {reclamo.resolucion}
                  </Text>
                  {reclamo.resueltoAt && (
                    <View style={styles.resueltoFechaContainer}>
                      <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color={reclamo.estado === 'RESUELTO' ? '#16a34a' : '#dc2626'}
                      />
                      <Text
                        style={[
                          styles.resueltoFechaText,
                          {
                            color: reclamo.estado === 'RESUELTO' ? '#16a34a' : '#dc2626',
                          },
                        ]}
                      >
                        {formatearFecha(reclamo.resueltoAt)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Info según estado */}
            {reclamo.estado === 'PENDIENTE' && (
              <View style={styles.infoBox}>
                <Ionicons name="time-outline" size={20} color="#d97706" />
                <Text style={styles.infoText}>
                  Tu reclamo está pendiente de revisión. Nuestro equipo lo evaluará pronto.
                </Text>
              </View>
            )}

            {reclamo.estado === 'EN_REVISION' && (
              <View style={styles.infoBox}>
                <Ionicons name="search-outline" size={20} color="#2563eb" />
                <Text style={styles.infoText}>
                  Tu reclamo está siendo revisado por nuestro equipo. Te notificaremos cuando haya
                  novedades.
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeFooterButton} onPress={onClose}>
              <Text style={styles.closeFooterButtonText}>Cerrar</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    flex: 1, // ✅ AGREGADO
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  // ✅ CORREGIDO: Cambiar de "content" a usar scrollView + scrollContent
  content: {
    flex: 1, // ✅ AGREGADO
    padding: 0, // ✅ CAMBIADO (el padding va en scrollContent)
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  estadoBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    gap: spacing.xs,
  },
  estadoText: {
    fontSize: 14,
    fontWeight: '700',
  },
  prioridadBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  prioridadText: {
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  tipoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  descripcionText: {
    fontSize: 15,
    color: colors.text.primary,
    lineHeight: 22,
  },
  servicioCard: {
    backgroundColor: '#f9fafb',
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  ubicacionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  ubicacionText: {
    flex: 1,
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  fechaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  fechaText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  resolucionCard: {
    padding: spacing.md,
    borderRadius: 8,
  },
  resolucionText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  resueltoFechaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
  },
  resueltoFechaText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.xl, // ✅ AGREGADO: Espacio adicional al final
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: '#fff', // ✅ AGREGADO
  },
  closeFooterButton: {
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeFooterButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },

  servicioIdContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing.xs,
  marginBottom: spacing.sm,
  paddingBottom: spacing.sm,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
},
servicioIdText: {
  fontSize: 15,
  fontWeight: '700',
  color: colors.primary,
},
});