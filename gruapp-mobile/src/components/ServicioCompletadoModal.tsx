import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme/colors';
import api from '../services/api';
import Toast from 'react-native-toast-message';

interface Servicio {
  id: string;
  origenDireccion: string;
  destinoDireccion: string;
  distanciaKm: number;
  totalCliente: number;
  gruero?: {
    user: {
      nombre: string;
      apellido: string;
    };
    patente: string;
    marca: string;
    modelo: string;
  };
}

interface Props {
  visible: boolean;
  servicio: Servicio | null;
  onClose: () => void;
}

export default function ServicioCompletadoModal({
  visible,
  servicio,
  onClose,
}: Props) {
  const [calificacion, setCalificacion] = useState(0);
  const [comentario, setComentario] = useState('');
  const [calificado, setCalificado] = useState(false);
  const [calificando, setCalificando] = useState(false);
  const [pagando, setPagando] = useState(false);

  if (!servicio) return null;

  const handleCalificar = async () => {
    if (calificacion === 0) {
      Toast.show({
        type: 'error',
        text1: 'Calificación requerida',
        text2: 'Por favor selecciona una calificación',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    console.log('🌟 Enviando calificación:', {
      servicioId: servicio.id,
      puntuacionGruero: calificacion,
      comentarioGruero: comentario.trim() || undefined,
      puntuacionCliente: 5,
      comentarioCliente: undefined,
    });

    try {
      setCalificando(true);
      const response = await api.post('/calificaciones', {
        servicioId: servicio.id,
        puntuacionGruero: calificacion,
        comentarioGruero: comentario.trim() || undefined,
        puntuacionCliente: 5,
        comentarioCliente: undefined,
      });

      if (response.data.success) {
        setCalificado(true);
        Toast.show({
          type: 'success',
          text1: '✅ Calificación Enviada',
          text2: 'Gracias por tu feedback',
          position: 'top',
          visibilityTime: 3000,
        });
      }
    } catch (error: any) {
      console.error('Error calificando:', error);
      Toast.show({
        type: 'error',
        text1: 'Error al calificar',
        text2: error.response?.data?.message || 'No se pudo enviar la calificación',
        position: 'top',
        visibilityTime: 4000,
      });
    } finally {
      setCalificando(false);
    }
  };

  const handlePagar = async () => {
    console.log('💳 Iniciando pago para servicio:', servicio.id);
    
    try {
      setPagando(true);
      console.log('📤 Llamando a /pagos/crear-preferencia...');
      
      const response = await api.post(`/pagos/crear-preferencia`, {
        servicioId: servicio.id,
        isMobileApp: true,
      });

      console.log('📦 Respuesta del backend:', response.data);

      // ✅ Soporta tanto initPoint como init_point
      const initPoint = response.data.data.initPoint || response.data.data.init_point;

      if (response.data.success && initPoint) {
        const url = initPoint;
        
        console.log('🔗 URL de Mercado Pago:', url);
        
        // Abrir Mercado Pago
        const supported = await Linking.canOpenURL(url);
        console.log('🌐 ¿Puede abrir URL?:', supported);
        
        if (supported) {
          await Linking.openURL(url);
          Toast.show({
            type: 'info',
            text1: 'Redirigiendo a Mercado Pago',
            text2: 'Completa el pago y vuelve a la app cuando termines',
            position: 'top',
            visibilityTime: 5000,
          });
          onClose();
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
      setPagando(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="checkmark-circle" size={48} color="#fff" />
            <Text style={styles.headerTitle}>¡Servicio Completado!</Text>
            <Text style={styles.headerSubtitle}>
              {servicio.gruero?.user.nombre} completó el servicio
            </Text>
          </View>

          {/* Contenido */}
          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              {/* Info del Servicio */}
              <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                  <Ionicons name="person-outline" size={20} color={colors.text.secondary} />
                  <Text style={styles.infoText}>
                    {servicio.gruero?.user.nombre} {servicio.gruero?.user.apellido}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="car-outline" size={20} color={colors.text.secondary} />
                  <Text style={styles.infoText}>
                    {servicio.gruero?.marca} {servicio.gruero?.modelo} - {servicio.gruero?.patente}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="navigate-outline" size={20} color={colors.text.secondary} />
                  <Text style={styles.infoText}>{servicio.distanciaKm.toFixed(1)} km</Text>
                </View>
              </View>

              {/* Total a Pagar */}
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total a Pagar</Text>
                <Text style={styles.totalMonto}>
                  ${servicio.totalCliente.toLocaleString('es-CL')}
                </Text>
              </View>

              {/* Calificación */}
              <View style={styles.calificacionContainer}>
                <Text style={styles.sectionTitle}>
                  {calificado ? '✅ Servicio Calificado' : '¿Cómo fue tu experiencia?'}
                </Text>
                
                {!calificado && (
                  <>
                    <View style={styles.estrellas}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity
                          key={star}
                          onPress={() => setCalificacion(star)}
                          disabled={calificado}
                        >
                          <Ionicons
                            name={star <= calificacion ? 'star' : 'star-outline'}
                            size={40}
                            color={star <= calificacion ? '#fbbf24' : '#d1d5db'}
                          />
                        </TouchableOpacity>
                      ))}
                    </View>

                    <TextInput
                      style={styles.comentarioInput}
                      placeholder="Comentario (opcional)"
                      placeholderTextColor={colors.text.secondary}
                      value={comentario}
                      onChangeText={setComentario}
                      multiline
                      numberOfLines={3}
                      maxLength={200}
                      editable={!calificado}
                    />

                    <TouchableOpacity
                      style={[styles.botonCalificar, calificando && styles.botonDisabled]}
                      onPress={handleCalificar}
                      disabled={calificando || calificado}
                    >
                      {calificando ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <Text style={styles.botonCalificarTexto}>Enviar Calificación</Text>
                      )}
                    </TouchableOpacity>
                  </>
                )}

                {calificado && (
                  <View style={styles.calificadoContainer}>
                    <Ionicons name="checkmark-circle" size={32} color="#10b981" />
                    <Text style={styles.calificadoTexto}>
                      Calificación enviada: {calificacion} {'⭐'.repeat(calificacion)}
                    </Text>
                    {comentario && (
                      <Text style={styles.comentarioEnviado}>"{comentario}"</Text>
                    )}
                  </View>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Botones */}
          <View style={styles.botones}>
            <TouchableOpacity
              style={styles.botonCerrar}
              onPress={onClose}
            >
              <Text style={styles.textoCerrar}>Cerrar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.botonPagar,
                (!calificado || pagando) && styles.botonDisabled,
              ]}
              onPress={handlePagar}
              disabled={!calificado || pagando}
            >
              {pagando ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="card-outline" size={20} color="#fff" />
                  <Text style={styles.textoPagar}>Pagar</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#10b981',
    padding: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  scrollContent: {
    maxHeight: 500,
  },
  content: {
    padding: 20,
  },
  infoContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    fontSize: 14,
    color: colors.secondary,
    flex: 1,
  },
  totalContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#dbeafe',
    borderRadius: 16,
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  totalMonto: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
  },
  calificacionContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  estrellas: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  comentarioInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: colors.secondary,
    textAlignVertical: 'top',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  botonCalificar: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  botonCalificarTexto: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  calificadoContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#dcfce7',
    borderRadius: 12,
  },
  calificadoTexto: {
    fontSize: 15,
    fontWeight: '600',
    color: '#166534',
    marginTop: 8,
    textAlign: 'center',
  },
  comentarioEnviado: {
    fontSize: 13,
    color: '#166534',
    marginTop: 8,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  botones: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  botonCerrar: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  textoCerrar: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.secondary,
  },
  botonPagar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    gap: 8,
  },
  textoPagar: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  botonDisabled: {
    opacity: 0.5,
  },
});