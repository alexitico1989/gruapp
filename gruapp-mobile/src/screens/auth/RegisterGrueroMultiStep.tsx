import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize } from '../../theme/colors';

// Importar pasos
import Step1Personal from './register-steps/Step1Personal';
import Step2Vehiculo from './register-steps/Step2Vehiculo';
import Step3Fotos from './register-steps/Step3Fotos';
import Step4Documentos from './register-steps/Step4Documentos';
import Step5Confirmacion from './register-steps/Step5Confirmacion';

export interface FormData {
  // Paso 1
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  rut: string;
  password: string;
  // Paso 2
  patente: string;
  marca: string;
  modelo: string;
  anio: string;
  capacidadToneladas: string;
  tipoGrua: string;
  // Paso 3
  fotoGruero: any;
  fotoGrua: any;
  // Paso 4
  licenciaConducir: any;
  licenciaVencimiento: string;
  seguroVigente: any;
  seguroVencimiento: string;
  revisionTecnica: any;
  revisionVencimiento: string;
  permisoCirculacion: any;
  permisoVencimiento: string;
}

export default function RegisterGrueroMultiStep() {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    rut: '',
    password: '',
    patente: '',
    marca: '',
    modelo: '',
    anio: '',
    capacidadToneladas: '',
    tipoGrua: 'CAMA_BAJA',
    fotoGruero: null,
    fotoGrua: null,
    licenciaConducir: null,
    licenciaVencimiento: '',
    seguroVigente: null,
    seguroVencimiento: '',
    revisionTecnica: null,
    revisionVencimiento: '',
    permisoCirculacion: null,
    permisoVencimiento: '',
  });

  const updateFormData = (data: Partial<FormData>) => {
    setFormData({ ...formData, ...data });
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Datos Personales';
      case 2:
        return 'Datos del Vehículo';
      case 3:
        return 'Fotos';
      case 4:
        return 'Documentos';
      case 5:
        return 'Confirmación';
      default:
        return '';
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Personal
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
          />
        );
      case 2:
        return (
          <Step2Vehiculo
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 3:
        return (
          <Step3Fotos
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 4:
        return (
          <Step4Documentos
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 5:
        return (
          <Step5Confirmacion
            formData={formData}
            prevStep={prevStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (currentStep === 1) {
              navigation.goBack();
            } else {
              prevStep();
            }
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getStepTitle()}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        {[1, 2, 3, 4, 5].map((step) => (
          <View
            key={step}
            style={[
              styles.progressStep,
              currentStep >= step && styles.progressStepActive,
            ]}
          />
        ))}
      </View>
      <Text style={styles.progressText}>
        Paso {currentStep} de 5
      </Text>

      {/* Step Content */}
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {renderStep()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
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
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    backgroundColor: '#fff',
  },
  progressStep: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
  },
  progressStepActive: {
    backgroundColor: colors.primary,
  },
  progressText: {
    textAlign: 'center',
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    paddingVertical: spacing.xs,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  content: {
    padding: spacing.lg,
  },
});