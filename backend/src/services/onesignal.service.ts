import axios from 'axios';

// Verificar configuración al iniciar
if (!process.env.ONESIGNAL_APP_ID || !process.env.ONESIGNAL_API_KEY) {
  console.error('❌ ONESIGNAL_APP_ID o ONESIGNAL_API_KEY no configuradas en .env');
} else {
  console.log('✅ OneSignal configurado correctamente');
}

interface OneSignalNotification {
  userId: string;
  userType: 'CLIENTE' | 'GRUERO';
  titulo: string;
  mensaje: string;
  data?: any;
}

class OneSignalService {
  private readonly APP_ID = process.env.ONESIGNAL_APP_ID!;
  private readonly API_KEY = process.env.ONESIGNAL_API_KEY!;
  private readonly API_URL = 'https://onesignal.com/api/v1/notifications';

  /**
   * Enviar notificación push a un usuario específico
   */
  async sendNotification({
    userId,
    userType,
    titulo,
    mensaje,
    data = {},
  }: OneSignalNotification): Promise<boolean> {
    try {
      // Crear external_user_id único por tipo de usuario
      const externalUserId = `${userType.toLowerCase()}_${userId}`;

      const payload = {
        app_id: this.APP_ID,
        include_external_user_ids: [externalUserId],
        headings: { en: titulo },
        contents: { en: mensaje },
        data: {
          ...data,
          userId,
          userType,
        },
      };

      console.log('📤 Enviando notificación OneSignal:', {
        externalUserId,
        titulo,
        mensaje,
      });

      const response = await axios.post(this.API_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${this.API_KEY}`,
        },
      });

      if (response.data.id) {
        console.log('✅ Notificación OneSignal enviada:', response.data.id);
        return true;
      } else {
        console.error('⚠️ OneSignal no devolvió ID:', response.data);
        return false;
      }
    } catch (error: any) {
      console.error('❌ Error enviando notificación OneSignal:', error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Enviar notificación a múltiples usuarios
   */
  async sendNotificationToMultiple(
    userIds: string[],
    userType: 'CLIENTE' | 'GRUERO',
    titulo: string,
    mensaje: string,
    data: any = {}
  ): Promise<boolean> {
    try {
      // Crear external_user_ids únicos
      const externalUserIds = userIds.map(
        (id) => `${userType.toLowerCase()}_${id}`
      );

      const payload = {
        app_id: this.APP_ID,
        include_external_user_ids: externalUserIds,
        headings: { en: titulo },
        contents: { en: mensaje },
        data: {
          ...data,
          userType,
        },
      };

      console.log(`📤 Enviando notificación a ${externalUserIds.length} usuarios`);

      const response = await axios.post(this.API_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${this.API_KEY}`,
        },
      });

      if (response.data.id) {
        console.log('✅ Notificación masiva enviada:', response.data.id);
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('❌ Error enviando notificación masiva:', error.response?.data || error.message);
      return false;
    }
  }

  /**
   * NOTIFICACIONES ESPECÍFICAS POR TIPO DE EVENTO
   */

  // 🆕 Nuevo servicio disponible (para grueros)
  async notifyNuevoServicio(
    grueroUserId: string,
    servicioId: string,
    tipoVehiculo: string,
    distancia: number
  ) {
    return this.sendNotification({
      userId: grueroUserId,
      userType: 'GRUERO',
      titulo: '🚗 Nuevo servicio disponible',
      mensaje: `Servicio de ${tipoVehiculo} a ${distancia.toFixed(1)}km de distancia`,
      data: {
        tipo: 'NUEVO_SERVICIO',
        servicioId,
        tipoVehiculo,
        distancia,
      },
    });
  }

  // ✅ Servicio aceptado (para cliente)
  async notifyServicioAceptado(
    clienteUserId: string,
    servicioId: string,
    grueroNombre: string
  ) {
    return this.sendNotification({
      userId: clienteUserId,
      userType: 'CLIENTE',
      titulo: '✅ Gruero encontrado',
      mensaje: `${grueroNombre} aceptó tu solicitud`,
      data: {
        tipo: 'SERVICIO_ACEPTADO',
        servicioId,
      },
    });
  }

  // 🚛 Gruero en camino (para cliente)
  async notifyEnCamino(clienteUserId: string, servicioId: string) {
    return this.sendNotification({
      userId: clienteUserId,
      userType: 'CLIENTE',
      titulo: '🚛 Gruero en camino',
      mensaje: 'El gruero está en camino a tu ubicación',
      data: {
        tipo: 'EN_CAMINO',
        servicioId,
      },
    });
  }

  // 📍 Gruero llegó (para cliente)
  async notifyEnSitio(clienteUserId: string, servicioId: string) {
    return this.sendNotification({
      userId: clienteUserId,
      userType: 'CLIENTE',
      titulo: '📍 Gruero ha llegado',
      mensaje: 'El gruero llegó a tu ubicación',
      data: {
        tipo: 'EN_SITIO',
        servicioId,
      },
    });
  }

  // ✅ Servicio completado
  async notifyServicioCompletado(
    clienteUserId: string,
    servicioId: string
  ) {
    return this.sendNotification({
      userId: clienteUserId,
      userType: 'CLIENTE',
      titulo: '✅ Servicio completado',
      mensaje: '¡Tu servicio ha sido completado! Por favor califícanos',
      data: {
        tipo: 'COMPLETADO',
        servicioId,
      },
    });
  }

  // ❌ Servicio cancelado
  async notifyServicioCancelado(
    userId: string,
    userType: 'CLIENTE' | 'GRUERO',
    servicioId: string,
    motivo?: string
  ) {
    return this.sendNotification({
      userId,
      userType,
      titulo: '❌ Servicio cancelado',
      mensaje: motivo || 'El servicio ha sido cancelado',
      data: {
        tipo: 'CANCELADO',
        servicioId,
        motivo,
      },
    });
  }

  // ⭐ Nueva calificación (para gruero)
  async notifyNuevaCalificacion(
    grueroUserId: string,
    servicioId: string,
    calificacion: number
  ) {
    const estrellas = '⭐'.repeat(calificacion);
    return this.sendNotification({
      userId: grueroUserId,
      userType: 'GRUERO',
      titulo: '⭐ Nueva calificación',
      mensaje: `Recibiste ${estrellas} (${calificacion}/5)`,
      data: {
        tipo: 'CALIFICACION',
        servicioId,
        calificacion,
      },
    });
  }

  // 💰 Pago recibido (para gruero)
  async notifyPagoRecibido(
    grueroUserId: string,
    servicioId: string,
    monto: number
  ) {
    return this.sendNotification({
      userId: grueroUserId,
      userType: 'GRUERO',
      titulo: '💰 Pago recibido',
      mensaje: `Recibiste $${monto.toLocaleString('es-CL')} por tu servicio`,
      data: {
        tipo: 'PAGO_RECIBIDO',
        servicioId,
        monto,
      },
    });
  }

  // 📢 Notificación administrativa
  async notifyAdministrativa(
    userId: string,
    userType: 'CLIENTE' | 'GRUERO',
    titulo: string,
    mensaje: string
  ) {
    return this.sendNotification({
      userId,
      userType,
      titulo,
      mensaje,
      data: {
        tipo: 'ADMINISTRATIVA',
      },
    });
  }
}

export default new OneSignalService();