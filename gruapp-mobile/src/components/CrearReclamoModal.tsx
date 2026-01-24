import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import api from '../services/api';
import { colors, spacing } from '../theme/colors';
import Toast from 'react-native-toast-message';

interface Servicio {
  id: string;
  origenDireccion: string;
  destinoDireccion: string;
  status: string;
  solicitadoAt: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  servicioId?: string; // Opcional: si viene desde el historial
}

const TIPOS_RECLAMO = [
  { value: '', label: 'Selecciona un tipo' },
  { value: 'PROBLEMA_SERVICIO', label: 'Problema con el Servicio' },
  { value: 'PROBLEMA_PAGO', label: 'Problema de Pago' },
  { value: 'MALTRATO', label: 'Maltrato' },
  { value: 'OTRO', label: 'Otro' },
];

const PRIORIDADES = [
  { value: 'BAJA', label: 'Baja' },
  { value: 'MEDIA', label: 'Media' },
  { value: 'ALTA', label: 'Alta' },
];

export default function CrearReclamoModal({ visible, onClose, onSuccess, servicioId }: Props) {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loadingServicios, setLoadingServicios] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(servicioId || '');
  const [tipo, setTipo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [prioridad, setPrioridad] = useState('MEDIA');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (visible && !servicioId) {
      cargarServicios();
    }
    if (visible && servicioId) {
      setServicioSeleccionado(servicioId);
    }
  }, [visible, servicioId]);

  const cargarServicios = async () => {
    try {
      setLoadingServicios(true);
      const response = await api.get('/servicios/historial');
      if (response.data.success) {
        // Solo servicios completados o cancelados
        const serviciosDisponibles = response.data.data.filter(
          (s: Servicio) => ['COMPLETADO', 'CANCELADO'].includes(s.status)
        );
        setServicios(serviciosDisponibles);
      }
    } catch (error) {
      console.error('Error cargando servicios:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudieron cargar los servicios',
        position: 'top',
        visibilityTime: 3000,
      });
    } finally {
      setLoadingServicios(false);
    }
  };

  // ✅ NUEVA FUNCIÓN: Formatear ID del servicio (primeros 8 caracteres)
  const formatearIdServicio = (id: string) => {
    return id.substring(0, 8).toUpperCase();
  };

  // ✅ NUEVA FUNCIÓN: Formatear fecha más compacta
  const formatearFechaCorta = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleEnviar = async () => {
    // Validaciones
    if (!servicioSeleccionado) {
      Toast.show({
        type: 'error',
        text1: 'Servicio Requerido',
        text2: 'Selecciona el servicio relacionado',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    if (!tipo) {
      Toast.show({
        type: 'error',
        text1: 'Tipo Requerido',
        text2: 'Selecciona el tipo de reclamo',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    if (!descripcion.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Descripción Requerida',
        text2: 'Escribe la descripción del reclamo',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    if (descripcion.trim().length < 10) {
      Toast.show({
        type: 'error',
        text1: 'Descripción muy corta',
        text2: 'Describe el problema con más detalle (mínimo 10 caracteres)',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    try {
      setEnviando(true);
      const response = await api.post('/reclamos', {
        servicioId: servicioSeleccionado,
        tipo,
        descripcion: descripcion.trim(),
        prioridad,
      });

      if (response.data.success) {
        Toast.show({
          type: 'success',
          text1: '✅ Reclamo Creado',
          text2: 'Tu reclamo ha sido enviado correctamente',
          position: 'top',
          visibilityTime: 3000,
        });
        limpiarFormulario();
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error creando reclamo:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'No se pudo crear el reclamo',
        position: 'top',
        visibilityTime: 3000,
      });
    } finally {
      setEnviando(false);
    }
  };

  const limpiarFormulario = () => {
    if (!servicioId) {
      setServicioSeleccionado('');
    }
    setTipo('');
    setDescripcion('');
    setPrioridad('MEDIA');
  };

  const handleClose = () => {
    limpiarFormulario();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Nuevo Reclamo</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* ✅ CORREGIDO: ScrollView con contentContainerStyle para evitar que se corte */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Servicio */}
            <View style={styles.field}>
              <Text style={styles.label}>
                Servicio <Text style={styles.required}>*</Text>
              </Text>
              {servicioId ? (
                <View style={styles.servicioFijo}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  <Text style={styles.servicioFijoText}>Servicio seleccionado</Text>
                </View>
              ) : loadingServicios ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.loadingText}>Cargando servicios...</Text>
                </View>
              ) : (
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={servicioSeleccionado}
                    onValueChange={(value) => setServicioSeleccionado(value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Selecciona un servicio" value="" />
                    {servicios.map((servicio) => (
                      <Picker.Item
                        key={servicio.id}
                        label={`Servicio #${formatearIdServicio(servicio.id)} - ${formatearFechaCorta(
                          servicio.solicitadoAt
                        )}`}
                        value={servicio.id}
                      />
                    ))}
                  </Picker>
                </View>
              )}
            </View>

            {/* Tipo */}
            <View style={styles.field}>
              <Text style={styles.label}>
                Tipo de Reclamo <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={tipo}
                  onValueChange={(value) => setTipo(value)}
                  style={styles.picker}
                >
                  {TIPOS_RECLAMO.map((tipoItem) => (
                    <Picker.Item
                      key={tipoItem.value}
                      label={tipoItem.label}
                      value={tipoItem.value}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Prioridad */}
            <View style={styles.field}>
              <Text style={styles.label}>Prioridad</Text>
              <View style={styles.prioridadContainer}>
                {PRIORIDADES.map((prioridadItem) => (
                  <TouchableOpacity
                    key={prioridadItem.value}
                    style={[
                      styles.prioridadButton,
                      prioridad === prioridadItem.value && styles.prioridadButtonActive,
                    ]}
                    onPress={() => setPrioridad(prioridadItem.value)}
                  >
                    <Text
                      style={[
                        styles.prioridadButtonText,
                        prioridad === prioridadItem.value && styles.prioridadButtonTextActive,
                      ]}
                    >
                      {prioridadItem.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Descripción */}
            <View style={styles.field}>
              <Text style={styles.label}>
                Descripción <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.textArea}
                placeholder="Describe detalladamente el problema..."
                placeholderTextColor={colors.text.secondary}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                value={descripcion}
                onChangeText={setDescripcion}
                maxLength={500}
              />
              <Text style={styles.charCount}>{descripcion.length}/500</Text>
            </View>

            {/* Info */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color={colors.primary} />
              <Text style={styles.infoText}>
                Tu reclamo será revisado por nuestro equipo. Te notificaremos cuando haya novedades.
              </Text>
            </View>

            {/* ✅ ESPACIO ADICIONAL al final para que el contenido no quede pegado a los botones */}
            <View style={{ height: spacing.xl }} />
          </ScrollView>

          {/* Footer - FUERA del ScrollView */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={enviando}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, enviando && styles.submitButtonDisabled]}
              onPress={handleEnviar}
              disabled={enviando}
            >
              {enviando ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Enviar Reclamo</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    flex: 1,
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
  // ✅ CORREGIDO: Separar scrollView del content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl, // Espacio adicional al final
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary,
    marginBottom: spacing.sm,
  },
  required: {
    color: colors.error,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  servicioFijo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: '#dcfce7',
    borderRadius: 8,
    gap: spacing.sm,
  },
  servicioFijoText: {
    fontSize: 14,
    color: '#16a34a',
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  prioridadContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  prioridadButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: 'center',
  },
  prioridadButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  prioridadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  prioridadButtonTextActive: {
    color: '#fff',
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 14,
    color: colors.text.primary,
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'right',
    marginTop: 4,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
    backgroundColor: '#fff', // ✅ Fondo blanco para que no se vea transparente
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  submitButton: {
    flex: 1,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});