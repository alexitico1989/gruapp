import { Router } from 'express';
import { GrueroPagosController } from '../controllers/gruero-pagos.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas de pagos del gruero
router.get('/pendientes', GrueroPagosController.obtenerPendientes);
router.get('/historial', GrueroPagosController.obtenerHistorial);
router.get('/resumen', GrueroPagosController.obtenerResumen);

export default router;