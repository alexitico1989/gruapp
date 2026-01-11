import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../../components/Button';
import { colors, spacing, fontSize } from '../../../theme/colors';
import { FormData as FormDataType } from '../RegisterGrueroMultiStep';
import { useAuthStore } from '../../../store/authStore';
import api from '../../../services/api';

interface Props {
  formData: FormDataType;
  prevStep: () => void;
}

export default function Step5Confirmacion({ formData, prevStep }: Props) {
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // ✅ Función para convertir DD/MM/AAAA a formato ISO (AAAA-MM-DD)
  const convertirFechaAISO = (fecha: string): string => {
    const partes = fecha.split('/');
    if (partes.length !== 3) return fecha;
    
    const [dia, mes, anio] = partes;
    return `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
  };

  const uploadFile = async (
    file: any,
    endpoint: string,
    fieldName: string,
    additionalData?: any
  ) => {
    try {
      const formDataUpload = new FormData();
      
      const uriParts = file.uri.split('.');
      const fileExtension = uriParts[uriParts.length - 1];
      const fileName = `${Date.now()}.${fileExtension}`;
      
      const fileToUpload: any = {
        uri: Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri,
        name: fileName,
        type: file.mimeType || `image/${fileExtension}`,
      };
      
      formDataUpload.append(fieldName, fileToUpload);

      if (additionalData) {
        Object.keys(additionalData).forEach(key => {
          formDataUpload.append(key, additionalData[key]);
        });
      }

      const response = await api.post(endpoint, formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
        transformRequest: (data, headers) => {
          return formDataUpload;
        },
      });

      return response.data;
    } catch (error: any) {
      console.error(`Error uploading to ${endpoint}:`, error.response?.data || error.message);
      throw error;
    }
  };

  const handleRegister = async () => {
    try {
      setLoading(true);

      console.log('📝 Registrando usuario...');
      const registerResponse = await api.post('/auth/register/gruero', {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.toLowerCase().trim(),
        telefono: formData.telefono.replace(/\s/g, ''),
        rut: formData.rut.replace(/\./g, '').trim(),
        password: formData.password,
        patente: formData.patente.toUpperCase().trim(),
        marca: formData.marca.trim(),
        modelo: formData.modelo.trim(),
        anio: parseInt(formData.anio),
        capacidadToneladas: parseFloat(formData.capacidadToneladas),
        tipoGrua: formData.tipoGrua,
      });

      if (!registerResponse.data.success) {
        throw new Error(registerResponse.data.message);
      }

      console.log('✅ Usuario registrado');
      await setAuth(registerResponse.data.data.user, registerResponse.data.data.token);

      console.log('📸 Subiendo foto gruero...');
      if (formData.fotoGruero) {
        await uploadFile(formData.fotoGruero, '/gruero/foto-gruero', 'foto');
        console.log('✅ Foto gruero subida');
      }

      console.log('🚚 Subiendo foto grúa...');
      if (formData.fotoGrua) {
        await uploadFile(formData.fotoGrua, '/gruero/foto-grua', 'foto');
        console.log('✅ Foto grúa subida');
      }

      console.log('📄 Subiendo documentos...');
      
      if (formData.licenciaConducir) {
        await uploadFile(
          formData.licenciaConducir,
          '/gruero/documento',
          'documento',
          {
            tipoDocumento: 'licenciaConducir',
            fechaVencimiento: convertirFechaAISO(formData.licenciaVencimiento), // ✅ CONVERTIDO
          }
        );
        console.log('✅ Licencia subida');
      }

      if (formData.seguroVigente) {
        await uploadFile(
          formData.seguroVigente,
          '/gruero/documento',
          'documento',
          {
            tipoDocumento: 'seguroVigente',
            fechaVencimiento: convertirFechaAISO(formData.seguroVencimiento), // ✅ CONVERTIDO
          }
        );
        console.log('✅ Seguro subido');
      }

      if (formData.revisionTecnica) {
        await uploadFile(
          formData.revisionTecnica,
          '/gruero/documento',
          'documento',
          {
            tipoDocumento: 'revisionTecnica',
            fechaVencimiento: convertirFechaAISO(formData.revisionVencimiento), // ✅ CONVERTIDO
          }
        );
        console.log('✅ Revisión técnica subida');
      }

      if (formData.permisoCirculacion) {
        await uploadFile(
          formData.permisoCirculacion,
          '/gruero/documento',
          'documento',
          {
            tipoDocumento: 'permisoCirculacion',
            fechaVencimiento: convertirFechaAISO(formData.permisoVencimiento), // ✅ CONVERTIDO
          }
        );
        console.log('✅ Permiso circulación subido');
      }

      console.log('🎉 Registro completo exitoso');

      Alert.alert(
        '¡Registro Exitoso! 🎉',
        'Tu cuenta ha sido creada y tus documentos están en revisión. Te notificaremos cuando sean verificados.',
        [{ text: 'Entendido' }]
      );
    } catch (error: any) {
      console.error('❌ Error en registro completo:', error);
      
      let errorMessage = 'Error al registrar. Intenta de nuevo.';
      
      if (error.response?.status === 409) {
        errorMessage = 'Este email o RUT ya están registrados. Usa datos diferentes o inicia sesión.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error en Registro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView>
      <Text style={styles.title}>Confirmación</Text>
      <Text style={styles.subtitle}>
        Revisa tus datos antes de finalizar el registro
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👤 Datos Personales</Text>
        <InfoRow label="Nombre" value={`${formData.nombre} ${formData.apellido}`} />
        <InfoRow label="RUT" value={formData.rut} />
        <InfoRow label="Email" value={formData.email} />
        <InfoRow label="Teléfono" value={formData.telefono} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚚 Datos del Vehículo</Text>
        <InfoRow label="Patente" value={formData.patente} />
        <InfoRow label="Marca/Modelo" value={`${formData.marca} ${formData.modelo}`} />
        <InfoRow label="Año" value={formData.anio} />
        <InfoRow label="Capacidad" value={`${formData.capacidadToneladas} ton`} />
        <InfoRow label="Tipo" value={formData.tipoGrua.replace('_', ' ')} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📸 Fotos</Text>
        <View style={styles.photosRow}>
          {formData.fotoGruero && (
            <View style={styles.photoPreview}>
              <Image
                source={{ uri: formData.fotoGruero.uri }}
                style={styles.photoImage}
              />
              <Text style={styles.photoLabel}>Tu Foto</Text>
            </View>
          )}
          {formData.fotoGrua && (
            <View style={styles.photoPreview}>
              <Image
                source={{ uri: formData.fotoGrua.uri }}
                style={styles.photoImage}
              />
              <Text style={styles.photoLabel}>Grúa</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📄 Documentos Subidos</Text>
        <DocumentRow
          icon="card"
          label="Licencia de Conducir"
          date={formData.licenciaVencimiento}
        />
        <DocumentRow
          icon="shield-checkmark"
          label="Seguro Obligatorio"
          date={formData.seguroVencimiento}
        />
        <DocumentRow
          icon="construct"
          label="Revisión Técnica"
          date={formData.revisionVencimiento}
        />
        <DocumentRow
          icon="document-attach"
          label="Permiso de Circulación"
          date={formData.permisoVencimiento}
        />
      </View>

      <View style={styles.warningBox}>
        <Ionicons name="time-outline" size={24} color="#f59e0b" />
        <Text style={styles.warningText}>
          Tus documentos serán revisados por nuestro equipo. La verificación puede tomar hasta 48 horas.
        </Text>
      </View>

      <View style={styles.buttonRow}>
        <Button
          title="Atrás"
          onPress={prevStep}
          variant="outline"
          style={styles.buttonHalf}
          disabled={loading}
        />
        <Button
          title={loading ? 'Registrando...' : 'Finalizar Registro'}
          onPress={handleRegister}
          loading={loading}
          style={styles.buttonHalf}
        />
      </View>
    </ScrollView>
  );
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const DocumentRow = ({ icon, label, date }: { icon: string; label: string; date: string }) => (
  <View style={styles.documentRow}>
    <Ionicons name={icon as any} size={20} color={colors.success} />
    <View style={styles.documentRowContent}>
      <Text style={styles.documentRowLabel}>{label}</Text>
      <Text style={styles.documentRowDate}>Vence: {date}</Text>
    </View>
    <Ionicons name="checkmark-circle" size={20} color={colors.success} />
  </View>
);

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
  section: {
    backgroundColor: '#fff',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.secondary,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  infoValue: {
    fontSize: fontSize.sm,
    color: colors.secondary,
    fontWeight: '600',
  },
  photosRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  photoPreview: {
    flex: 1,
    alignItems: 'center',
  },
  photoImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  photoLabel: {
    marginTop: spacing.xs,
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  documentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  documentRowContent: {
    flex: 1,
  },
  documentRowLabel: {
    fontSize: fontSize.sm,
    color: colors.secondary,
    fontWeight: '600',
  },
  documentRowDate: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    marginVertical: spacing.lg,
  },
  warningText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: '#92400e',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  buttonHalf: {
    flex: 1,
  },
});