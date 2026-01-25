import { Router } from 'express';
import { GrueroPerfilController } from '../controllers/gruero-perfil.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(AuthMiddleware.authenticate);

// Actualizar datos del vehículo
router.put('/vehiculo', GrueroPerfilController.actualizarVehiculo);

// Actualizar cuenta bancaria
router.put('/banco', GrueroPerfilController.actualizarCuentaBancaria);

export default router;