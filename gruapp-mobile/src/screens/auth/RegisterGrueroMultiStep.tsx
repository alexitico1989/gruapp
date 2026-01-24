import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { colors, spacing, fontSize } from '../../theme/colors';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';

export default function RegisterGrueroScreen() {
  const navigation = useNavigation();
  const { setAuth } = useAuthStore();

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    rut: '',
    password: '',
    confirmPassword: '',
    patente: '',
    marca: '',
    modelo: '',
    anio: '',
    capacidadToneladas: '',
    tipoGrua: 'CAMA_BAJA',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: '' });
  };

  const validateForm = () => {
    let valid = true;
    const newErrors: any = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
      valid = false;
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido';
      valid = false;
    }

    if (!formData.email) {
      newErrors.email = 'El email es requerido';
      valid = false;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Email inválido';
      valid = false;
    }

    if (!formData.telefono) {
      newErrors.telefono = 'El teléfono es requerido';
      valid = false;
    }

    if (!formData.rut) {
      newErrors.rut = 'El RUT es requerido';
      valid = false;
    } else if (!/^\d{7,8}-[\dkK]$/.test(formData.rut.replace(/\./g, ''))) {
      newErrors.rut = 'Formato: 12345678-9';
      valid = false;
    }

    if (!formData.patente) {
      newErrors.patente = 'La patente es requerida';
      valid = false;
    } else if (!/^[A-Z]{4}\d{2}$/i.test(formData.patente)) {
      newErrors.patente = 'Formato: ABCD12';
      valid = false;
    }

    if (!formData.marca.trim()) {
      newErrors.marca = 'La marca es requerida';
      valid = false;
    }

    if (!formData.modelo.trim()) {
      newErrors.modelo = 'El modelo es requerido';
      valid = false;
    }

    if (!formData.anio) {
      newErrors.anio = 'El año es requerido';
      valid = false;
    } else {
      const anio = parseInt(formData.anio);
      const currentYear = new Date().getFullYear();
      if (isNaN(anio) || anio < 1990 || anio > currentYear + 1) {
        newErrors.anio = `Entre 1990 y ${currentYear + 1}`;
        valid = false;
      }
    }

    if (!formData.capacidadToneladas) {
      newErrors.capacidadToneladas = 'La capacidad es requerida';
      valid = false;
    } else {
      const capacidad = parseFloat(formData.capacidadToneladas);
      if (isNaN(capacidad) || capacidad < 0.5 || capacidad > 100) {
        newErrors.capacidadToneladas = 'Entre 0.5 y 100 toneladas';
        valid = false;
      }
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
      valid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = 'Mínimo 8 caracteres';
      valid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const response = await api.post('/auth/register/gruero', {
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

      if (response.data.success) {
        await setAuth(response.data.data.user, response.data.data.token);
        
        Toast.show({
          type: 'success',
          text1: 'Registro Exitoso',
          text2: 'Tu cuenta de gruero ha sido creada correctamente',
          position: 'top',
          visibilityTime: 3000,
        });
      }
    } catch (error: any) {
      console.error('Error registro gruero:', error.response?.data);
      
      Toast.show({
        type: 'error',
        text1: 'Error al Registrar',
        text2: error.response?.data?.message || 'No se pudo crear la cuenta',
        position: 'top',
        visibilityTime: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.headerBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Registro Gruero</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Crear Cuenta de Gruero</Text>
            <Text style={styles.subtitle}>
              Completa tus datos para registrarte como conductor
            </Text>
          </View>

          {/* Datos Personales */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Datos Personales</Text>

            <Input
              label="Nombre"
              placeholder="Juan"
              value={formData.nombre}
              onChangeText={(value) => updateField('nombre', value)}
              icon="person"
              error={errors.nombre}
            />

            <Input
              label="Apellido"
              placeholder="Pérez"
              value={formData.apellido}
              onChangeText={(value) => updateField('apellido', value)}
              icon="person-outline"
              error={errors.apellido}
            />

            <Input
              label="RUT"
              placeholder="12345678-9"
              value={formData.rut}
              onChangeText={(value) => updateField('rut', value)}
              icon="card"
              error={errors.rut}
            />

            <Input
              label="Correo Electrónico"
              placeholder="tu@email.com"
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              icon="mail"
              error={errors.email}
            />

            <Input
              label="Teléfono"
              placeholder="+56912345678"
              value={formData.telefono}
              onChangeText={(value) => updateField('telefono', value)}
              keyboardType="phone-pad"
              icon="call"
              error={errors.telefono}
            />
          </View>

          {/* Datos del Vehículo */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Datos del Vehículo</Text>

            <Input
              label="Patente"
              placeholder="ABCD12"
              value={formData.patente}
              onChangeText={(value) => updateField('patente', value.toUpperCase())}
              autoCapitalize="characters"
              maxLength={6}
              icon="document-text"
              error={errors.patente}
            />

            <Input
              label="Marca"
              placeholder="Chevrolet"
              value={formData.marca}
              onChangeText={(value) => updateField('marca', value)}
              icon="car"
              error={errors.marca}
            />

            <Input
              label="Modelo"
              placeholder="NPR"
              value={formData.modelo}
              onChangeText={(value) => updateField('modelo', value)}
              icon="car-sport"
              error={errors.modelo}
            />

            <Input
              label="Año"
              placeholder="2020"
              value={formData.anio}
              onChangeText={(value) => updateField('anio', value)}
              keyboardType="number-pad"
              maxLength={4}
              icon="calendar"
              error={errors.anio}
            />

            <Input
              label="Capacidad (Toneladas)"
              placeholder="3.5"
              value={formData.capacidadToneladas}
              onChangeText={(value) => updateField('capacidadToneladas', value)}
              keyboardType="decimal-pad"
              icon="barbell"
              error={errors.capacidadToneladas}
            />

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Tipo de Grúa</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.tipoGrua}
                  onValueChange={(value) => updateField('tipoGrua', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Cama Baja" value="CAMA_BAJA" />
                  <Picker.Item label="Horquilla" value="HORQUILLA" />
                  <Picker.Item label="Pluma" value="PLUMA" />
                </Picker>
              </View>
            </View>
          </View>

          {/* Contraseña */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contraseña</Text>

            <Input
              label="Contraseña"
              placeholder="••••••••"
              value={formData.password}
              onChangeText={(value) => updateField('password', value)}
              isPassword
              icon="lock-closed"
              error={errors.password}
            />

            <Input
              label="Confirmar Contraseña"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChangeText={(value) => updateField('confirmPassword', value)}
              isPassword
              icon="lock-closed"
              error={errors.confirmPassword}
            />

            <View style={styles.requirements}>
              <Text style={styles.requirementsTitle}>Requisitos:</Text>
              <Text style={styles.requirementItem}>• Mínimo 8 caracteres</Text>
              <Text style={styles.requirementItem}>• Una mayúscula y minúscula</Text>
              <Text style={styles.requirementItem}>• Un número y carácter especial (@$!%*?&)</Text>
            </View>
          </View>

          <Button
            title="Crear Cuenta"
            onPress={handleRegister}
            loading={loading}
            style={styles.registerButton}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.footerLink}>Iniciar Sesión</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.secondary,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.secondary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.secondary,
    marginBottom: spacing.md,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
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
  requirements: {
    backgroundColor: '#f0f9ff',
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.sm,
  },
  requirementsTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.secondary,
    marginBottom: spacing.xs,
  },
  requirementItem: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  registerButton: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  footerLink: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
  },
});