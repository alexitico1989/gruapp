import { Router } from 'express';
import { AdminPagosController } from '../controllers/admin-pagos.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación de admin
router.use(AuthMiddleware.authenticate);

// Rutas de gestión de pagos
router.get('/pendientes', AdminPagosController.obtenerPendientes);
router.post('/marcar-pagado', AdminPagosController.marcarPagado);
router.get('/historial', AdminPagosController.obtenerHistorial);

export default router;