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

console.log('📌 [GRUERO.ROUTES.TS] Configurando rutas de gruero...');

/**
 * GET /api/gruero/disponibles
 * Obtener grueros disponibles cercanos
 * ⚠️ ANTES del middleware de autenticación global
 */
router.get('/disponibles', (req, res, next) => {
  console.log('🔍 [ROUTE] /disponibles alcanzado');
  next();
}, GrueroController.getGruerosDisponibles);

/**
 * GET /api/gruero/:id/ubicacion
 * Obtener ubicación de un gruero específico
 * ⚠️ Con autenticación individual
 */
router.get('/:id/ubicacion', (req, res, next) => {
  console.log('🔍 [ROUTE] /:id/ubicacion alcanzado, ID:', req.params.id);
  next();
}, AuthMiddleware.authenticate, GrueroController.getUbicacionGruero);

// ============================================
// ✅ A PARTIR DE AQUÍ: Todas las rutas requieren autenticación Y rol GRUERO
// ============================================
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
 * GET /api/gruero/estadisticas
 * Obtener estadísticas del gruero autenticado
 */
router.get(
  '/estadisticas',
  AuthMiddleware.authorize('GRUERO'),
  GrueroController.getEstadisticas
);

/**
 * GET /api/gruero/ganancias
 * Obtener estadísticas detalladas de ganancias
 */
router.get(
  '/ganancias',
  AuthMiddleware.authorize('GRUERO'),
  GrueroController.getGanancias
);

/**
 * GET /api/gruero/pagos-pendientes
 * Obtener pagos pendientes y historial
 */
router.get(
  '/pagos-pendientes',
  AuthMiddleware.authorize('GRUERO'),
  GrueroController.getPagosPendientes
);

/**
 * PUT /api/gruero/cuenta-bancaria
 * Actualizar datos de cuenta bancaria
 */
router.put(
  '/cuenta-bancaria',
  AuthMiddleware.authorize('GRUERO'),
  GrueroController.updateCuentaBancaria
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

console.log('✅ [GRUERO.ROUTES.TS] Rutas de gruero configuradas');

export default router;
