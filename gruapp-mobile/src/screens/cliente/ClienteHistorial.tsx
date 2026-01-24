import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { colors, spacing } from '../../theme/colors';
import Toast from 'react-native-toast-message';
import CrearReclamoModal from '../../components/CrearReclamoModal';

interface Servicio {
  id: string;
  origenDireccion: string;
  destinoDireccion: string;
  distanciaKm: number;
  totalCliente: number;
  status: string;
  pagado: boolean;
  solicitadoAt: string;
  completadoAt?: string;
  canceladoAt?: string;
  tipoVehiculo: string;
  gruero?: {
    user: {
      nombre: string;
      apellido: string;
    };
    patente: string;
  };
  calificacion?: {
    puntuacionGruero: number;
    comentarioGruero?: string;
  };
}

export default function ClienteHistorial() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagandoId, setPagandoId] = useState<string | null>(null);
  
  // ✅ NUEVO: Estado para el modal de reclamos
  const [modalReclamoVisible, setModalReclamoVisible] = useState(false);
  const [servicioParaReclamar, setServicioParaReclamar] = useState<string | null>(null);

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      const response = await api.get('/servicios/historial');
      if (response.data.success) {
        setServicios(response.data.data);
      }
    } catch (error) {
      console.error('Error cargando historial:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    cargarHistorial();
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const abrirCalificacion = (servicio: Servicio) => {
    // TODO: Implementar modal de calificación
    Toast.show({
      type: 'info',
      text1: 'Calificar Servicio',
      text2: `Califica el servicio de ${servicio.gruero?.user.nombre || 'este gruero'}`,
      position: 'top',
      visibilityTime: 3000,
    });
  };

  // ✅ NUEVA FUNCIÓN: Abrir modal de reclamo
  const abrirReclamo = (servicioId: string) => {
    setServicioParaReclamar(servicioId);
    setModalReclamoVisible(true);
  };

  const handlePagar = async (servicio: Servicio) => {
    console.log('💳 Iniciando pago para servicio:', servicio.id);
    
    try {
      setPagandoId(servicio.id);
      console.log('📤 Llamando a /pagos/crear-preferencia...');
      
      const response = await api.post(`/pagos/crear-preferencia`, {
        servicioId: servicio.id,
      });

      console.log('📦 Respuesta del backend:', response.data);

      const initPoint = response.data.data.initPoint || response.data.data.init_point;

      if (response.data.success && initPoint) {
        const url = initPoint;
        
        console.log('🔗 URL de Mercado Pago:', url);
        
        const supported = await Linking.canOpenURL(url);
        console.log('🌐 ¿Puede abrir URL?:', supported);
        
        if (supported) {
          await Linking.openURL(url);
          Toast.show({
            type: 'info',
            text1: 'Redirigiendo a Mercado Pago',
            text2: 'Completa el pago y vuelve a la app. Luego actualiza el historial.',
            position: 'top',
            visibilityTime: 5000,
          });
          
          // Recargar historial después de 2 segundos
          setTimeout(() => cargarHistorial(), 2000);
        } else {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'No se pudo abrir Mercado Pago',
            position: 'top',
            visibilityTime: 3000,
          });
        }
      } else {
        console.log('⚠️ Respuesta sin init_point:', response.data);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'No se recibió el enlace de pago',
          position: 'top',
          visibilityTime: 3000,
        });
      }
    } catch (error: any) {
      console.error('❌ Error creando pago:', error);
      console.error('📄 Respuesta del error:', error.response?.data);
      Toast.show({
        type: 'error',
        text1: 'Error al procesar pago',
        text2: error.response?.data?.message || 'No se pudo procesar el pago',
        position: 'top',
        visibilityTime: 4000,
      });
    } finally {
      setPagandoId(null);
    }
  };

  const renderServicio = ({ item }: { item: Servicio }) => {
    const esCompletado = item.status === 'COMPLETADO';
    const esCancelado = item.status === 'CANCELADO';
    const estaPagando = pagandoId === item.id;

    // Determinar el badge correcto
    let badgeColor = '#f3f4f6';
    let badgeTextColor = '#6b7280';
    let badgeText = item.status;

    if (esCompletado && item.pagado) {
      badgeColor = '#dcfce7';
      badgeTextColor = '#16a34a';
      badgeText = 'Pagado';
    } else if (esCompletado && !item.pagado) {
      badgeColor = '#fef3c7';
      badgeTextColor = '#ca8a04';
      badgeText = 'Pendiente de Pago';
    } else if (esCancelado) {
      badgeColor = '#fee2e2';
      badgeTextColor = '#dc2626';
      badgeText = 'Cancelado';
    }

    return (
      <View style={styles.servicioCard}>
        <View style={styles.servicioHeaderContainer}>
          {/* ✅ NUEVO: ID del servicio */}
          <Text style={styles.servicioId}>Servicio #{item.id.substring(0, 8).toUpperCase()}</Text>
          
          <View style={styles.servicioHeader}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: badgeColor },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: badgeTextColor },
                ]}
              >
                {badgeText}
              </Text>
            </View>
            <Text style={styles.fecha}>
              {formatearFecha(item.completadoAt || item.canceladoAt || item.solicitadoAt)}
            </Text>
          </View>
        </View>

        {item.gruero && (
          <View style={styles.grueroInfo}>
            <Ionicons name="person-outline" size={16} color={colors.text.secondary} />
            <Text style={styles.grueroNombre}>
              {item.gruero.user.nombre} {item.gruero.user.apellido}
            </Text>
            <Text style={styles.patente}>• {item.gruero.patente}</Text>
          </View>
        )}

        <View style={styles.ubicacionContainer}>
          <View style={styles.ubicacionItem}>
            <Ionicons name="location" size={16} color="#10b981" />
            <Text style={styles.ubicacionTexto} numberOfLines={1}>
              {item.origenDireccion}
            </Text>
          </View>
          <View style={styles.ubicacionItem}>
            <Ionicons name="navigate" size={16} color={colors.primary} />
            <Text style={styles.ubicacionTexto} numberOfLines={1}>
              {item.destinoDireccion}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.detalles}>
            <View style={styles.detailItem}>
              <Ionicons name="car-outline" size={16} color={colors.text.secondary} />
              <Text style={styles.detailText}>{item.tipoVehiculo}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="resize-outline" size={16} color={colors.text.secondary} />
              <Text style={styles.detailText}>{item.distanciaKm.toFixed(1)} km</Text>
            </View>
          </View>

          {esCompletado && (
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>
                {item.pagado ? 'Total pagado:' : 'Total a pagar:'}
              </Text>
              <Text style={styles.totalValue}>
                ${item.totalCliente.toLocaleString('es-CL')}
              </Text>
            </View>
          )}
        </View>

        {/* Botón de pago: Solo si está completado y NO pagado */}
        {esCompletado && !item.pagado && (
          <TouchableOpacity
            style={[styles.pagarButton, estaPagando && styles.buttonDisabled]}
            onPress={() => handlePagar(item)}
            disabled={estaPagando}
          >
            {estaPagando ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="card-outline" size={18} color="#fff" />
                <Text style={styles.pagarButtonText}>Pagar Servicio</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Botón de calificar: Solo si está completado, pagado y sin calificación */}
        {esCompletado && item.pagado && !item.calificacion && (
          <TouchableOpacity
            style={styles.calificarButton}
            onPress={() => abrirCalificacion(item)}
          >
            <Ionicons name="star-outline" size={18} color={colors.primary} />
            <Text style={styles.calificarButtonText}>Calificar servicio</Text>
          </TouchableOpacity>
        )}

        {/* ✅ NUEVO: Botón de Reportar Problema - Para servicios completados o cancelados */}
        {(esCompletado || esCancelado) && (
          <TouchableOpacity
            style={styles.reportarButton}
            onPress={() => abrirReclamo(item.id)}
          >
            <Ionicons name="megaphone-outline" size={18} color="#dc2626" />
            <Text style={styles.reportarButtonText}>Reportar Problema</Text>
          </TouchableOpacity>
        )}

        {item.calificacion && (
          <View style={styles.calificacionContainer}>
            <Text style={styles.calificacionLabel}>Tu calificación:</Text>
            <View style={styles.estrellas}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= item.calificacion!.puntuacionGruero ? 'star' : 'star-outline'}
                  size={16}
                  color="#fbbf24"
                />
              ))}
            </View>
            {item.calificacion.comentarioGruero && (
              <Text style={styles.comentario}>"{item.calificacion.comentarioGruero}"</Text>
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando historial...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Historial de Servicios</Text>
      </View>

      {servicios.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color={colors.text.secondary} />
          <Text style={styles.emptyTitle}>Sin historial</Text>
          <Text style={styles.emptyText}>
            Tus servicios solicitados aparecerán aquí
          </Text>
        </View>
      ) : (
        <FlatList
          data={servicios}
          renderItem={renderServicio}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* ✅ NUEVO: Modal de Crear Reclamo */}
      <CrearReclamoModal
        visible={modalReclamoVisible}
        servicioId={servicioParaReclamar || undefined}
        onClose={() => {
          setModalReclamoVisible(false);
          setServicioParaReclamar(null);
        }}
        onSuccess={() => {
          setModalReclamoVisible(false);
          setServicioParaReclamar(null);
          Toast.show({
            type: 'success',
            text1: '✅ Reclamo Enviado',
            text2: 'Puedes ver tus reclamos desde el perfil',
            position: 'top',
            visibilityTime: 3000,
          });
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.text.secondary,
  },
  header: {
    backgroundColor: '#fff',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  listContainer: {
    padding: spacing.md,
  },
  servicioCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  servicioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  fecha: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  grueroInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  grueroNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary,
  },
  patente: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  ubicacionContainer: {
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  ubicacionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ubicacionTexto: {
    flex: 1,
    fontSize: 13,
    color: colors.text.secondary,
  },
  footer: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detalles: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  pagarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  pagarButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  calificarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
  },
  calificarButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  // ✅ NUEVO: Estilos para el botón de reportar
  reportarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  reportarButtonText: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '600',
  },
  calificacionContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  calificacionLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  estrellas: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: spacing.xs,
  },
  comentario: {
    fontSize: 12,
    color: colors.text.secondary,
    fontStyle: 'italic',
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

  servicioHeaderContainer: {
  marginBottom: spacing.sm,
},
servicioId: {
  fontSize: 13,
  fontWeight: '700',
  color: colors.primary,
  marginBottom: spacing.xs,
},
servicioHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},
});