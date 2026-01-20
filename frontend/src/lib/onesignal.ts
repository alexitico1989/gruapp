/**
 * OneSignal Push Notifications Service
 * Maneja las notificaciones push para GruApp
 */

import OneSignal from 'react-onesignal';

const ONESIGNAL_APP_ID = '6bd4669f-3b51-4f2c-9ca8-fcbb321e7365';

/**
 * Inicializar OneSignal
 */
export const initOneSignal = async (): Promise<void> => {
  try {
    await OneSignal.init({
      appId: ONESIGNAL_APP_ID,
      allowLocalhostAsSecureOrigin: true,
      notifyButton: {
        enable: false,
      },
      promptOptions: {
        slidedown: {
          prompts: [
            {
              type: 'push',
              autoPrompt: false, // ✅ DESACTIVADO - Se solicitará manualmente
              text: {
                actionMessage: '¿Quieres recibir notificaciones de servicios?',
                acceptButton: 'Permitir',
                cancelButton: 'Ahora no',
              },
            },
          ],
        },
      },
    });

    console.log('✅ OneSignal inicializado correctamente');

    OneSignal.Notifications.addEventListener('permissionChange', (permission) => {
      console.log('🔔 Permiso de notificaciones:', permission);
    });

    OneSignal.Notifications.addEventListener('click', (event) => {
      console.log('🔔 Notificación clickeada:', event);
    });

  } catch (error) {
    console.error('❌ Error inicializando OneSignal:', error);
  }
};

/**
 * Solicitar permisos de notificaciones manualmente
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    console.log('🔔 Solicitando permisos de notificación...');
    
    // Verificar si Notification API está disponible
    if (!('Notification' in window)) {
      console.error('❌ Notification API no disponible en este navegador');
      alert('Tu navegador no soporta notificaciones push');
      return false;
    }
    
    // Verificar permiso actual
    console.log('🔔 Permiso actual:', Notification.permission);
    
    if (Notification.permission === 'granted') {
      console.log('✅ Permisos ya otorgados');
      return true;
    }
    
    if (Notification.permission === 'denied') {
      console.error('❌ Permisos denegados previamente');
      alert('Has bloqueado las notificaciones. Por favor, actívalas manualmente en la configuración del navegador.');
      return false;
    }
    
    // Solicitar permisos
    console.log('🔔 Solicitando permiso al usuario...');
    const permission = await Notification.requestPermission();
    console.log('🔔 Resultado de permiso:', permission);
    
    if (permission === 'granted') {
      console.log('✅ Permiso otorgado');
      return true;
    } else {
      console.log('❌ Permiso denegado por el usuario');
      return false;
    }
  } catch (error) {
    console.error('❌ Error solicitando permisos:', error);
    alert('Error al solicitar permisos: ' + error);
    return false;
  }
};

/**
 * Verificar si el usuario tiene notificaciones habilitadas
 */
export const isNotificationsEnabled = async (): Promise<boolean> => {
  try {
    const permission = await OneSignal.Notifications.permissionNative;
    return permission === 'granted';
  } catch (error) {
    console.error('❌ Error verificando permisos:', error);
    return false;
  }
};

/**
 * Suscribir usuario y asociar con su ID de GruApp
 */
export const subscribeUser = async (
  userId: string,
  userType: 'CLIENTE' | 'GRUERO',
  userData?: {
    nombre?: string;
    email?: string;
    telefono?: string;
  }
): Promise<string | null> => {
  try {
    console.log('🔔 Suscribiendo usuario a OneSignal...');
    
    // Establecer el External User ID (tu ID de base de datos)
    await OneSignal.login(userId);

    // Agregar tags para segmentación
    await OneSignal.User.addTags({
      userType,
      userId,
      ...(userData?.nombre && { nombre: userData.nombre }),
      ...(userData?.email && { email: userData.email }),
    });

    // Obtener el Player ID de OneSignal
    const playerId = OneSignal.User.PushSubscription.id;
    
    console.log('✅ Usuario suscrito a notificaciones push');
    console.log('   User ID:', userId);
    console.log('   Player ID:', playerId);
    console.log('   Tipo:', userType);

    return playerId;
  } catch (error) {
    console.error('❌ Error suscribiendo usuario:', error);
    return null;
  }
};

/**
 * Desuscribir usuario al cerrar sesión
 */
export const unsubscribeUser = async (): Promise<void> => {
  try {
    await OneSignal.logout();
    console.log('✅ Usuario desuscrito de notificaciones');
  } catch (error) {
    console.error('❌ Error desuscribiendo usuario:', error);
  }
};

/**
 * Obtener el Player ID actual del usuario
 */
export const getPlayerId = (): string | null => {
  try {
    return OneSignal.User.PushSubscription.id;
  } catch (error) {
    console.error('❌ Error obteniendo Player ID:', error);
    return null;
  }
};