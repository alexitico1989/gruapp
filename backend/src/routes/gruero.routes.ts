import { Router } from 'express';
import { GrueroController } from '../controllers/gruero.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { handleValidationErrors } from '../middlewares/validation.middleware';
import {
  updateGrueroPerfilValidation,
  updateVehiculoValidation,
  updateDisponibilidadValidation,
  updateLocationValidation,
} from '../validators/perfil.validator';

const router = Router();

// Todas las rutas requieren autenticación
router.use(AuthMiddleware.authenticate);

/**
 * GET /api/gruero/perfil
 * Obtener perfil del gruero autenticado
 */
router.get(
  '/perfil',
  AuthMiddleware.authorize('GRUERO'),
  GrueroController.getPerfil
);

/**
 * PATCH /api/gruero/perfil
 * Actualizar información personal del gruero
 */
router.patch(
  '/perfil',
  AuthMiddleware.authorize('GRUERO'),
  updateGrueroPerfilValidation,
  handleValidationErrors,
  GrueroController.updatePerfil
);

/**
 * PATCH /api/gruero/vehiculo
 * Actualizar información del vehículo
 */
router.patch(
  '/vehiculo',
  AuthMiddleware.authorize('GRUERO'),
  updateVehiculoValidation,
  handleValidationErrors,
  GrueroController.updateVehiculo
);

/**
 * PATCH /api/gruero/disponibilidad
 * Actualizar disponibilidad del gruero
 */
router.patch(
  '/disponibilidad',
  AuthMiddleware.authorize('GRUERO'),
  updateDisponibilidadValidation,
  handleValidationErrors,
  GrueroController.updateDisponibilidad
);

/**
 * PUT /api/gruero/location
 * Actualizar ubicación y estado del gruero
 */
router.put(
  '/location',
  AuthMiddleware.authorize('GRUERO'),
  updateLocationValidation,
  handleValidationErrors,
  GrueroController.updateLocation
);

/**
 * GET /api/gruero/disponibles
 * Obtener grueros disponibles cercanos
 */
router.get('/disponibles', GrueroController.getGruerosDisponibles);

/**
 * GET /api/gruero/estadisticas
 * Obtener estadísticas del gruero autenticado
 */
router.get(
  '/estadisticas',
  AuthMiddleware.authorize('GRUERO'),
  GrueroController.getEstadisticas
);

/**
 * GET /api/gruero/historial
 * Obtener historial de servicios del gruero
 */
router.get(
  '/historial',
  AuthMiddleware.authorize('GRUERO'),
  GrueroController.getHistorial
);

/**
 * DELETE /api/gruero/cuenta
 * Eliminar cuenta del gruero
 */
router.delete(
  '/cuenta',
  AuthMiddleware.authorize('GRUERO'),
  GrueroController.eliminarCuenta
);

export default router;