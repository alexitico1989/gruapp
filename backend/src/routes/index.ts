import { Router } from 'express';
import authRoutes from './auth.routes';
import servicioRoutes from './servicio.routes';
import grueroRoutes from './gruero.routes';

import calificacionRoutes from './calificacion.routes';
import adminRoutes from './admin.routes';
import usersRoutes from './users.routes';

import grueroPagosRoutes from './gruero-pagos.routes';

const router = Router();

console.log('📌 [INDEX.TS] Configurando rutas...');

// Montar las rutas
router.use('/auth', authRoutes);
router.use('/servicios', servicioRoutes);

// 🔍 Log especial para gruero
router.use('/gruero', (req, res, next) => {
  console.log(`🔍 [GRUERO ROUTE] ${req.method} ${req.path}`);
  next();
}, grueroRoutes);


router.use('/calificaciones', calificacionRoutes);
router.use('/admin', adminRoutes);
router.use('/users', usersRoutes);
router.use('/gruero/pagos', grueroPagosRoutes);

console.log('✅ [INDEX.TS] Rutas configuradas');

// Ruta de health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
  });
});

export default router;