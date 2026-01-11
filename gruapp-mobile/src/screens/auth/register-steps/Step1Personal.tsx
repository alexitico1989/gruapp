import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { colors, spacing, fontSize } from '../../../theme/colors';
import { FormData } from '../RegisterGrueroMultiStep';

interface Props {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  nextStep: () => void;
}

export default function Step1Personal({ formData, updateFormData, nextStep }: Props) {
  const [errors, setErrors] = useState<any>({});

  const validate = () => {
    const newErrors: any = {};
    let valid = true;

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

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
      valid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = 'Mínimo 8 caracteres';
      valid = false;
    }

    setErrors(newErrors);

    if (!valid) {
      Alert.alert('Error', 'Por favor completa todos los campos correctamente');
    }

    return valid;
  };

  const handleNext = () => {
    if (validate()) {
      nextStep();
    }
  };

  return (
    <View>
      <Text style={styles.title}>Datos Personales</Text>
      <Text style={styles.subtitle}>
        Ingresa tus datos personales para crear tu cuenta de gruero
      </Text>

      <Input
        label="Nombre"
        placeholder="Juan"
        value={formData.nombre}
        onChangeText={(value) => updateFormData({ nombre: value })}
        icon="person"
        error={errors.nombre}
      />

      <Input
        label="Apellido"
        placeholder="Pérez"
        value={formData.apellido}
        onChangeText={(value) => updateFormData({ apellido: value })}
        icon="person-outline"
        error={errors.apellido}
      />

      <Input
        label="RUT"
        placeholder="12345678-9"
        value={formData.rut}
        onChangeText={(value) => updateFormData({ rut: value })}
        icon="card"
        error={errors.rut}
      />

      <Input
        label="Correo Electrónico"
        placeholder="tu@email.com"
        value={formData.email}
        onChangeText={(value) => updateFormData({ email: value })}
        keyboardType="email-address"
        autoCapitalize="none"
        icon="mail"
        error={errors.email}
      />

      <Input
        label="Teléfono"
        placeholder="+56912345678"
        value={formData.telefono}
        onChangeText={(value) => updateFormData({ telefono: value })}
        keyboardType="phone-pad"
        icon="call"
        error={errors.telefono}
      />

      <Input
        label="Contraseña"
        placeholder="••••••••"
        value={formData.password}
        onChangeText={(value) => updateFormData({ password: value })}
        isPassword
        icon="lock-closed"
        error={errors.password}
      />

      <View style={styles.requirements}>
        <Text style={styles.requirementsText}>
          • Mínimo 8 caracteres{'\n'}
          • Una mayúscula y minúscula{'\n'}
          • Un número y carácter especial
        </Text>
      </View>

      <Button
        title="Siguiente"
        onPress={handleNext}
        style={styles.button}
      />
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
  requirements: {
    backgroundColor: '#f0f9ff',
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  requirementsText: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  button: {
    marginTop: spacing.md,
  },
});