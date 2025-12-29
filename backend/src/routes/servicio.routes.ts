import { Router } from 'express';
import { ServicioController } from '../controllers/servicio.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(AuthMiddleware.authenticate);

/**
 * POST /api/servicios/solicitar
 * Crear una nueva solicitud de servicio (solo clientes)
 */
router.post(
  '/solicitar',
  AuthMiddleware.authorize('CLIENTE'),
  ServicioController.createServicio
);

/**
 * GET /api/servicios/activo
 * Obtener servicio activo del cliente autenticado
 */
router.get(
  '/activo',
  AuthMiddleware.authorize('CLIENTE'),
  ServicioController.getServicioActivo
);

/**
 * GET /api/servicios/historial
 * Obtener historial de servicios del usuario autenticado
 */
router.get('/historial', ServicioController.getHistorialServicios);

/**
 * GET /api/servicios/pendientes
 * Obtener servicios pendientes (para grueros)
 */
router.get(
  '/pendientes',
  AuthMiddleware.authorize('GRUERO'),
  ServicioController.getServiciosPendientes
);

/**
 * GET /api/servicios/mis-servicios
 * Obtener servicios del usuario autenticado
 */
router.get('/mis-servicios', ServicioController.getMisServicios);

/**
 * GET /api/servicios/:id
 * Obtener detalle de un servicio
 */
router.get('/:id', ServicioController.getServicioById);

/**
 * POST /api/servicios/:id/aceptar
 * Gruero acepta un servicio
 */
router.post(
  '/:id/aceptar',
  AuthMiddleware.authorize('GRUERO'),
  ServicioController.acceptServicio
);

/**
 * PATCH /api/servicios/:id/cancelar
 * Cancelar un servicio
 */
router.patch('/:id/cancelar', ServicioController.cancelServicio);

/**
 * POST /api/servicios/:id/calificar
 * Calificar un servicio completado
 */
router.post(
  '/:id/calificar',
  AuthMiddleware.authorize('CLIENTE'),
  ServicioController.calificarServicio
);

/**
 * PATCH /api/servicios/:id/estado
 * Actualizar estado del servicio
 */
router.patch('/:id/estado', ServicioController.updateEstado);

export default router;