import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize } from '../theme/colors';
import Button from './Button';
import api from '../services/api';
import { useSocket } from '../contexts/SocketContext';

interface SolicitarServicioModalProps {
  visible: boolean;
  onClose: () => void;
  ubicacionActual: { latitude: number; longitude: number } | null;
}

export default function SolicitarServicioModal({
  visible,
  onClose,
  ubicacionActual,
}: SolicitarServicioModalProps) {
  const { socket } = useSocket();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    origenDireccion: '',
    destinoDireccion: '',
    descripcion: '',
    tipoVehiculo: 'AUTO',
  });

  const tiposVehiculo = [
    { label: 'Auto', value: 'AUTO' },
    { label: 'Camioneta', value: 'CAMIONETA' },
    { label: 'SUV', value: 'SUV' },
    { label: 'Moto', value: 'MOTO' },
  ];

  const handleSolicitar = async () => {
    // Validaciones
    if (!formData.origenDireccion.trim()) {
      Alert.alert('Error', 'Ingresa la dirección de origen');
      return;
    }

    if (!formData.destinoDireccion.trim()) {
      Alert.alert('Error', 'Ingresa la dirección de destino');
      return;
    }

    if (!ubicacionActual) {
      Alert.alert('Error', 'No se pudo obtener tu ubicación');
      return;
    }

    try {
      setLoading(true);

      const response = await api.post('/servicios/solicitar', {
        origenDireccion: formData.origenDireccion.trim(),
        origenLat: ubicacionActual.latitude,
        origenLng: ubicacionActual.longitude,
        destinoDireccion: formData.destinoDireccion.trim(),
        destinoLat: ubicacionActual.latitude + 0.01, // Temporal
        destinoLng: ubicacionActual.longitude + 0.01, // Temporal
        descripcion: formData.descripcion.trim() || undefined,
        tipoVehiculo: formData.tipoVehiculo,
      });

      if (response.data.success) {
        // Emitir evento de nuevo servicio
        if (socket) {
          socket.emit('servicio:nuevo', {
            servicio: response.data.data,
          });
        }

        Alert.alert(
          '¡Solicitud Enviada!',
          'Los grueros cercanos han sido notificados. Te avisaremos cuando alguien acepte.',
          [{ text: 'OK', onPress: () => {
            setFormData({
              origenDireccion: '',
              destinoDireccion: '',
              descripcion: '',
              tipoVehiculo: 'AUTO',
            });
            onClose();
          }}]
        );
      }
    } catch (error: any) {
      console.error('Error solicitando servicio:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'No se pudo enviar la solicitud'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Solicitar Grúa</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            {/* Origen */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>📍 Dirección de Origen</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Av. Providencia 123, Providencia"
                value={formData.origenDireccion}
                onChangeText={(value) => setFormData({ ...formData, origenDireccion: value })}
                multiline
              />
            </View>

            {/* Destino */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>🎯 Dirección de Destino</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Av. Las Condes 456, Las Condes"
                value={formData.destinoDireccion}
                onChangeText={(value) => setFormData({ ...formData, destinoDireccion: value })}
                multiline
              />
            </View>

            {/* Tipo de Vehículo */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>🚗 Tipo de Vehículo</Text>
              <View style={styles.tipoVehiculoContainer}>
                {tiposVehiculo.map((tipo) => (
                  <TouchableOpacity
                    key={tipo.value}
                    style={[
                      styles.tipoVehiculoButton,
                      formData.tipoVehiculo === tipo.value && styles.tipoVehiculoButtonActive,
                    ]}
                    onPress={() => setFormData({ ...formData, tipoVehiculo: tipo.value })}
                  >
                    <Text
                      style={[
                        styles.tipoVehiculoText,
                        formData.tipoVehiculo === tipo.value && styles.tipoVehiculoTextActive,
                      ]}
                    >
                      {tipo.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Descripción */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>📝 Descripción (Opcional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe tu situación o algún detalle importante..."
                value={formData.descripcion}
                onChangeText={(value) => setFormData({ ...formData, descripcion: value })}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Info */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color={colors.primary} />
              <Text style={styles.infoText}>
                Los grueros cercanos recibirán tu solicitud y podrán aceptarla.
              </Text>
            </View>
          </ScrollView>

          {/* Botón */}
          <View style={styles.footer}>
            <Button
              title={loading ? 'Enviando...' : 'Solicitar Grúa'}
              onPress={handleSolicitar}
              loading={loading}
            />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  content: {
    padding: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.secondary,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text.primary,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  tipoVehiculoContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tipoVehiculoButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: 'center',
  },
  tipoVehiculoButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tipoVehiculoText: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  tipoVehiculoTextActive: {
    color: '#fff',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});