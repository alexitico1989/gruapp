import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
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

export default function RegisterClienteScreen() {
  const navigation = useNavigation();
  const { setAuth } = useAuthStore();

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
  });

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Limpiar error del campo al escribir
    setErrors({ ...errors, [field]: '' });
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      password: '',
      confirmPassword: '',
    };

    // Validar nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
      valid = false;
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = 'Mínimo 2 caracteres';
      valid = false;
    }

    // Validar apellido
    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido';
      valid = false;
    } else if (formData.apellido.trim().length < 2) {
      newErrors.apellido = 'Mínimo 2 caracteres';
      valid = false;
    }

    // Validar email
    if (!formData.email) {
      newErrors.email = 'El email es requerido';
      valid = false;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Email inválido';
      valid = false;
    }

    // Validar teléfono
    if (!formData.telefono) {
      newErrors.telefono = 'El teléfono es requerido';
      valid = false;
    } else if (!/^\+?56\d{9}$/.test(formData.telefono.replace(/\s/g, ''))) {
      newErrors.telefono = 'Formato: +56912345678';
      valid = false;
    }

    // Validar password
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
      valid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = 'Mínimo 8 caracteres';
      valid = false;
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Debe contener una mayúscula';
      valid = false;
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = 'Debe contener una minúscula';
      valid = false;
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Debe contener un número';
      valid = false;
    } else if (!/[@$!%*?&]/.test(formData.password)) {
      newErrors.password = 'Debe contener un carácter especial';
      valid = false;
    }

    // Validar confirmación
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
      valid = false;
    } else if (formData.password !== formData.confirmPassword) {
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

      const response = await api.post('/auth/register/cliente', {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.toLowerCase().trim(),
        telefono: formData.telefono.replace(/\s/g, ''),
        password: formData.password,
      });

      if (response.data.success) {
        // Guardar auth
        await setAuth(response.data.data.user, response.data.data.token);

        Alert.alert(
          '¡Registro Exitoso!',
          'Tu cuenta ha sido creada correctamente',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('Error registro:', error.response?.data);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Error al registrar cuenta'
      );
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
        {/* Header con botón volver */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Registro Cliente</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Título */}
          <View style={styles.header}>
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>
              Completa tus datos para registrarte como cliente
            </Text>
          </View>

          {/* Formulario */}
          <View style={styles.form}>
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

            {/* Info de requisitos */}
            <View style={styles.requirements}>
              <Text style={styles.requirementsTitle}>
                La contraseña debe contener:
              </Text>
              <Text style={styles.requirementItem}>• Mínimo 8 caracteres</Text>
              <Text style={styles.requirementItem}>• Una letra mayúscula</Text>
              <Text style={styles.requirementItem}>• Una letra minúscula</Text>
              <Text style={styles.requirementItem}>• Un número</Text>
              <Text style={styles.requirementItem}>
                • Un carácter especial (@$!%*?&)
              </Text>
            </View>

            <Button
              title="Crear Cuenta"
              onPress={handleRegister}
              loading={loading}
              style={styles.registerButton}
            />
          </View>

          {/* Footer */}
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
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: 'bold',
    color: colors.secondary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  form: {
    marginBottom: spacing.lg,
  },
  requirements: {
    backgroundColor: '#f0f9ff',
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
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
    marginLeft: spacing.xs,
  },
  registerButton: {
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
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