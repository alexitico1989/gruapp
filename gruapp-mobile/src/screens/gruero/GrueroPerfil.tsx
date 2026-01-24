import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { colors, spacing } from '../../theme/colors';
import Toast from 'react-native-toast-message';

interface GrueroData {
  patente: string;
  marca: string;
  modelo: string;
  anio: number;
  tipoGrua: string;
  capacidadToneladas: number;
  tiposVehiculosAtiende: string;
  totalServicios: number;
  calificacionPromedio: number;
  verificado: boolean;
  estadoVerificacion: string;
  // ✅ NUEVOS CAMPOS
  banco: string | null;
  tipoCuenta: string | null;
  numeroCuenta: string | null;
  nombreTitular: string | null;
  rutTitular: string | null;
  emailTransferencia: string | null;
  user: {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    rut: string | null; // ✅ NUEVO
  };
}

interface Props {
  navigation: any;
}

export default function GrueroPerfil({ navigation }: Props) {
  const { user, logout } = useAuthStore();
  const [grueroData, setGrueroData] = useState<GrueroData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarPerfil();
  }, []);

  // ✅ Recargar perfil cuando la pantalla recibe foco
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      cargarPerfil();
    });
    return unsubscribe;
  }, [navigation]);

  const cargarPerfil = async () => {
    try {
      const response = await api.get('/gruero/perfil');
      if (response.data.success) {
        setGrueroData(response.data.data);
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo cargar el perfil',
        position: 'top',
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Toast.show({
      type: 'error',
      text1: '¿Cerrar Sesión?',
      text2: 'Presiona para confirmar',
      position: 'top',
      visibilityTime: 3000,
      onPress: () => logout(),
    });
  };

  const getTipoGruaNombre = (tipo: string) => {
    const tipos: Record<string, string> = {
      CAMA_BAJA: 'Cama Baja',
      PLATAFORMA: 'Plataforma',
      GRUA_HORQUILLA: 'Grúa Horquilla',
      GRUA_BRAZO: 'Grúa Brazo',
    };
    return tipos[tipo] || tipo;
  };

  // ✅ NUEVA: Navegar a pantalla de ganancias
  const abrirGanancias = () => {
    navigation.navigate('GrueroGanancias');
  };

  // ✅ NUEVA: Navegar a pantalla de pagos
  const abrirPagos = () => {
    navigation.navigate('GrueroPagosPendientes');
  };

  // ✅ NUEVA: Editar datos del vehículo
  const editarVehiculo = () => {
    Toast.show({
      type: 'info',
      text1: 'Editar Vehículo',
      text2: 'Función disponible próximamente',
      position: 'top',
      visibilityTime: 2000,
    });
    // TODO: Abrir modal de edición
  };

  // ✅ NUEVA: Editar cuenta bancaria
  const editarCuentaBancaria = () => {
    Toast.show({
      type: 'info',
      text1: 'Editar Cuenta Bancaria',
      text2: 'Función disponible próximamente',
      position: 'top',
      visibilityTime: 2000,
    });
    // TODO: Abrir modal de edición
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!grueroData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorText}>Error al cargar el perfil</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Mi Perfil</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* ✅ NUEVO: Accesos Rápidos */}
        <View style={styles.section}>
          <View style={styles.quickAccessContainer}>
            <TouchableOpacity style={styles.quickAccessCard} onPress={abrirGanancias}>
              <View style={[styles.quickAccessIcon, { backgroundColor: '#dcfce7' }]}>
                <Ionicons name="cash" size={28} color="#16a34a" />
              </View>
              <Text style={styles.quickAccessLabel}>Mis Ganancias</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAccessCard} onPress={abrirPagos}>
              <View style={[styles.quickAccessIcon, { backgroundColor: '#dbeafe' }]}>
                <Ionicons name="wallet" size={28} color="#2563eb" />
              </View>
              <Text style={styles.quickAccessLabel}>Pagos</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Información Personal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Personal</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={20} color={colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Nombre</Text>
                <Text style={styles.infoValue}>
                  {grueroData.user.nombre} {grueroData.user.apellido}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color={colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{grueroData.user.email}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color={colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Teléfono</Text>
                <Text style={styles.infoValue}>{grueroData.user.telefono}</Text>
              </View>
            </View>

            {/* ✅ NUEVO: RUT */}
            {grueroData.user.rut && (
              <View style={styles.infoRow}>
                <Ionicons name="card-outline" size={20} color={colors.primary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>RUT</Text>
                  <Text style={styles.infoValue}>{grueroData.user.rut}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* ✅ NUEVO: Cuenta Bancaria */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cuenta Bancaria</Text>
            <TouchableOpacity onPress={editarCuentaBancaria}>
              <Ionicons name="create-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.infoCard}>
            {grueroData.banco ? (
              <>
                <View style={styles.infoRow}>
                  <Ionicons name="business-outline" size={20} color={colors.primary} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Banco</Text>
                    <Text style={styles.infoValue}>{grueroData.banco}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="card-outline" size={20} color={colors.primary} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Tipo de Cuenta</Text>
                    <Text style={styles.infoValue}>
                      {grueroData.tipoCuenta === 'CUENTA_RUT' ? 'Cuenta RUT' : 
                       grueroData.tipoCuenta === 'VISTA' ? 'Cuenta Vista' :
                       grueroData.tipoCuenta === 'CORRIENTE' ? 'Cuenta Corriente' :
                       grueroData.tipoCuenta}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="keypad-outline" size={20} color={colors.primary} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Número de Cuenta</Text>
                    <Text style={styles.infoValue}>{grueroData.numeroCuenta}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="person-outline" size={20} color={colors.primary} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Titular</Text>
                    <Text style={styles.infoValue}>{grueroData.nombreTitular}</Text>
                  </View>
                </View>

                {grueroData.emailTransferencia && (
                  <View style={styles.infoRow}>
                    <Ionicons name="mail-outline" size={20} color={colors.primary} />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Email para Transferencias</Text>
                      <Text style={styles.infoValue}>{grueroData.emailTransferencia}</Text>
                    </View>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="card-outline" size={48} color={colors.text.secondary} />
                <Text style={styles.emptyStateText}>No has configurado tu cuenta bancaria</Text>
                <TouchableOpacity style={styles.emptyStateButton} onPress={editarCuentaBancaria}>
                  <Text style={styles.emptyStateButtonText}>Configurar Ahora</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Información del Vehículo */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Vehículo</Text>
            <TouchableOpacity onPress={editarVehiculo}>
              <Ionicons name="create-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="car-outline" size={20} color={colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Patente</Text>
                <Text style={styles.infoValue}>{grueroData.patente}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="construct-outline" size={20} color={colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Marca y Modelo</Text>
                <Text style={styles.infoValue}>
                  {grueroData.marca} {grueroData.modelo} ({grueroData.anio})
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="hardware-chip-outline" size={20} color={colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Tipo de Grúa</Text>
                <Text style={styles.infoValue}>
                  {getTipoGruaNombre(grueroData.tipoGrua)}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="speedometer-outline" size={20} color={colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Capacidad</Text>
                <Text style={styles.infoValue}>
                  {grueroData.capacidadToneladas} toneladas
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="list-outline" size={20} color={colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Tipos de Vehículos que Atiende</Text>
                <View style={styles.tagsContainer}>
                  {(() => {
                    try {
                      const tipos = JSON.parse(grueroData.tiposVehiculosAtiende);
                      return tipos.map((tipo: string, index: number) => (
                        <View key={index} style={styles.tag}>
                          <Text style={styles.tagText}>{tipo}</Text>
                        </View>
                      ));
                    } catch (error) {
                      return <Text style={styles.infoValue}>No disponible</Text>;
                    }
                  })()}
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Estadísticas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estadísticas</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={32} color="#10b981" />
              <Text style={styles.statValue}>{grueroData.totalServicios}</Text>
              <Text style={styles.statLabel}>Servicios</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="star" size={32} color="#fbbf24" />
              <Text style={styles.statValue}>
                {grueroData.calificacionPromedio.toFixed(1)}
              </Text>
              <Text style={styles.statLabel}>Calificación</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons
                name={grueroData.verificado ? 'shield-checkmark' : 'shield-outline'}
                size={32}
                color={grueroData.verificado ? '#10b981' : '#6b7280'}
              />
              <Text style={styles.statValue}>
                {grueroData.verificado ? 'Sí' : 'No'}
              </Text>
              <Text style={styles.statLabel}>Verificado</Text>
            </View>
          </View>
        </View>

        {/* Estado de Verificación */}
        {!grueroData.verificado && (
          <View style={styles.section}>
            <View
              style={[
                styles.verificacionBanner,
                {
                  backgroundColor:
                    grueroData.estadoVerificacion === 'PENDIENTE'
                      ? '#fef3c7'
                      : '#fee2e2',
                },
              ]}
            >
              <Ionicons
                name={
                  grueroData.estadoVerificacion === 'PENDIENTE'
                    ? 'time-outline'
                    : 'close-circle-outline'
                }
                size={24}
                color={
                  grueroData.estadoVerificacion === 'PENDIENTE'
                    ? '#d97706'
                    : '#dc2626'
                }
              />
              <View style={styles.verificacionTexto}>
                <Text style={styles.verificacionTitle}>
                  {grueroData.estadoVerificacion === 'PENDIENTE'
                    ? 'Verificación Pendiente'
                    : 'Verificación Rechazada'}
                </Text>
                <Text style={styles.verificacionDesc}>
                  {grueroData.estadoVerificacion === 'PENDIENTE'
                    ? 'Tu cuenta está en proceso de verificación'
                    : 'Contacta al administrador para más información'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Botón de Cerrar Sesión */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    marginTop: spacing.md,
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
  scrollView: {
    flex: 1,
  },
  section: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.secondary,
    marginBottom: spacing.sm,
  },
  // ✅ NUEVO: Header de sección con botón de editar
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  // ✅ NUEVO: Accesos rápidos
  quickAccessContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickAccessCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickAccessIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quickAccessLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: colors.secondary,
    fontWeight: '500',
  },
  // ✅ NUEVO: Estado vacío
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  emptyStateButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  tag: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    color: '#0369a1',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.secondary,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
  },
  verificacionBanner: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
    alignItems: 'center',
  },
  verificacionTexto: {
    flex: 1,
  },
  verificacionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.secondary,
    marginBottom: 4,
  },
  verificacionDesc: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  logoutButton: {
    backgroundColor: colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});