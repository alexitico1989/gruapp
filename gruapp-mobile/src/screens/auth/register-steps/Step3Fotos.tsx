import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Image, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../../components/Button';
import { colors, spacing, fontSize } from '../../../theme/colors';
import { FormData } from '../RegisterGrueroMultiStep';

interface Props {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export default function Step3Fotos({ formData, updateFormData, nextStep, prevStep }: Props) {
  const [loading, setLoading] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permiso Requerido',
        'Necesitamos acceso a tu galería para subir fotos'
      );
      return false;
    }
    return true;
  };

  const pickImage = async (type: 'fotoGruero' | 'fotoGrua') => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'fotoGruero' ? [1, 1] : [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        updateFormData({ [type]: result.assets[0] });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo cargar la imagen');
    }
  };

  const takePhoto = async (type: 'fotoGruero' | 'fotoGrua') => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permiso Requerido',
        'Necesitamos acceso a tu cámara para tomar fotos'
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: type === 'fotoGruero' ? [1, 1] : [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        updateFormData({ [type]: result.assets[0] });
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  const showImageOptions = (type: 'fotoGruero' | 'fotoGrua') => {
    Alert.alert(
      'Seleccionar Foto',
      '¿Cómo quieres agregar la foto?',
      [
        {
          text: 'Cámara',
          onPress: () => takePhoto(type),
        },
        {
          text: 'Galería',
          onPress: () => pickImage(type),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  const validate = () => {
    if (!formData.fotoGruero) {
      Alert.alert('Foto Requerida', 'Debes subir tu foto de perfil');
      return false;
    }
    if (!formData.fotoGrua) {
      Alert.alert('Foto Requerida', 'Debes subir la foto de tu grúa');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validate()) {
      nextStep();
    }
  };

  return (
    <View>
      <Text style={styles.title}>Fotos</Text>
      <Text style={styles.subtitle}>
        Sube tu foto y la de tu grúa para verificación
      </Text>

      {/* Foto del Gruero */}
      <View style={styles.photoSection}>
        <Text style={styles.label}>📸 Tu Foto de Perfil</Text>
        <Text style={styles.helperText}>
          Toma una selfie clara o sube una foto reciente
        </Text>
        
        {formData.fotoGruero ? (
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: formData.fotoGruero.uri }}
              style={styles.imagePreview}
            />
            <TouchableOpacity
              style={styles.changeButton}
              onPress={() => showImageOptions('fotoGruero')}
            >
              <Ionicons name="camera" size={20} color="#fff" />
              <Text style={styles.changeButtonText}>Cambiar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => showImageOptions('fotoGruero')}
          >
            <Ionicons name="camera-outline" size={40} color={colors.primary} />
            <Text style={styles.uploadButtonText}>Tomar Foto / Subir</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Foto de la Grúa */}
      <View style={styles.photoSection}>
        <Text style={styles.label}>🚚 Foto de tu Grúa</Text>
        <Text style={styles.helperText}>
          Foto clara de tu grúa desde el lateral
        </Text>
        
        {formData.fotoGrua ? (
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: formData.fotoGrua.uri }}
              style={styles.imagePreview}
            />
            <TouchableOpacity
              style={styles.changeButton}
              onPress={() => showImageOptions('fotoGrua')}
            >
              <Ionicons name="camera" size={20} color="#fff" />
              <Text style={styles.changeButtonText}>Cambiar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => showImageOptions('fotoGrua')}
          >
            <Ionicons name="camera-outline" size={40} color={colors.primary} />
            <Text style={styles.uploadButtonText}>Tomar Foto / Subir</Text>
          </TouchableOpacity>
        )}
      </View>

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
    marginBottom: spacing.lg,
  },
  photoSection: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.secondary,
    marginBottom: spacing.xs,
  },
  helperText: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
  },
  uploadButtonText: {
    marginTop: spacing.sm,
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  changeButton: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  changeButtonText: {
    color: '#fff',
    fontWeight: '600',
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