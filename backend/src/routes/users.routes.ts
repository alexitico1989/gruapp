import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/users/:userId/onesignal
 * Guardar OneSignal Player ID del gruero
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

export default router;