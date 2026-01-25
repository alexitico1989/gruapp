// src/screens/auth/ResetPasswordScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import api from '../../services/api';
import Toast from 'react-native-toast-message';
import { colors, spacing, fontSize } from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';


// Definir stack de AuthNavigator
type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  VerifyCode: { email: string };
  ResetPassword: { email: string; code: string };
};

type ResetPasswordScreenProp = NativeStackNavigationProp<AuthStackParamList, 'ResetPassword'>;

export default function ResetPasswordScreen() {
  const navigation = useNavigation<ResetPasswordScreenProp>();
  const route = useRoute<any>();
  const { email, code } = route.params;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [validations, setValidations] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
    passwordsMatch: false,
  });

  useEffect(() => {
    setValidations({
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[@$!%*?&]/.test(password),
      passwordsMatch: password === confirmPassword && password.length > 0,
    });
  }, [password, confirmPassword]);

  const allValid = Object.values(validations).every((v) => v);

  const handleSubmit = async () => {
    if (!allValid) {
      Toast.show({ type: 'error', text1: 'Completa todos los requisitos de la contraseña' });
      return;
    }

    try {
      setLoading(true);

      const response = await api.post('/auth/reset-password', {
        email,
        code,
        newPassword: password,
      });

      if (response.data.success) {
        Toast.show({ type: 'success', text1: 'Contraseña actualizada exitosamente' });
        navigation.navigate('Login');
      }
    } catch (error: any) {
      Toast.show({ type: 'error', text1: error.response?.data?.message || 'Error al cambiar contraseña' });
    } finally {
      setLoading(false);
    }
  };

  const ValidationItem = ({ text, isValid }: { text: string; isValid: boolean }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: isValid ? '#d1fae5' : '#e5e7eb',
          marginRight: 8,
        }}
      >
        {isValid && <Text style={{ color: '#047857', fontWeight: 'bold' }}>✓</Text>}
      </View>
      <Text style={{ color: isValid ? '#065f46' : '#6b7280', fontSize: fontSize.sm }}>{text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <View style={styles.content}>
          <Text style={styles.title}>Nueva Contraseña</Text>
          <Text style={styles.subtitle}>Crea una contraseña segura para tu cuenta</Text>

          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Nueva contraseña"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!loading}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
              <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#9ca3af" />

            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Confirmar contraseña"
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              editable={!loading}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeButton}>
              <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={24} color="#9ca3af" />

            </TouchableOpacity>
          </View>

          <View style={{ marginVertical: spacing.md }}>
            <ValidationItem text="Mínimo 8 caracteres" isValid={validations.minLength} />
            <ValidationItem text="Una letra mayúscula" isValid={validations.hasUpperCase} />
            <ValidationItem text="Una letra minúscula" isValid={validations.hasLowerCase} />
            <ValidationItem text="Un número" isValid={validations.hasNumber} />
            <ValidationItem text="Un carácter especial (@$!%*?&)" isValid={validations.hasSpecialChar} />
            <ValidationItem text="Las contraseñas coinciden" isValid={validations.passwordsMatch} />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading || !allValid}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Cambiar Contraseña</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.backText}>Volver al inicio de sesión</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  keyboardView: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  title: { fontSize: fontSize.xxl, fontWeight: 'bold', color: colors.secondary, marginBottom: spacing.sm, textAlign: 'center' },
  subtitle: { fontSize: fontSize.md, color: colors.text.secondary, marginBottom: spacing.lg, textAlign: 'center' },
  inputContainer: { position: 'relative', marginBottom: spacing.md },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md, paddingRight: 40 },
  eyeButton: { position: 'absolute', right: 10, top: '50%', transform: [{ translateY: -10 }] },
  button: { backgroundColor: colors.primary, padding: spacing.md, borderRadius: 8, alignItems: 'center', marginBottom: spacing.md },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: fontSize.md },
  backText: { color: colors.text.secondary, textAlign: 'center', marginBottom: spacing.sm },
});
