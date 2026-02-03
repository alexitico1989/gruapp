import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { colors, spacing, fontSize } from '../../../theme/colors';
import { FormData } from '../RegisterGrueroMultiStep';

interface Props {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export default function Step2Vehiculo({ formData, updateFormData, nextStep, prevStep }: Props) {
  const [errors, setErrors] = useState<any>({});

  const validate = () => {
    const newErrors: any = {};
    let valid = true;

    if (!formData.patente) {
      newErrors.patente = 'La patente es requerida';
      valid = false;
    } else if (!/^[A-Z]{2,4}\d{2,4}$/i.test(formData.patente)) {
  newErrors.patente = 'Formato: AB1234, ABCD12 o ABC123';
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
      <Text style={styles.title}>Datos del Vehículo</Text>
      <Text style={styles.subtitle}>
        Información de tu grúa para prestar servicios
      </Text>

      <Input
        label="Patente"
        placeholder="ABCD12"
        value={formData.patente}
        onChangeText={(value) => updateFormData({ patente: value.toUpperCase() })}
        autoCapitalize="characters"
        maxLength={6}
        icon="document-text"
        error={errors.patente}
      />

      <Input
        label="Marca"
        placeholder="Chevrolet"
        value={formData.marca}
        onChangeText={(value) => updateFormData({ marca: value })}
        icon="car"
        error={errors.marca}
      />

      <Input
        label="Modelo"
        placeholder="NPR"
        value={formData.modelo}
        onChangeText={(value) => updateFormData({ modelo: value })}
        icon="car-sport"
        error={errors.modelo}
      />

      <Input
        label="Año"
        placeholder="2020"
        value={formData.anio}
        onChangeText={(value) => updateFormData({ anio: value })}
        keyboardType="number-pad"
        maxLength={4}
        icon="calendar"
        error={errors.anio}
      />

      <Input
        label="Capacidad (Toneladas)"
        placeholder="3.5"
        value={formData.capacidadToneladas}
        onChangeText={(value) => updateFormData({ capacidadToneladas: value })}
        keyboardType="decimal-pad"
        icon="barbell"
        error={errors.capacidadToneladas}
      />

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Tipo de Grúa</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.tipoGrua}
            onValueChange={(value) => updateFormData({ tipoGrua: value })}
            style={styles.picker}
          >
            <Picker.Item label="Cama Baja" value="CAMA_BAJA" />
            <Picker.Item label="Horquilla" value="HORQUILLA" />
            <Picker.Item label="Pluma" value="PLUMA" />
          </Picker>
        </View>
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
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  buttonHalf: {
    flex: 1,
  },
});