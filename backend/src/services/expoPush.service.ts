import { Expo, ExpoPushMessage } from 'expo-server-sdk';

const expo = new Expo();

class ExpoPushService {
  /**
   * Enviar notificación push a un gruero usando Expo
   */
  async notifyNuevoServicio(
    expoPushToken: string,
    servicioId: string,
    tipoVehiculo: string,
    distanciaKm: number
  ) {
    try {
      if (!Expo.isExpoPushToken(expoPushToken)) {
        console.error('❌ Token de Expo inválido:', expoPushToken);
        return null;
      }

      const message: ExpoPushMessage = {
        to: expoPushToken,
        sound: 'default',
        title: '🚗 Nuevo servicio disponible',
        body: `Servicio de ${tipoVehiculo} a ${distanciaKm}km de distancia`,
        data: { 
          tipo: 'NUEVO_SERVICIO',
          servicioId,
          tipoVehiculo,
          distanciaKm 
        },
        priority: 'high',
      };

      console.log('📤 Enviando notificación Expo:', { 
        token: expoPushToken.substring(0, 20) + '...', 
        servicioId 
      });

      const chunks = expo.chunkPushNotifications([message]);
      const tickets = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error('❌ Error enviando chunk de notificaciones:', error);
        }
      }

      console.log('✅ Notificación Expo enviada:', tickets);
      return tickets;
    } catch (error: any) {
      console.error('❌ Error en notifyNuevoServicio:', error);
      return null;
    }
  }
}

export default new ExpoPushService();