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

interface ServicioPendiente {
  id: string;
  fecha: string;
  cliente: string;
  origen: string;
  destino: string;
  distancia: number;
  monto: number;
}

interface PagoHistorial {
  id: string;
  periodo: string;
  fechaInicio: string;
  fechaFin: string;
  totalServicios: number;
  montoTotal: number;
  metodoPago: string | null;
  numeroComprobante: string | null;
  pagadoAt: string | null;
  servicios: {
    id: string;
    fecha: string;
    cliente: string;
    origen: string;
    destino: string;
    monto: number;
  }[];
}

interface DatosPendientes {
  periodo: string;
  inicioSemana: string;
  finSemana: string;
  totalServicios: number;
  totalPendiente: number;
  servicios: ServicioPendiente[];
}

interface DatosHistorial {
  pagos: PagoHistorial[];
  totalRecibido: number;
}

export default function GrueroPagosPendientes() {
  const [datosPendientes, setDatosPendientes] = useState<DatosPendientes | null>(null);
  const [datosHistorial, setDatosHistorial] = useState<DatosHistorial | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [pagoExpandido, setPagoExpandido] = useState<string | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      // Cargar pendientes
      const resPendientes = await api.get('/gruero/pagos/pendientes');
      if (resPendientes.data.success) {
        setDatosPendientes(resPendientes.data.data);
      }

      // Cargar historial
      const resHistorial = await api.get('/gruero/pagos/historial');
      if (resHistorial.data.success) {
        setDatosHistorial(resHistorial.data.data);
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
    cargarDatos();
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const togglePagoExpandido = (pagoId: string) => {
    setPagoExpandido(pagoExpandido === pagoId ? null : pagoId);
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
        {/* Pendiente de Pago - Semana Actual */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pendiente de Pago</Text>
          <View style={styles.pendienteCard}>
            <View style={styles.pendienteHeader}>
              <Ionicons name="wallet" size={32} color={colors.primary} />
              <View style={styles.pendienteInfo}>
                <Text style={styles.pendienteLabel}>Por Cobrar esta Semana</Text>
                <Text style={styles.pendienteMonto}>
                  ${datosPendientes?.totalPendiente.toLocaleString('es-CL') || '0'}
                </Text>
              </View>
            </View>

            {datosPendientes && (
              <>
                <View style={styles.periodoContainer}>
                  <Text style={styles.periodoText}>
                    📅 {datosPendientes.periodo}
                  </Text>
                </View>

                <View style={styles.pendienteFooter}>
                  <Text style={styles.pendienteServicios}>
                    {datosPendientes.totalServicios} servicio{datosPendientes.totalServicios !== 1 ? 's' : ''} completado{datosPendientes.totalServicios !== 1 ? 's' : ''}
                  </Text>
                  {datosPendientes.totalServicios > 0 && (
                    <TouchableOpacity onPress={() => setMostrarDetalles(!mostrarDetalles)}>
                      <Text style={styles.verDetallesText}>
                        {mostrarDetalles ? 'Ocultar' : 'Ver'} detalles
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Detalles de Servicios Pendientes */}
                {mostrarDetalles && datosPendientes.servicios.length > 0 && (
                  <View style={styles.detallesContainer}>
                    {datosPendientes.servicios.map((servicio) => (
                      <View key={servicio.id} style={styles.detalleItem}>
                        <View style={styles.detalleHeader}>
                          <Text style={styles.detalleFecha}>
                            {formatearFecha(servicio.fecha)}
                          </Text>
                          <Text style={styles.detalleMonto}>
                            ${servicio.monto.toLocaleString('es-CL')}
                          </Text>
                        </View>
                        <Text style={styles.detalleCliente}>{servicio.cliente}</Text>
                        <Text style={styles.detalleRuta} numberOfLines={1}>
                          {servicio.origen.substring(0, 40)}...
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </>
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
          <View style={styles.historialHeader}>
            <Text style={styles.sectionTitle}>Historial de Pagos</Text>
            {datosHistorial && datosHistorial.totalRecibido > 0 && (
              <Text style={styles.totalRecibido}>
                Total: ${datosHistorial.totalRecibido.toLocaleString('es-CL')}
              </Text>
            )}
          </View>

          {datosHistorial && datosHistorial.pagos.length > 0 ? (
            datosHistorial.pagos.map((pago) => (
              <View key={pago.id} style={styles.pagoCard}>
                <TouchableOpacity
                  onPress={() => togglePagoExpandido(pago.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.pagoHeader}>
                    <View style={styles.pagoInfo}>
                      <Text style={styles.pagoPeriodo}>{pago.periodo}</Text>
                      <Text style={styles.pagoFechas}>
                        {formatearFecha(pago.fechaInicio)} - {formatearFecha(pago.fechaFin)}
                      </Text>
                    </View>
                    <View style={styles.estadoBadge}>
                      <Text style={styles.estadoText}>✅ Pagado</Text>
                    </View>
                  </View>

                  <View style={styles.pagoDivider} />

                  <View style={styles.pagoSummary}>
                    <View style={styles.pagoSummaryItem}>
                      <Text style={styles.pagoSummaryLabel}>Monto:</Text>
                      <Text style={styles.pagoSummaryValue}>
                        ${pago.montoTotal.toLocaleString('es-CL')}
                      </Text>
                    </View>
                    <View style={styles.pagoSummaryItem}>
                      <Text style={styles.pagoSummaryLabel}>Servicios:</Text>
                      <Text style={styles.pagoSummaryValue}>{pago.totalServicios}</Text>
                    </View>
                  </View>

                  {pago.pagadoAt && (
                    <Text style={styles.pagadoAtText}>
                      💰 Transferido el {formatearFecha(pago.pagadoAt)}
                    </Text>
                  )}

                  <View style={styles.expandButton}>
                    <Text style={styles.expandButtonText}>
                      {pagoExpandido === pago.id ? 'Ocultar detalles' : 'Ver detalles'}
                    </Text>
                    <Ionicons
                      name={pagoExpandido === pago.id ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color={colors.primary}
                    />
                  </View>
                </TouchableOpacity>

                {/* Detalles Expandibles */}
                {pagoExpandido === pago.id && (
                  <View style={styles.pagoDetallesExpandidos}>
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

                    <Text style={styles.serviciosTitle}>
                      Servicios incluidos ({pago.servicios.length}):
                    </Text>
                    {pago.servicios.map((servicio) => (
                      <View key={servicio.id} style={styles.servicioItem}>
                        <View style={styles.servicioItemHeader}>
                          <Text style={styles.servicioItemFecha}>
                            {formatearFecha(servicio.fecha)}
                          </Text>
                          <Text style={styles.servicioItemMonto}>
                            ${servicio.monto.toLocaleString('es-CL')}
                          </Text>
                        </View>
                        <Text style={styles.servicioItemCliente}>{servicio.cliente}</Text>
                        <Text style={styles.servicioItemRuta} numberOfLines={1}>
                          {servicio.origen.substring(0, 35)}...
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: spacing.md, color: colors.text.secondary },
  header: { backgroundColor: '#fff', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.secondary },
  scrollView: { flex: 1 },
  section: { padding: spacing.md },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.secondary, marginBottom: spacing.sm },
  historialHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  totalRecibido: { fontSize: 14, fontWeight: 'bold', color: colors.primary },
  pendienteCard: { backgroundColor: '#fff', borderRadius: 12, padding: spacing.lg, borderWidth: 2, borderColor: colors.primary, marginBottom: spacing.md },
  pendienteHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  pendienteInfo: { flex: 1 },
  pendienteLabel: { fontSize: 14, color: colors.text.secondary, fontWeight: '600' },
  pendienteMonto: { fontSize: 32, fontWeight: 'bold', color: colors.primary, marginTop: spacing.xs },
  periodoContainer: { marginTop: spacing.sm, padding: spacing.sm, backgroundColor: '#f0f9ff', borderRadius: 6 },
  periodoText: { fontSize: 13, color: colors.text.primary, textAlign: 'center' },
  pendienteFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md },
  pendienteServicios: { fontSize: 13, color: colors.text.secondary },
  verDetallesText: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  detallesContainer: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  detalleItem: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  detalleHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  detalleFecha: { fontSize: 12, color: colors.text.secondary },
  detalleMonto: { fontSize: 14, fontWeight: 'bold', color: colors.primary },
  detalleCliente: { fontSize: 12, fontWeight: '600', color: colors.secondary, marginBottom: 2 },
  detalleRuta: { fontSize: 12, color: colors.text.secondary },
  infoBox: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: '#f0f9ff', padding: spacing.md, borderRadius: 8 },
  infoBoxText: { flex: 1, fontSize: 13, color: colors.text.primary },
  pagoCard: { backgroundColor: '#fff', borderRadius: 12, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  pagoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  pagoInfo: { flex: 1 },
  pagoPeriodo: { fontSize: 16, fontWeight: 'bold', color: colors.secondary },
  pagoFechas: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  estadoBadge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 6, backgroundColor: '#dcfce7' },
  estadoText: { fontSize: 12, fontWeight: '600', color: '#16a34a' },
  pagoDivider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  pagoSummary: { flexDirection: 'row', gap: spacing.lg },
  pagoSummaryItem: { flex: 1 },
  pagoSummaryLabel: { fontSize: 12, color: colors.text.secondary, marginBottom: 2 },
  pagoSummaryValue: { fontSize: 16, fontWeight: 'bold', color: colors.secondary },
  pagadoAtText: { fontSize: 12, color: '#16a34a', marginTop: spacing.sm, fontWeight: '600' },
  expandButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4, marginTop: spacing.sm },
  expandButtonText: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  pagoDetallesExpandidos: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  pagoDetailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  pagoDetailLabel: { fontSize: 13, color: colors.text.secondary },
  pagoDetailValue: { fontSize: 13, fontWeight: '600', color: colors.secondary },
  serviciosTitle: { fontSize: 14, fontWeight: 'bold', color: colors.secondary, marginTop: spacing.md, marginBottom: spacing.sm },
  servicioItem: { padding: spacing.sm, backgroundColor: '#f9fafb', borderRadius: 6, marginBottom: spacing.xs },
  servicioItemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  servicioItemFecha: { fontSize: 11, color: colors.text.secondary },
  servicioItemMonto: { fontSize: 13, fontWeight: 'bold', color: colors.primary },
  servicioItemCliente: { fontSize: 12, fontWeight: '600', color: colors.secondary, marginBottom: 2 },
  servicioItemRuta: { fontSize: 11, color: colors.text.secondary },
  emptyState: { alignItems: 'center', padding: spacing.xl, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  emptyText: { fontSize: 14, color: colors.text.secondary, marginTop: spacing.sm },
});