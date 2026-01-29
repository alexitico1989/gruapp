import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { colors, spacing } from '../../theme/colors';
import Toast from 'react-native-toast-message';

interface ServicioDetalle {
  servicioId: string;
  fecha: string;
  origen: string;
  destino: string;
  monto: number;
}

interface Pago {
  id: string;
  periodo: string;
  fechaInicio: string;
  fechaFin: string;
  montoTotal: number;
  totalServicios: number;
  metodoPago: string | null;
  numeroComprobante: string | null;
  pagadoAt: string | null;
  notasAdmin?: string;
  detalles: ServicioDetalle[];
}

interface PagosData {
  pendiente: {
    monto: number;
    servicios: number;
    detalles: ServicioDetalle[];
  };
  historial: Pago[];
}

export default function GrueroPagosPendientes() {
  const [pagosData, setPagosData] = useState<PagosData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);

  useEffect(() => {
    cargarPagos();
  }, []);

  const cargarPagos = async () => {
    try {
      const response = await api.get('/gruero/pagos/historial');
      console.log('📦 DATA BACKEND:', response.data.data);
      if (response.data.success) {
        setPagosData(response.data.data);
      }
    } catch (error: any) {
      console.error('Error cargando pagos:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudieron cargar los pagos',
        position: 'top',
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    cargarPagos();
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'PAGADO':
        return '#10b981';
      case 'PENDIENTE':
        return '#f59e0b';
      case 'RECHAZADO':
        return '#ef4444';
      default:
        return colors.text.secondary;
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'PAGADO':
        return 'Pagado';
      case 'PENDIENTE':
        return 'Pendiente';
      case 'RECHAZADO':
        return 'Rechazado';
      default:
        return estado;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando pagos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!pagosData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorText}>Error al cargar pagos</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Pagos</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Pendiente de Pago */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pendiente de Pago</Text>
          <View style={styles.pendienteCard}>
            <View style={styles.pendienteHeader}>
              <Ionicons name="wallet" size={32} color={colors.primary} />
              <View style={styles.pendienteInfo}>
                <Text style={styles.pendienteLabel}>Por Cobrar</Text>
                <Text style={styles.pendienteMonto}>
                  ${pagosData.pendiente.monto.toLocaleString('es-CL')}
                </Text>
              </View>
            </View>

            <View style={styles.pendienteFooter}>
              <Text style={styles.pendienteServicios}>
                {pagosData.pendiente.servicios} servicio{pagosData.pendiente.servicios !== 1 ? 's' : ''} completado{pagosData.pendiente.servicios !== 1 ? 's' : ''}
              </Text>
              {pagosData.pendiente.servicios > 0 && (
                <TouchableOpacity onPress={() => setMostrarDetalles(!mostrarDetalles)}>
                  <Text style={styles.verDetallesText}>
                    {mostrarDetalles ? 'Ocultar' : 'Ver'} detalles
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {mostrarDetalles && (pagosData.pendiente.detalles || []).length > 0 && (
              <View style={styles.detallesContainer}>
                {(pagosData.pendiente.detalles || []).map((servicio) => (
                  <View key={servicio.servicioId} style={styles.detalleItem}>
                    <View style={styles.detalleHeader}>
                      <Text style={styles.detalleFecha}>
                        {formatearFecha(servicio.fecha)}
                      </Text>
                      <Text style={styles.detalleMonto}>
                        ${servicio.monto.toLocaleString('es-CL')}
                      </Text>
                    </View>
                    <Text style={styles.detalleId}>ID: {servicio.servicioId}</Text>
                    <Text style={styles.detalleRuta} numberOfLines={1}>
                      {servicio.origen} → {servicio.destino}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.infoBoxText}>
              Los pagos se realizan todos los viernes vía transferencia bancaria
            </Text>
          </View>
        </View>

        {/* Historial de Pagos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historial de Pagos</Text>
          {(pagosData.historial || []).length > 0 ? (
            (pagosData.historial || []).map((pago) => (
              <View key={pago.id} style={styles.pagoCard}>
                <View style={styles.pagoHeader}>
                  <View style={styles.pagoInfo}>
                    <Text style={styles.pagoPeriodo}>Semana {pago.periodo}</Text>
                    <Text style={styles.pagoFechas}>
                      {formatearFecha(pago.fechaInicio)} - {formatearFecha(pago.fechaFin)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.estadoBadge,
                      { backgroundColor: getEstadoColor((pago as any).estado) + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.estadoText,
                        { color: getEstadoColor((pago as any).estado) },
                      ]}
                    >
                      {getEstadoTexto((pago as any).estado)}
                    </Text>
                  </View>
                </View>

                <View style={styles.pagoDivider} />

                {/* Servicios dentro del pago */}
                <View style={styles.pagoDetails}>
                  {(pago.detalles || []).map((s) => (
                    <View key={s.servicioId} style={styles.servicioDetalle}>
                      <View style={styles.pagoDetailRow}>
                        <Text style={styles.pagoDetailLabel}>ID Servicio:</Text>
                        <Text style={styles.pagoDetailValue}>{s.servicioId}</Text>
                      </View>
                      <View style={styles.pagoDetailRow}>
                        <Text style={styles.pagoDetailLabel}>Origen:</Text>
                        <Text style={styles.pagoDetailValue}>{s.origen}</Text>
                      </View>
                      <View style={styles.pagoDetailRow}>
                        <Text style={styles.pagoDetailLabel}>Destino:</Text>
                        <Text style={styles.pagoDetailValue}>{s.destino}</Text>
                      </View>
                      <View style={styles.pagoDetailRow}>
                        <Text style={styles.pagoDetailLabel}>Monto:</Text>
                        <Text style={styles.pagoDetailValue}>${s.monto.toLocaleString('es-CL')}</Text>
                      </View>
                    </View>
                  ))}

                  <View style={styles.pagoDetailRow}>
                    <Text style={styles.pagoDetailLabel}>Monto Total:</Text>
                    <Text style={styles.pagoDetailValue}>${(pago.montoTotal ?? 0).toLocaleString('es-CL')}</Text>
                  </View>

                  {pago.metodoPago && (
                    <View style={styles.pagoDetailRow}>
                      <Text style={styles.pagoDetailLabel}>Método:</Text>
                      <Text style={styles.pagoDetailValue}>{pago.metodoPago}</Text>
                    </View>
                  )}

                  {pago.numeroComprobante && (
                    <View style={styles.pagoDetailRow}>
                      <Text style={styles.pagoDetailLabel}>Comprobante:</Text>
                      <Text style={styles.pagoDetailValue}>{pago.numeroComprobante}</Text>
                    </View>
                  )}

                  {pago.pagadoAt && (
                    <View style={styles.pagoDetailRow}>
                      <Text style={styles.pagoDetailLabel}>Pagado:</Text>
                      <Text style={styles.pagoDetailValue}>{formatearFecha(pago.pagadoAt)}</Text>
                    </View>
                  )}

                  {pago.notasAdmin && (
                    <View style={styles.notasContainer}>
                      <Text style={styles.notasLabel}>Notas:</Text>
                      <Text style={styles.notasText}>{pago.notasAdmin}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={64} color={colors.text.secondary} />
              <Text style={styles.emptyText}>Sin historial de pagos</Text>
            </View>
          )}
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// === ESTILOS ===
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: spacing.md, color: colors.text.secondary },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  errorText: { fontSize: 16, color: colors.error, marginTop: spacing.md },
  header: { backgroundColor: '#fff', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.secondary },
  scrollView: { flex: 1 },
  section: { padding: spacing.md },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.secondary, marginBottom: spacing.sm },
  pendienteCard: { backgroundColor: '#fff', borderRadius: 12, padding: spacing.lg, borderWidth: 2, borderColor: colors.primary, marginBottom: spacing.md },
  pendienteHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  pendienteInfo: { flex: 1 },
  pendienteLabel: { fontSize: 14, color: colors.text.secondary, fontWeight: '600' },
  pendienteMonto: { fontSize: 32, fontWeight: 'bold', color: colors.primary, marginTop: spacing.xs },
  pendienteFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md },
  pendienteServicios: { fontSize: 13, color: colors.text.secondary },
  verDetallesText: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  detallesContainer: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  detalleItem: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  detalleHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  detalleFecha: { fontSize: 12, color: colors.text.secondary },
  detalleMonto: { fontSize: 14, fontWeight: 'bold', color: colors.primary },
  detalleRuta: { fontSize: 12, color: colors.text.secondary },
  detalleId: { fontSize: 11, color: colors.text.secondary, marginBottom: 2 },
  infoBox: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: '#f0f9ff', padding: spacing.md, borderRadius: 8 },
  infoBoxText: { flex: 1, fontSize: 13, color: colors.text.primary },
  pagoCard: { backgroundColor: '#fff', borderRadius: 12, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  pagoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  pagoInfo: { flex: 1 },
  pagoPeriodo: { fontSize: 16, fontWeight: 'bold', color: colors.secondary },
  pagoFechas: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  estadoBadge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 6 },
  estadoText: { fontSize: 12, fontWeight: '600' },
  pagoDivider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  pagoDetails: { gap: spacing.xs },
  pagoDetailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  pagoDetailLabel: { fontSize: 13, color: colors.text.secondary },
  pagoDetailValue: { fontSize: 13, fontWeight: '600', color: colors.secondary, flexShrink: 1, textAlign: 'right' },
  notasContainer: { marginTop: spacing.sm, padding: spacing.sm, backgroundColor: '#f9fafb', borderRadius: 6 },
  notasLabel: { fontSize: 12, fontWeight: '600', color: colors.text.secondary, marginBottom: 4 },
  notasText: { fontSize: 12, color: colors.text.primary },
  emptyState: { alignItems: 'center', padding: spacing.xl, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  emptyText: { fontSize: 14, color: colors.text.secondary, marginTop: spacing.sm }, servicioDetalle: { 
  paddingVertical: spacing.sm, 
  borderBottomWidth: 1, 
  borderBottomColor: colors.border,
  marginBottom: spacing.xs,
},

});
