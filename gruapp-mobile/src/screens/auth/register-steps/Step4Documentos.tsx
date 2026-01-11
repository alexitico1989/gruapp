import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { colors, spacing, fontSize } from '../../../theme/colors';
import { FormData } from '../RegisterGrueroMultiStep';

interface Props {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

interface DocumentItem {
  name: string;
  uri: string;
  mimeType: string;
  size: number;
}

export default function Step4Documentos({ formData, updateFormData, nextStep, prevStep }: Props) {
  const [errors, setErrors] = useState<any>({});

  const pickDocument = async (type: keyof FormData) => {
    Alert.alert(
      'Seleccionar Documento',
      '¿Cómo quieres agregar el documento?',
      [
        {
          text: 'Tomar Foto',
          onPress: () => takePhoto(type),
        },
        {
          text: 'Seleccionar Archivo',
          onPress: () => selectFile(type),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  const takePhoto = async (type: keyof FormData) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso Requerido', 'Necesitamos acceso a tu cámara');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        const doc: DocumentItem = {
          name: `${type}_${Date.now()}.jpg`,
          uri: result.assets[0].uri,
          mimeType: 'image/jpeg',
          size: result.assets[0].fileSize || 0,
        };
        updateFormData({ [type]: doc });
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  const selectFile = async (type: keyof FormData) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (result.canceled === false && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const doc: DocumentItem = {
          name: asset.name,
          uri: asset.uri,
          mimeType: asset.mimeType || 'application/octet-stream',
          size: asset.size || 0,
        };
        updateFormData({ [type]: doc });
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'No se pudo seleccionar el archivo');
    }
  };

  const removeDocument = (type: keyof FormData) => {
    Alert.alert(
      'Eliminar Documento',
      '¿Estás seguro de eliminar este documento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => updateFormData({ [type]: null }),
        },
      ]
    );
  };

  const validate = () => {
    const newErrors: any = {};
    let valid = true;

    // Validar documentos
    if (!formData.licenciaConducir) {
      newErrors.licenciaConducir = 'Licencia requerida';
      valid = false;
    }
    if (!formData.licenciaVencimiento) {
      newErrors.licenciaVencimiento = 'Fecha requerida';
      valid = false;
    }

    if (!formData.seguroVigente) {
      newErrors.seguroVigente = 'Seguro requerido';
      valid = false;
    }
    if (!formData.seguroVencimiento) {
      newErrors.seguroVencimiento = 'Fecha requerida';
      valid = false;
    }

    if (!formData.revisionTecnica) {
      newErrors.revisionTecnica = 'Revisión requerida';
      valid = false;
    }
    if (!formData.revisionVencimiento) {
      newErrors.revisionVencimiento = 'Fecha requerida';
      valid = false;
    }

    if (!formData.permisoCirculacion) {
      newErrors.permisoCirculacion = 'Permiso requerido';
      valid = false;
    }
    if (!formData.permisoVencimiento) {
      newErrors.permisoVencimiento = 'Fecha requerida';
      valid = false;
    }

    setErrors(newErrors);

    if (!valid) {
      Alert.alert('Documentos Incompletos', 'Debes subir todos los documentos con sus fechas de vencimiento');
    }

    return valid;
  };

  const handleNext = () => {
    if (validate()) {
      nextStep();
    }
  };

  const renderDocumentField = (
    title: string,
    icon: string,
    docKey: keyof FormData,
    dateKey: keyof FormData,
    placeholder: string
  ) => {
    const doc = formData[docKey] as DocumentItem | null;
    const error = errors[docKey] || errors[dateKey];

    return (
      <View style={styles.documentSection}>
        <View style={styles.documentHeader}>
          <Ionicons name={icon as any} size={24} color={colors.primary} />
          <Text style={styles.documentTitle}>{title}</Text>
        </View>

        {/* Botón subir documento */}
        {!doc ? (
          <TouchableOpacity
            style={styles.uploadDocButton}
            onPress={() => pickDocument(docKey)}
          >
            <Ionicons name="cloud-upload-outline" size={24} color={colors.primary} />
            <Text style={styles.uploadDocText}>Subir Documento</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.documentUploaded}>
            <View style={styles.documentInfo}>
              <Ionicons name="document-text" size={20} color={colors.success} />
              <Text style={styles.documentName} numberOfLines={1}>
                {doc.name}
              </Text>
            </View>
            <TouchableOpacity onPress={() => removeDocument(docKey)}>
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        )}

        {/* Input fecha vencimiento */}
        <Input
          label="Fecha de Vencimiento"
          placeholder={placeholder}
          value={formData[dateKey] as string}
          onChangeText={(value) => updateFormData({ [dateKey]: value })}
          keyboardType="default"
          icon="calendar-outline"
          error={errors[dateKey]}
        />

        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  };

  return (
    <View>
      <Text style={styles.title}>Documentos</Text>
      <Text style={styles.subtitle}>
        Sube los documentos requeridos para verificar tu cuenta
      </Text>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color={colors.primary} />
        <Text style={styles.infoText}>
          Puedes tomar foto o subir archivos PDF/imagen
        </Text>
      </View>

      {renderDocumentField(
        'Licencia de Conducir',
        'card',
        'licenciaConducir',
        'licenciaVencimiento',
        'DD/MM/AAAA'
      )}

      {renderDocumentField(
        'Seguro Obligatorio (SOAP)',
        'shield-checkmark',
        'seguroVigente',
        'seguroVencimiento',
        'DD/MM/AAAA'
      )}

      {renderDocumentField(
        'Revisión Técnica',
        'construct',
        'revisionTecnica',
        'revisionVencimiento',
        'DD/MM/AAAA'
      )}

      {renderDocumentField(
        'Permiso de Circulación',
        'document-attach',
        'permisoCirculacion',
        'permisoVencimiento',
        'DD/MM/AAAA'
      )}

      <View style={styles.buttonRow}>
        <Button
          title="Atrás"
          onPress={prevStep}
          variant="outline"
          style={styles.buttonHalf}
        />
        <Button
          title="Siguiente"
          onPress={handleNext}
          style={styles.buttonHalf}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.secondary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  infoText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  documentSection: {
    marginBottom: spacing.xl,
    padding: spacing.md,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  documentTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.secondary,
  },
  uploadDocButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: '#f0f9ff',
    marginBottom: spacing.md,
  },
  uploadDocText: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '600',
  },
  documentUploaded: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.success,
    marginBottom: spacing.md,
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  documentName: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.secondary,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.error,
    marginTop: spacing.xs,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  buttonHalf: {
    flex: 1,
  },
});