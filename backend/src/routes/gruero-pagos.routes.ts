import { Router } from 'express';
import { GrueroPagosController } from '../controllers/gruero-pagos.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.get('/pendientes', AuthMiddleware.authenticate, GrueroPagosController.obtenerPendientes);
router.get('/historial', AuthMiddleware.authenticate, GrueroPagosController.obtenerHistorial);
router.get('/resumen', AuthMiddleware.authenticate, GrueroPagosController.obtenerResumen);

export default router;