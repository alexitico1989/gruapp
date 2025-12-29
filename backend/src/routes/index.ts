import { Router } from 'express';
import authRoutes from './auth.routes';
import servicioRoutes from './servicio.routes';
import grueroRoutes from './gruero.routes';
import calificacionRoutes from './calificacion.routes';
import adminRoutes from './admin.routes';

const router = Router();

// Montar las rutas
router.use('/auth', authRoutes);
router.use('/servicios', servicioRoutes);
router.use('/gruero', grueroRoutes);
router.use('/calificaciones', calificacionRoutes);
router.use('/admin', adminRoutes);

// Ruta de health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
  });
});

export default router;