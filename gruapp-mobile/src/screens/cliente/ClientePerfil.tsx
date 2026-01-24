import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { colors, spacing } from '../../theme/colors';
import Toast from 'react-native-toast-message';

interface ClienteData {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  telefono: string;
  rut?: string;
  stats: {
    totalServicios: number;
    serviciosCompletados: number;
    serviciosCancelados: number;
  };
}

interface Props {
  navigation: any;
}

export default function ClientePerfil({ navigation }: Props) {
  const { user, logout } = useAuthStore();
  const [clienteData, setClienteData] = useState<ClienteData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      const response = await api.get('/cliente/perfil');
      if (response.data.success) {
        setClienteData(response.data.data);
      }
    } catch (error: any) {
      console.error('Error cargando perfil:', error.response?.data || error.message);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo cargar el perfil',
        position: 'top',
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Toast.show({
      type: 'error',
      text1: '¿Cerrar Sesión?',
      text2: 'Presiona para confirmar',
      position: 'top',
      visibilityTime: 3000,
      onPress: () => logout(),
    });
  };

  const abrirReclamos = () => {
    navigation.navigate('ClienteReclamos');
  };

  const abrirSoporte = () => {
    Toast.show({
      type: 'info',
      text1: 'Ayuda y Soporte',
      text2: 'Haz click para enviar email',
      position: 'top',
      visibilityTime: 4000,
      onPress: () => {
        Linking.openURL('mailto:contacto@gruappchile.cl').catch(() => {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'No se pudo abrir el cliente de email',
            position: 'top',
            visibilityTime: 3000,
          });
        });
      },
    });
  };

  const abrirTerminos = () => {
    Linking.openURL('https://www.gruappchile.cl/terminos').catch(() => {
      Toast.show({
        type: 'info',
        text1: 'Términos y Condiciones',
        text2: 'Disponible en: www.gruappchile.cl/terminos',
        position: 'top',
        visibilityTime: 4000,
      });
    });
  };

  const abrirPrivacidad = () => {
    Linking.openURL('https://www.gruappchile.cl/privacidad').catch(() => {
      Toast.show({
        type: 'info',
        text1: 'Política de Privacidad',
        text2: 'Disponible en: www.gruappchile.cl/privacidad',
        position: 'top',
        visibilityTime: 4000,
      });
    });
  };

  const mostrarAcercaDe = () => {
    Toast.show({
      type: 'info',
      text1: 'GruApp Cliente v1.0.0',
      text2: '© 2025 AMIA Solutions SPA',
      position: 'top',
      visibilityTime: 4000,
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!clienteData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorText}>Error al cargar el perfil</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Mi Perfil</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={48} color={colors.primary} />
          </View>
          <Text style={styles.nombreCompleto}>
            {clienteData.nombre} {clienteData.apellido}
          </Text>
          <Text style={styles.rolText}>Cliente</Text>
        </View>

        {/* Información Personal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Personal</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={20} color={colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Nombre</Text>
                <Text style={styles.infoValue}>
                  {clienteData.nombre} {clienteData.apellido}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color={colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{clienteData.email}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color={colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Teléfono</Text>
                <Text style={styles.infoValue}>{clienteData.telefono}</Text>
              </View>
            </View>

            {clienteData.rut && (
              <View style={styles.infoRow}>
                <Ionicons name="card-outline" size={20} color={colors.primary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>RUT</Text>
                  <Text style={styles.infoValue}>{clienteData.rut}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Estadísticas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estadísticas</Text>
          
          <View style={styles.statsCard}>
            {/* Total Servicios */}
            <View style={styles.statRow}>
              <View style={styles.statLeft}>
                <View style={[styles.statIcon, { backgroundColor: '#dbeafe' }]}>
                  <Ionicons name="car-sport" size={24} color={colors.primary} />
                </View>
                <Text style={styles.statLabel}>Total Servicios</Text>
              </View>
              <Text style={styles.statValue}>{clienteData.stats.totalServicios}</Text>
            </View>

            {/* Completados */}
            <View style={styles.statRow}>
              <View style={styles.statLeft}>
                <View style={[styles.statIcon, { backgroundColor: '#dcfce7' }]}>
                  <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                </View>
                <Text style={styles.statLabel}>Completados</Text>
              </View>
              <Text style={[styles.statValue, { color: '#10b981' }]}>
                {clienteData.stats.serviciosCompletados}
              </Text>
            </View>

            {/* Cancelados - SIN borderBottom */}
            <View style={[styles.statRow, { borderBottomWidth: 0 }]}>
              <View style={styles.statLeft}>
                <View style={[styles.statIcon, { backgroundColor: '#fee2e2' }]}>
                  <Ionicons name="close-circle" size={24} color="#ef4444" />
                </View>
                <Text style={styles.statLabel}>Cancelados</Text>
              </View>
              <Text style={[styles.statValue, { color: '#ef4444' }]}>
                {clienteData.stats.serviciosCancelados}
              </Text>
            </View>
          </View>
        </View>

        {/* Opciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Opciones</Text>
          
          <View style={styles.optionsCard}>
            {/* Mis Reclamos */}
            <TouchableOpacity style={styles.optionRow} onPress={abrirReclamos}>
              <View style={styles.optionLeft}>
                <Ionicons name="megaphone-outline" size={24} color={colors.text.primary} />
                <Text style={styles.optionText}>Mis Reclamos</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
            </TouchableOpacity>

            {/* ✅ REMOVIDO: Botón de Notificaciones */}

            <TouchableOpacity style={styles.optionRow} onPress={abrirSoporte}>
              <View style={styles.optionLeft}>
                <Ionicons name="help-circle-outline" size={24} color={colors.text.primary} />
                <Text style={styles.optionText}>Ayuda y Soporte</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionRow} onPress={abrirTerminos}>
              <View style={styles.optionLeft}>
                <Ionicons name="document-text-outline" size={24} color={colors.text.primary} />
                <Text style={styles.optionText}>Términos y Condiciones</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionRow} onPress={abrirPrivacidad}>
              <View style={styles.optionLeft}>
                <Ionicons name="shield-checkmark-outline" size={24} color={colors.text.primary} />
                <Text style={styles.optionText}>Política de Privacidad</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.optionRow, { borderBottomWidth: 0 }]} onPress={mostrarAcercaDe}>
              <View style={styles.optionLeft}>
                <Ionicons name="information-circle-outline" size={24} color={colors.text.primary} />
                <Text style={styles.optionText}>Acerca de</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Botón de Cerrar Sesión */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    marginTop: spacing.md,
  },
  header: {
    backgroundColor: '#fff',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  scrollView: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  nombreCompleto: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  rolText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
  },
  section: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.secondary,
    marginBottom: spacing.sm,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: colors.secondary,
    fontWeight: '500',
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  optionsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  optionText: {
    fontSize: 15,
    color: colors.text.primary,
  },
  logoutButton: {
    backgroundColor: colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});