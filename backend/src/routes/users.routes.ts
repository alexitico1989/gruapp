import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/users/:userId/onesignal
 * Guardar OneSignal Player ID del gruero (para web)
 */
router.post('/:userId/onesignal', async (req, res) => {
  try {
    const { userId } = req.params;
    const { playerId, notificationsEnabled } = req.body;

    console.log('🔔 Guardando Player ID de OneSignal:', { userId, playerId });

    // Actualizar el gruero con el Player ID
    const gruero = await prisma.gruero.update({
      where: { userId },
      data: {
        oneSignalPlayerId: playerId,
        notificationsEnabled: notificationsEnabled !== undefined ? notificationsEnabled : true,
      },
    });

    console.log('✅ Player ID guardado exitosamente');

    return res.status(200).json({
      success: true,
      message: 'Player ID guardado correctamente',
      data: {
        oneSignalPlayerId: gruero.oneSignalPlayerId,
        notificationsEnabled: gruero.notificationsEnabled,
      },
    });
  } catch (error: any) {
    console.error('❌ Error guardando Player ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al guardar Player ID',
      error: error.message,
    });
  }
});

/**
 * POST /api/users/:userId/push-token
 * Guardar Expo Push Token (para app móvil)
 */
router.post('/:userId/push-token', async (req, res) => {
  try {
    const { userId } = req.params;
    const { pushToken, userType } = req.body;

    if (!pushToken || !userType) {
      return res.status(400).json({ 
        success: false, 
        message: 'pushToken y userType son requeridos' 
      });
    }

    console.log('📱 Guardando push token:', { userId, userType, pushToken: pushToken.substring(0, 20) + '...' });

    if (userType === 'GRUERO') {
      await prisma.gruero.update({
        where: { userId },
        data: { expoPushToken: pushToken }
      });
      console.log('✅ Push token guardado para gruero:', userId);
    } else if (userType === 'CLIENTE') {
      await prisma.cliente.update({
        where: { userId },
        data: { expoPushToken: pushToken }
      });
      console.log('✅ Push token guardado para cliente:', userId);
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'userType debe ser GRUERO o CLIENTE' 
      });
    }

   return res.json({ 
      success: true, 
      message: 'Push token guardado exitosamente' 
    });
  } catch (error: any) {
    console.error('❌ Error guardando push token:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;