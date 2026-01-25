// src/screens/auth/ForgotPasswordScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import api from '../../services/api';
import Toast from 'react-native-toast-message';
import { colors, spacing, fontSize } from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';


type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  VerifyCode: { email: string };
};

type ForgotPasswordScreenProp = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<ForgotPasswordScreenProp>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      Toast.show({ type: 'error', text1: 'Ingresa tu email' });
      return;
    }

    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      Toast.show({ type: 'error', text1: 'Email inválido' });
      return;
    }

    try {
      setLoading(true);

      const response = await api.post('/auth/forgot-password', { email });

      if (response.data.success) {
        Toast.show({ type: 'success', text1: 'Código enviado a tu email' });
        navigation.navigate('VerifyCode', { email });
      }
    } catch (error: any) {
      Toast.show({ type: 'error', text1: error.response?.data?.message || 'Error al enviar el código' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <View style={styles.content}>
          <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
          <Text style={styles.subtitle}>Ingresa tu email y te enviaremos un código de verificación</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="mail" size={20} color="#9ca3af" style={styles.icon} />

            <TextInput
              placeholder="tu@email.com"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Enviar Código</Text>}
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
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.md, marginBottom: spacing.md },
  icon: { marginRight: 8 },
  input: { flex: 1, height: 48 },
  button: { backgroundColor: colors.primary, padding: spacing.md, borderRadius: 8, alignItems: 'center', marginBottom: spacing.md },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: fontSize.md },
  backText: { color: colors.text.secondary, textAlign: 'center', marginBottom: spacing.sm },
});
