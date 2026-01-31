import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { GeocodingService, GeocodeResult } from '../services/geocoding.service';
import { colors, spacing } from '../theme/colors';
import Toast from 'react-native-toast-message';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelectDestinationOnMap: () => void;
  ubicacionActual: { latitude: number; longitude: number } | null;
  destinoSeleccionadoMapa?: { // ✅ NUEVA PROP
    latitude: number;
    longitude: number;
    direccion: string;
  } | null;
  onSuccess?: () => void;
}

// ✅ TIPOS DE VEHÍCULOS COMPLETOS (igual que en la web)
const TIPOS_VEHICULO = [
  // Vehículos Livianos
  { value: 'AUTOMOVIL', label: 'Automóvil', pesado: false },
  { value: 'SUV_CAMIONETA', label: 'SUV / Camioneta', pesado: false },
  { value: 'MOTO', label: 'Moto', pesado: false },
  { value: 'FURGON', label: 'Furgón', pesado: false },
  { value: 'CAMION_LIVIANO', label: 'Camión Liviano', pesado: false },
  // Vehículos Pesados
  { value: 'CAMION_MEDIANO', label: 'Camión Mediano', pesado: true },
  { value: 'CAMION_PESADO', label: 'Camión Pesado', pesado: true },
  { value: 'BUS', label: 'Bus', pesado: true },
  { value: 'MAQUINARIA', label: 'Maquinaria', pesado: true },
];

