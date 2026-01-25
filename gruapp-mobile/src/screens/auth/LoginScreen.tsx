// src/screens/auth/LoginScreen.tsx

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
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { colors, spacing, fontSize } from '../../theme/colors';
import Toast from 'react-native-toast-message'; // ✅ IMPORTAR TOAST
import { Linking } from 'react-native';


export default function LoginScreen() {
  const navigation = useNavigation();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });

  const validateForm = () => {
    let valid = true;
    const newErrors = { email: '', password: '' };

    // Validar email
    if (!email) {
      newErrors.email = 'El email es requerido';
      valid = false;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      newErrors.email = 'Email inválido';
      valid = false;
    }

    // Validar password
    if (!password) {
      newErrors.password = 'La contraseña es requerida';
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await api.post('/auth/login', { email, password });

      if (response.data.success) {
        await setAuth(response.data.data.user, response.data.data.token);
        
        // ✅ REEMPLAZAR Alert por Toast
        Toast.show({
          type: 'success',
          text2: '¡Bienvenido de vuelta!',
          position: 'top',
          visibilityTime: 2000,
        });
      }
    } catch (error: any) {
      // ✅ REEMPLAZAR Alert por Toast
      Toast.show({
        type: 'error',
        text1: '❌ Error',
        text2: error.response?.data?.message || 'Error al iniciar sesión',
        position: 'top',
        visibilityTime: 3000,
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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Iniciar Sesión</Text>
            <Text style={styles.subtitle}>
              Bienvenido de vuelta a GruApp Chile
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Correo Electrónico"
              placeholder="tu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon="mail"
              error={errors.email}
            />

            <Input
              label="Contraseña"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              isPassword
              icon="lock-closed"
              error={errors.password}
            />

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ForgotPassword' as never)}
            >
              <Text style={styles.forgotPasswordText}>
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>

            <Button
              title="Iniciar Sesión"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginButton}
            />
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>¿No tienes cuenta?</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Register Buttons */}
          <View style={styles.registerButtons}>
            <Button
              title="Registrarme como Cliente"
              onPress={() => navigation.navigate('RegisterCliente' as never)}
              variant="outline"
              style={styles.registerButton}
            />
            <Button
              title="Registrarme como Gruero"
              onPress={() => navigation.navigate('RegisterGruero' as never)}
              variant="secondary"
              style={styles.registerButton}
            />
          </View>

          {/* Footer */}
          <Text style={styles.footer}>
            ¿Problemas para ingresar?{' '}
            <Text
              style={styles.footerLink}
              onPress={() => Linking.openURL('mailto:contacto@gruappchile.cl')}
            >
              Contáctanos
            </Text>
          </Text>
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
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xl,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  forgotPasswordText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  loginButton: {
    marginTop: spacing.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  registerButtons: {
    gap: spacing.md,
  },
  registerButton: {
    marginBottom: spacing.sm,
  },
  footer: {
    textAlign: 'center',
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xl,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: '600',
  },
});