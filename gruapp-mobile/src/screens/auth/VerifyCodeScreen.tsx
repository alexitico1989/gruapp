// src/screens/auth/VerifyCodeScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import api from '../../services/api';
import Toast from 'react-native-toast-message';
import { colors, spacing, fontSize } from '../../theme/colors';

// Definir el stack de AuthNavigator
type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  VerifyCode: { email: string };
  ResetPassword: { email: string; code: string };
  RegisterCliente: undefined;
  RegisterGruero: undefined;
};

// Tipar navigation correctamente
type VerifyCodeScreenProp = NativeStackNavigationProp<AuthStackParamList, 'VerifyCode'>;

export default function VerifyCodeScreen() {
  const navigation = useNavigation<VerifyCodeScreenProp>();
  const route = useRoute<any>();
  const email = route.params?.email;

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!code) {
      Toast.show({ type: 'error', text1: 'Ingresa el código' });
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/auth/verify-code', { email, code });

      if (response.data.success) {
        Toast.show({ type: 'success', text1: 'Código verificado' });

        // ✅ Navegar correctamente tipado a ResetPasswordScreen
        navigation.navigate('ResetPassword', { email, code });
      }
    } catch (error: any) {
      Toast.show({ type: 'error', text1: error.response?.data?.message || 'Código inválido' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <View style={styles.content}>
          <Text style={styles.title}>Ingresa el código de verificación</Text>
          <Text style={styles.subtitle}>El código es válido por 15 minutos</Text>

          <TextInput
            placeholder="Código"
            style={styles.input}
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            editable={!loading}
          />

          <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verificar Código</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>Volver</Text>
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
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md, marginBottom: spacing.md },
  button: { backgroundColor: colors.primary, padding: spacing.md, borderRadius: 8, alignItems: 'center', marginBottom: spacing.md },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: fontSize.md },
  backText: { color: colors.text.secondary, textAlign: 'center', marginBottom: spacing.sm },
});
