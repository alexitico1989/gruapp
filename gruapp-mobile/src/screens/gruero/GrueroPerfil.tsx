import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { colors, spacing } from '../../theme/colors';
import Toast from 'react-native-toast-message';
import { Picker } from '@react-native-picker/picker';

const TIPOS_VEHICULOS = [
  { label: 'Automóvil', value: 'AUTOMOVIL' },
  { label: 'SUV/Camioneta', value: 'SUV_CAMIONETA' },
  { label: 'Moto', value: 'MOTO' },
  { label: 'Furgón', value: 'FURGON' },
  { label: 'Camión Liviano', value: 'CAMION_LIVIANO' },
  { label: 'Camión Mediano', value: 'CAMION_MEDIANO' },
  { label: 'Camión Pesado', value: 'CAMION_PESADO' },
  { label: 'Bus', value: 'BUS' },
  { label: 'Maquinaria', value: 'MAQUINARIA' },
];

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
    rut: string | null;
  };
}

interface Props {
  navigation: any;
}

export default function GrueroPerfil({ navigation }: Props) {
  const { user, logout } = useAuthStore();
  const [grueroData, setGrueroData] = useState<GrueroData | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados para modales
  const [modalVehiculo, setModalVehiculo] = useState(false);
  const [modalBanco, setModalBanco] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Estados para editar vehículo
  const [formVehiculo, setFormVehiculo] = useState({
    marca: '',
    modelo: '',
    anio: '',
    tipoGrua: 'CAMA_BAJA',
    capacidadToneladas: '',
    tiposVehiculosAtiende: [] as string[],
  });

  // Estados para editar banco
  const [formBanco, setFormBanco] = useState({
    banco: '',
    tipoCuenta: 'CUENTA_RUT',
    numeroCuenta: '',
    nombreTitular: '',
    rutTitular: '',
    emailTransferencia: '',
  });

  useEffect(() => {
    cargarPerfil();
  }, []);

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

  const abrirGanancias = () => {
    navigation.navigate('GrueroGanancias');
  };


  // ✅ Abrir modal de editar vehículo
  const editarVehiculo = () => {
    if (!grueroData) return;
    
    let tipos: string[] = [];
    try {
      tipos = JSON.parse(grueroData.tiposVehiculosAtiende);
    } catch (error) {
      tipos = [];
    }

    setFormVehiculo({
      marca: grueroData.marca,
      modelo: grueroData.modelo,
      anio: grueroData.anio.toString(),
      tipoGrua: grueroData.tipoGrua,
      capacidadToneladas: grueroData.capacidadToneladas.toString(),
      tiposVehiculosAtiende: tipos,
    });
    setModalVehiculo(true);
  };

  // ✅ Abrir modal de editar cuenta bancaria
  const editarCuentaBancaria = () => {
    if (!grueroData) return;

    setFormBanco({
      banco: grueroData.banco || '',
      tipoCuenta: grueroData.tipoCuenta || 'CUENTA_RUT',
      numeroCuenta: grueroData.numeroCuenta || '',
      nombreTitular: grueroData.nombreTitular || '',
      rutTitular: grueroData.rutTitular || '',
      emailTransferencia: grueroData.emailTransferencia || '',
    });
    setModalBanco(true);
  };

  // ✅ Toggle tipo de vehículo
  const toggleTipoVehiculo = (tipo: string) => {
    const current = formVehiculo.tiposVehiculosAtiende;
    if (current.includes(tipo)) {
      setFormVehiculo({
        ...formVehiculo,
        tiposVehiculosAtiende: current.filter((t) => t !== tipo),
      });
    } else {
      setFormVehiculo({
        ...formVehiculo,
        tiposVehiculosAtiende: [...current, tipo],
      });
    }
  };

  // ✅ Guardar cambios de vehículo
  const guardarVehiculo = async () => {
    if (!formVehiculo.marca.trim() || !formVehiculo.modelo.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Marca y modelo son requeridos',
        position: 'top',
      });
      return;
    }

    if (formVehiculo.tiposVehiculosAtiende.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Selecciona al menos un tipo de vehículo',
        position: 'top',
      });
      return;
    }

    try {
      setGuardando(true);
      const response = await api.put('/gruero/perfil/vehiculo', {
        marca: formVehiculo.marca.trim(),
        modelo: formVehiculo.modelo.trim(),
        anio: parseInt(formVehiculo.anio),
        tipoGrua: formVehiculo.tipoGrua,
        capacidadToneladas: parseFloat(formVehiculo.capacidadToneladas),
        tiposVehiculosAtiende: formVehiculo.tiposVehiculosAtiende,
      });

      if (response.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Éxito',
          text2: 'Datos del vehículo actualizados',
          position: 'top',
        });
        setModalVehiculo(false);
        cargarPerfil();
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'No se pudo actualizar',
        position: 'top',
      });
    } finally {
      setGuardando(false);
    }
  };

  // ✅ Guardar cambios de cuenta bancaria
  const guardarCuentaBancaria = async () => {
    if (!formBanco.banco.trim() || !formBanco.numeroCuenta.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Banco y número de cuenta son requeridos',
        position: 'top',
      });
      return;
    }

    try {
      setGuardando(true);
      const response = await api.put('/gruero/perfil/banco', {
        banco: formBanco.banco.trim(),
        tipoCuenta: formBanco.tipoCuenta,
        numeroCuenta: formBanco.numeroCuenta.trim(),
        nombreTitular: formBanco.nombreTitular.trim(),
        rutTitular: formBanco.rutTitular.trim(),
        emailTransferencia: formBanco.emailTransferencia.trim() || null,
      });

      if (response.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Éxito',
          text2: 'Datos bancarios actualizados',
          position: 'top',
        });
        setModalBanco(false);
        cargarPerfil();
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'No se pudo actualizar',
        position: 'top',
      });
    } finally {
      setGuardando(false);
    }
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
        {/* Accesos Rápidos */}
        <View style={styles.section}>
          <View style={styles.quickAccessContainer}>
            <TouchableOpacity style={styles.quickAccessCard} onPress={abrirGanancias}>
              <View style={[styles.quickAccessIcon, { backgroundColor: '#dcfce7' }]}>
                <Ionicons name="trending-up" size={28} color="#16a34a" />
              </View>
              <Text style={styles.quickAccessLabel}>Mis Ganancias</Text>
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

        {/* Cuenta Bancaria */}
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

      {/* ✅ MODAL: Editar Vehículo */}
      <Modal
        visible={modalVehiculo}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVehiculo(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Vehículo</Text>
              <TouchableOpacity onPress={() => setModalVehiculo(false)}>
                <Ionicons name="close" size={24} color={colors.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Marca</Text>
                <TextInput
                  style={styles.input}
                  value={formVehiculo.marca}
                  onChangeText={(value) => setFormVehiculo({ ...formVehiculo, marca: value })}
                  placeholder="Chevrolet"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Modelo</Text>
                <TextInput
                  style={styles.input}
                  value={formVehiculo.modelo}
                  onChangeText={(value) => setFormVehiculo({ ...formVehiculo, modelo: value })}
                  placeholder="NPR"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Año</Text>
                <TextInput
                  style={styles.input}
                  value={formVehiculo.anio}
                  onChangeText={(value) => setFormVehiculo({ ...formVehiculo, anio: value })}
                  placeholder="2020"
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Capacidad (Toneladas)</Text>
                <TextInput
                  style={styles.input}
                  value={formVehiculo.capacidadToneladas}
                  onChangeText={(value) => setFormVehiculo({ ...formVehiculo, capacidadToneladas: value })}
                  placeholder="3.5"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tipo de Grúa</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formVehiculo.tipoGrua}
                    onValueChange={(value) => setFormVehiculo({ ...formVehiculo, tipoGrua: value })}
                  >
                    <Picker.Item label="Cama Baja" value="CAMA_BAJA" />
                    <Picker.Item label="Horquilla" value="HORQUILLA" />
                    <Picker.Item label="Pluma" value="PLUMA" />
                  </Picker>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tipos de Vehículos que Atiende</Text>
                <View style={styles.checkboxContainer}>
                  {TIPOS_VEHICULOS.map((tipo) => (
                    <TouchableOpacity
                      key={tipo.value}
                      style={styles.checkboxItem}
                      onPress={() => toggleTipoVehiculo(tipo.value)}
                    >
                      <Ionicons
                        name={
                          formVehiculo.tiposVehiculosAtiende.includes(tipo.value)
                            ? 'checkbox'
                            : 'square-outline'
                        }
                        size={24}
                        color={
                          formVehiculo.tiposVehiculosAtiende.includes(tipo.value)
                            ? colors.primary
                            : colors.text.secondary
                        }
                      />
                      <Text style={styles.checkboxLabel}>{tipo.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setModalVehiculo(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={guardarVehiculo}
                disabled={guardando}
              >
                {guardando ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalButtonTextSave}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ✅ MODAL: Editar Cuenta Bancaria */}
      <Modal
        visible={modalBanco}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalBanco(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Cuenta Bancaria</Text>
              <TouchableOpacity onPress={() => setModalBanco(false)}>
                <Ionicons name="close" size={24} color={colors.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Banco</Text>
                <TextInput
                  style={styles.input}
                  value={formBanco.banco}
                  onChangeText={(value) => setFormBanco({ ...formBanco, banco: value })}
                  placeholder="Banco Estado"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tipo de Cuenta</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formBanco.tipoCuenta}
                    onValueChange={(value) => setFormBanco({ ...formBanco, tipoCuenta: value })}
                  >
                    <Picker.Item label="Cuenta RUT" value="CUENTA_RUT" />
                    <Picker.Item label="Cuenta Vista" value="VISTA" />
                    <Picker.Item label="Cuenta Corriente" value="CORRIENTE" />
                  </Picker>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Número de Cuenta</Text>
                <TextInput
                  style={styles.input}
                  value={formBanco.numeroCuenta}
                  onChangeText={(value) => setFormBanco({ ...formBanco, numeroCuenta: value })}
                  placeholder="123456789"
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nombre del Titular</Text>
                <TextInput
                  style={styles.input}
                  value={formBanco.nombreTitular}
                  onChangeText={(value) => setFormBanco({ ...formBanco, nombreTitular: value })}
                  placeholder="Juan Pérez"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>RUT del Titular</Text>
                <TextInput
                  style={styles.input}
                  value={formBanco.rutTitular}
                  onChangeText={(value) => setFormBanco({ ...formBanco, rutTitular: value })}
                  placeholder="12345678-9"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email para Transferencias (opcional)</Text>
                <TextInput
                  style={styles.input}
                  value={formBanco.emailTransferencia}
                  onChangeText={(value) => setFormBanco({ ...formBanco, emailTransferencia: value })}
                  placeholder="tu@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setModalBanco(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={guardarCuentaBancaria}
                disabled={guardando}
              >
                {guardando ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalButtonTextSave}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
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
  // ✅ ESTILOS DE MODALES
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  modalScroll: {
    padding: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    fontSize: 16,
    color: colors.secondary,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  checkboxContainer: {
    gap: spacing.sm,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  checkboxLabel: {
    fontSize: 16,
    color: colors.secondary,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modalButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalButtonSave: {
    backgroundColor: colors.primary,
  },
  modalButtonTextCancel: {
    color: colors.secondary,
    fontWeight: '600',
    fontSize: 16,
  },
  modalButtonTextSave: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});