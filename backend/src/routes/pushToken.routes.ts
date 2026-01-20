import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// POST /api/users/:userId/push-token
router.post('/:userId/push-token', async (req: Request, res: Response) => {
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

    res.json({ 
      success: true, 
      message: 'Push token guardado exitosamente' 
    });
  } catch (error: any) {
    console.error('❌ Error guardando push token:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;