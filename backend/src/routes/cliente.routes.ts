import express from 'express';
import { ClienteController } from '../controllers/cliente.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(AuthMiddleware.authenticate);

// Perfil
router.get('/perfil', ClienteController.getPerfil);
router.patch('/perfil', ClienteController.updatePerfil);
router.patch('/password', ClienteController.cambiarPassword);

// Pagos
router.get('/pagos', ClienteController.getPagos);

// Estadísticas
router.get('/estadisticas', ClienteController.getEstadisticas);

// Cuenta
router.delete('/cuenta', ClienteController.eliminarCuenta);

export default router;