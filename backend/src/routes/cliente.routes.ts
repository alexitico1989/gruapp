import express from 'express';
import { ClienteController } from '../controllers/cliente.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { handleValidationErrors } from '../middlewares/validation.middleware';
import { updateClientePerfilValidation } from '../validators/perfil.validator';
import { changePasswordValidation } from '../validators/auth.validator';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(AuthMiddleware.authenticate);

// Perfil
router.get('/perfil', ClienteController.getPerfil);

router.patch(
  '/perfil',
  updateClientePerfilValidation,
  handleValidationErrors,
  ClienteController.updatePerfil
);

router.patch(
  '/password',
  changePasswordValidation,
  handleValidationErrors,
  ClienteController.cambiarPassword
);

// Pagos
router.get('/pagos', ClienteController.getPagos);

// Estadísticas
router.get('/estadisticas', ClienteController.getEstadisticas);

// Cuenta
router.delete('/cuenta', ClienteController.eliminarCuenta);

export default router;