export default function SolicitarServicioModal({
  visible,
  onClose,
  onSelectDestinationOnMap,
  ubicacionActual,
  destinoSeleccionadoMapa, // ✅ NUEVA PROP
  onSuccess,
}: Props) {
  const [origenDireccion, setOrigenDireccion] = useState('');
  const [destinoDireccion, setDestinoDireccion] = useState('');
  const [destinoCoords, setDestinoCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [tipoVehiculo, setTipoVehiculo] = useState('AUTOMOVIL');
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingOrigen, setLoadingOrigen] = useState(false);
  const [busquedaDestino, setBusquedaDestino] = useState('');
  const [sugerencias, setSugerencias] = useState<GeocodeResult[]>([]);
  const [buscandoSugerencias, setBuscandoSugerencias] = useState(false);
  
  // ✅ Estado para precio estimado y distancia
  const [precioEstimado, setPrecioEstimado] = useState(0);
  const [distanciaKm, setDistanciaKm] = useState(0);

  // Cargar dirección de origen cuando se abre el modal
  useEffect(() => {
    if (visible && ubicacionActual && !origenDireccion) {
      cargarDireccionOrigen();
    }
  }, [visible, ubicacionActual]);

  // ✅ NUEVO: Cargar destino del mapa cuando esté disponible
  useEffect(() => {
    if (visible && destinoSeleccionadoMapa) {
      console.log('📍 Destino del mapa recibido:', destinoSeleccionadoMapa);
      setDestinoDireccion(destinoSeleccionadoMapa.direccion);
      setBusquedaDestino(destinoSeleccionadoMapa.direccion);
      setDestinoCoords({
        latitude: destinoSeleccionadoMapa.latitude,
        longitude: destinoSeleccionadoMapa.longitude,
      });
      setSugerencias([]); // Limpiar sugerencias
    }
  }, [visible, destinoSeleccionadoMapa]);

  // Buscar sugerencias de destino
  useEffect(() => {
    if (busquedaDestino.length >= 3 && !destinoCoords) {
      const timer = setTimeout(() => {
        buscarSugerencias();
      }, 500);

      return () => clearTimeout(timer);
    } else if (busquedaDestino.length < 3) {
      setSugerencias([]);
    }
  }, [busquedaDestino]);

  // ✅ Calcular precio cuando cambia origen, destino o tipo de vehículo
  useEffect(() => {
    if (ubicacionActual && destinoCoords) {
      calcularDistanciaYPrecio();
    }
  }, [ubicacionActual, destinoCoords, tipoVehiculo]);

  const cargarDireccionOrigen = async () => {
    if (!ubicacionActual) return;

    try {
      setLoadingOrigen(true);
      const direccion = await GeocodingService.reverseGeocode(
        ubicacionActual.latitude,
        ubicacionActual.longitude
      );
      setOrigenDireccion(direccion);
    } catch (error) {
      console.error('Error obteniendo dirección:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo obtener la dirección de origen',
        position: 'top',
        visibilityTime: 3000,
      });
    } finally {
      setLoadingOrigen(false);
    }
  };

  const buscarSugerencias = async () => {
    try {
      setBuscandoSugerencias(true);
      const resultados = await GeocodingService.searchAddress(busquedaDestino);
      setSugerencias(resultados);
    } catch (error) {
      console.error('Error buscando sugerencias:', error);
    } finally {
      setBuscandoSugerencias(false);
    }
  };

  const seleccionarSugerencia = (resultado: GeocodeResult) => {
    const direccion = GeocodingService.formatAddress(resultado);
    console.log('✅ Dirección seleccionada:', direccion);
    
    setDestinoDireccion(direccion);
    setBusquedaDestino(direccion);
    
    setDestinoCoords({
      latitude: parseFloat(resultado.lat),
      longitude: parseFloat(resultado.lon),
    });
    
    setSugerencias([]);
  };

  const calcularDistanciaYPrecio = () => {
    if (!ubicacionActual || !destinoCoords) return;

    // Fórmula de Haversine para calcular distancia
    const R = 6371; // Radio de la Tierra en km
    const dLat = ((destinoCoords.latitude - ubicacionActual.latitude) * Math.PI) / 180;
    const dLon = ((destinoCoords.longitude - ubicacionActual.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((ubicacionActual.latitude * Math.PI) / 180) *
        Math.cos((destinoCoords.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distancia = R * c * 1.3; // Factor 1.3 para compensar rutas no directas

    setDistanciaKm(Math.round(distancia * 10) / 10);

    // Calcular precio según tipo de vehículo
    const vehiculoSeleccionado = TIPOS_VEHICULO.find(v => v.value === tipoVehiculo);
    const esPesado = vehiculoSeleccionado?.pesado || false;

    const tarifaBase = esPesado ? 80000 : 25000;
    const tarifaPorKm = esPesado ? 1850 : 1350;

    const total = tarifaBase + (distancia * tarifaPorKm);
    setPrecioEstimado(Math.round(total));
  };

  const handleSolicitar = async () => {
    // ✅ Validaciones con Toast
    if (!origenDireccion.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Campo requerido',
        text2: 'Ingresa la dirección de origen',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }
    if (!destinoDireccion.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Campo requerido',
        text2: 'Ingresa la dirección de destino',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }
    if (!ubicacionActual) {
      Toast.show({
        type: 'error',
        text1: 'Error de ubicación',
        text2: 'No se pudo obtener tu ubicación',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }
    if (!destinoCoords) {
      Toast.show({
        type: 'error',
        text1: 'Destino inválido',
        text2: 'Selecciona una dirección de destino válida',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    try {
      setLoading(true);

      const data = {
        origenLat: ubicacionActual.latitude,
        origenLng: ubicacionActual.longitude,
        origenDireccion,
        destinoLat: destinoCoords.latitude,
        destinoLng: destinoCoords.longitude,
        destinoDireccion,
        tipoVehiculo,
        observaciones,
      };

      const response = await api.post('/servicios/solicitar', data);

      if (response.data.success) {
        Toast.show({
          type: 'success',
          text1: '✅ Solicitud Enviada',
          text2: `Se notificó a ${response.data.data.gruerosCercanos} grueros cercanos`,
          position: 'top',
          visibilityTime: 4000,
        });
        
        // Limpiar formulario
        setOrigenDireccion('');
        setDestinoDireccion('');
        setBusquedaDestino('');
        setDestinoCoords(null);
        setObservaciones('');
        setTipoVehiculo('AUTOMOVIL');
        setSugerencias([]);
        setPrecioEstimado(0);
        setDistanciaKm(0);
        
        if (onSuccess) {
          onSuccess();
        }
        
        onClose();
      }
    } catch (error: any) {
      console.error('Error solicitando servicio:', error);
      Toast.show({
        type: 'error',
        text1: 'Error al solicitar',
        text2: error.response?.data?.message || 'No se pudo solicitar el servicio',
        position: 'top',
        visibilityTime: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSugerencias([]);
    onClose();
  };

  const vehiculoSeleccionado = TIPOS_VEHICULO.find(v => v.value === tipoVehiculo);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Solicitar Servicio</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={28} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
            {/* Dirección de Origen */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Dirección de Origen</Text>
                {loadingOrigen && (
                  <ActivityIndicator size="small" color={colors.primary} />
                )}
              </View>
              <View style={styles.inputWithIcon}>
                <Ionicons
                  name="location"
                  size={20}
                  color="#10b981"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Tu ubicación actual"
                  value={origenDireccion}
                  onChangeText={setOrigenDireccion}
                  editable={!loadingOrigen}
                />
                {origenDireccion && (
                  <TouchableOpacity
                    onPress={cargarDireccionOrigen}
                    style={styles.refreshButton}
                  >
                    <Ionicons name="refresh" size={20} color={colors.primary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Dirección de Destino con Autocompletado */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Dirección de Destino</Text>
                <TouchableOpacity
                    onPress={() => {
                      handleClose(); // ✅ Cerrar modal primero
                      onSelectDestinationOnMap(); // ✅ Luego activar modo selección
                    }}
                    style={styles.mapButton}
                  >
                    <Ionicons name="map" size={16} color={colors.primary} />
                    <Text style={styles.mapButtonText}>Seleccionar en mapa</Text>
                  </TouchableOpacity>
              </View>
              
              {/* ✅ NUEVO: Mostrar si viene del mapa */}
              {destinoSeleccionadoMapa && (
                <View style={styles.mapaIndicador}>
                  <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                  <Text style={styles.mapaIndicadorText}>Seleccionado desde el mapa</Text>
                </View>
              )}
              
              <View style={styles.inputWithIcon}>
                <Ionicons
                  name="navigate"
                  size={20}
                  color={colors.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Providencia 1104, Santiago"
                  value={busquedaDestino}
                  onChangeText={(text) => {
                    setBusquedaDestino(text);
                    if (destinoCoords) {
                      setDestinoCoords(null);
                      setDestinoDireccion('');
                    }
                  }}
                />
                {buscandoSugerencias && (
                  <ActivityIndicator
                    size="small"
                    color={colors.primary}
                    style={styles.searchingIcon}
                  />
                )}
              </View>

              {/* Sugerencias de direcciones */}
              {sugerencias.length > 0 && (
                <View style={styles.sugerenciasContainer}>
                  <FlatList
                    data={sugerencias}
                    keyExtractor={(item, index) => `${item.lat}-${item.lon}-${index}`}
                    scrollEnabled={false}
                    renderItem={({ item }) => {
                      const direccionFormateada = GeocodingService.formatAddress(item);
                      
                      return (
                        <TouchableOpacity
                          style={styles.sugerenciaItem}
                          onPress={() => seleccionarSugerencia(item)}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name="location-outline"
                            size={20}
                            color={colors.text.secondary}
                          />
                          <View style={styles.sugerenciaTexto}>
                            <Text style={styles.sugerenciaPrincipal}>
                              {direccionFormateada}
                            </Text>
                            {item.display_name !== direccionFormateada && (
                              <Text style={styles.sugerenciaSecundaria} numberOfLines={1}>
                                {item.display_name}
                              </Text>
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    }}
                  />
                </View>
              )}
            </View>

            {/* ✅ Tipo de Vehículo con Secciones */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tipo de Vehículo</Text>
              
              {/* Vehículos Livianos */}
              <Text style={styles.seccionLabel}>LIVIANOS ($25.000 + $1.350/km)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.vehiculoButtons}>
                  {TIPOS_VEHICULO.filter(v => !v.pesado).map((tipo) => (
                    <TouchableOpacity
                      key={tipo.value}
                      style={[
                        styles.vehiculoButton,
                        tipoVehiculo === tipo.value && styles.vehiculoButtonActive,
                      ]}
                      onPress={() => setTipoVehiculo(tipo.value)}
                    >
                      <Text
                        style={[
                          styles.vehiculoButtonText,
                          tipoVehiculo === tipo.value && styles.vehiculoButtonTextActive,
                        ]}
                      >
                        {tipo.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* Vehículos Pesados */}
              <Text style={[styles.seccionLabel, { marginTop: spacing.md }]}>
                PESADOS ($80.000 + $1.850/km)
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.vehiculoButtons}>
                  {TIPOS_VEHICULO.filter(v => v.pesado).map((tipo) => (
                    <TouchableOpacity
                      key={tipo.value}
                      style={[
                        styles.vehiculoButton,
                        tipoVehiculo === tipo.value && styles.vehiculoButtonActive,
                      ]}
                      onPress={() => setTipoVehiculo(tipo.value)}
                    >
                      <Text
                        style={[
                          styles.vehiculoButtonText,
                          tipoVehiculo === tipo.value && styles.vehiculoButtonTextActive,
                        ]}
                      >
                        {tipo.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {vehiculoSeleccionado && (
                <View style={styles.vehiculoSeleccionado}>
                  <Text style={styles.vehiculoSeleccionadoText}>
                    Seleccionado: {vehiculoSeleccionado.label}
                  </Text>
                  <Text style={styles.vehiculoTarifa}>
                    {vehiculoSeleccionado.pesado ? 'Tarifa Pesado' : 'Tarifa Estándar'}
                  </Text>
                </View>
              )}
            </View>

            {/* ✅ Resumen de Precio */}
            {destinoCoords && precioEstimado > 0 && (
              <View style={styles.resumenPrecio}>
                <View style={styles.resumenHeader}>
                  <Ionicons name="calculator" size={20} color={colors.primary} />
                  <Text style={styles.resumenTitle}>Resumen del Servicio</Text>
                </View>
                
                <View style={styles.resumenRow}>
                  <Text style={styles.resumenLabel}>Distancia estimada:</Text>
                  <Text style={styles.resumenValue}>{distanciaKm} km</Text>
                </View>
                
                <View style={styles.resumenRow}>
                  <Text style={styles.resumenLabel}>Tarifa base:</Text>
                  <Text style={styles.resumenValue}>
                    ${(vehiculoSeleccionado?.pesado ? 80000 : 25000).toLocaleString('es-CL')}
                  </Text>
                </View>
                
                <View style={styles.resumenRow}>
                  <Text style={styles.resumenLabel}>Por kilómetro:</Text>
                  <Text style={styles.resumenValue}>
                    ${(vehiculoSeleccionado?.pesado ? 1850 : 1350).toLocaleString('es-CL')}
                  </Text>
                </View>
                
                <View style={styles.resumenDivider} />
                
                <View style={styles.resumenRow}>
                  <Text style={styles.resumenTotal}>Total Estimado:</Text>
                  <Text style={styles.resumenTotalValue}>
                    ${precioEstimado.toLocaleString('es-CL')}
                  </Text>
                </View>
              </View>
            )}

            {/* Observaciones */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Observaciones (opcional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Detalles adicionales..."
                value={observaciones}
                onChangeText={setObservaciones}
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            {destinoCoords && precioEstimado > 0 && (
              <View style={styles.precioDestacado}>
                <View style={styles.precioDestacadoContent}>
                  <Text style={styles.precioDestacadoLabel}>Total a Pagar:</Text>
                  <Text style={styles.precioDestacadoValor}>
                    ${precioEstimado.toLocaleString('es-CL')}
                  </Text>
                </View>
                <Text style={styles.precioDestacadoDetalle}>
                  {distanciaKm} km • {vehiculoSeleccionado?.label}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.solicitarButton, loading && styles.solicitarButtonDisabled]}
              onPress={handleSolicitar}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="send" size={20} color="#fff" />
                  <Text style={styles.solicitarButtonText}>Solicitar Servicio</Text>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
  modalContent: {
    padding: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mapButtonText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  // ✅ NUEVO: Indicador de selección desde mapa
  mapaIndicador: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
    padding: spacing.xs,
    backgroundColor: '#f0fdf4',
    borderRadius: 6,
  },
  mapaIndicadorText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
  },
  inputIcon: {
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    padding: spacing.md,
    fontSize: 15,
  },
  refreshButton: {
    padding: spacing.xs,
  },
  searchingIcon: {
    marginLeft: spacing.xs,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
  },
  sugerenciasContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginTop: spacing.xs,
    maxHeight: 200,
  },
  sugerenciaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  sugerenciaTexto: {
    flex: 1,
  },
  sugerenciaPrincipal: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '500',
  },
  sugerenciaSecundaria: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  seccionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  vehiculoButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  vehiculoButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  vehiculoButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  vehiculoButtonText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  vehiculoButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  vehiculoSeleccionado: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  vehiculoSeleccionadoText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.secondary,
  },
  vehiculoTarifa: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
  },
  resumenPrecio: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  resumenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  resumenTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.secondary,
  },
  resumenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  resumenLabel: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  resumenValue: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text.primary,
  },
  resumenDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  resumenTotal: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  resumenTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  modalFooter: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  precioDestacado: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  precioDestacadoContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  precioDestacadoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  precioDestacadoValor: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  precioDestacadoDetalle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  solicitarButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: 8,
    gap: spacing.sm,
  },
  solicitarButtonDisabled: {
    opacity: 0.6,
  },
  solicitarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});