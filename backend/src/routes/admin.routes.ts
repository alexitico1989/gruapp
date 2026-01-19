import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { ReclamoController } from '../controllers/reclamo.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import securityLogRoutes from './securityLog.routes';

const router = Router();

/**
 * POST /api/admin/login
 * Login de administrador
 */
router.post('/login', AdminController.login);

/**
 * GET /api/admin/grueros/pendientes
 * Obtener grueros pendientes de verificación
 */
router.get(
  '/grueros/pendientes',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('ADMIN'),
  AdminController.getGruerosPendientes
);

/**
 * GET /api/admin/grueros/:id/servicios
 * Obtener historial de servicios de un gruero
 */
router.get(
  '/grueros/:id/servicios',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('ADMIN'),
  AdminController.getGrueroServicios
);

/**
 * GET /api/admin/grueros
 * Obtener todos los grueros
 */
router.get(
  '/grueros',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('ADMIN'),
  AdminController.getGrueros
);

/**
 * GET /api/admin/grueros/:id
 * Obtener detalle de un gruero
 */
router.get(
  '/grueros/:id',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('ADMIN'),
  AdminController.getGrueroDetalle
);

/**
 * PATCH /api/admin/grueros/:id/aprobar
 * Aprobar un gruero
 */
router.patch(
  '/grueros/:id/aprobar',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('ADMIN'),
  AdminController.aprobarGruero
);

/**
 * PATCH /api/admin/grueros/:id/rechazar
 * Rechazar un gruero
 */
router.patch(
  '/grueros/:id/rechazar',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('ADMIN'),
  AdminController.rechazarGruero
);

/**
 * PATCH /api/admin/grueros/:id/suspender
 * Suspender cuenta de un gruero
 */
router.patch(
  '/grueros/:id/suspender',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('ADMIN'),
  AdminController.suspenderGruero
);

/**
 * PATCH /api/admin/grueros/:id/reactivar
 * Reactivar cuenta de un gruero
 */
router.patch(
  '/grueros/:id/reactivar',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('ADMIN'),
  AdminController.reactivarGruero
);

/**
 * DELETE /api/admin/grueros/:id
 * Eliminar cuenta de un gruero permanentemente
 */
router.delete(
  '/grueros/:id',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('ADMIN'),
  AdminController.eliminarGruero
);

/**
 * GET /api/admin/clientes/:id/servicios
 * Obtener historial de servicios de un cliente
 */
router.get(
  '/clientes/:id/servicios',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('ADMIN'),
  AdminController.getClienteServicios
);

/**
 * GET /api/admin/clientes/:id
 * Obtener detalle de un cliente
 */
router.get(
  '/clientes/:id',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('ADMIN'),
  AdminController.getClienteDetalle
);

/**
 * PATCH /api/admin/clientes/:id/suspender
 * Suspender cuenta de un cliente
 */
router.patch(
  '/clientes/:id/suspender',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('ADMIN'),
  AdminController.suspenderCliente
);

/**
 * PATCH /api/admin/clientes/:id/reactivar
 * Reactivar cuenta de un cliente
 */
router.patch(
  '/clientes/:id/reactivar',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('ADMIN'),
  AdminController.reactivarCliente
);

/**
 * DELETE /api/admin/clientes/:id
 * Eliminar cuenta de un cliente permanentemente
 */
router.delete(
  '/clientes/:id',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('ADMIN'),
  AdminController.eliminarCliente
);

/**
 * GET /api/admin/clientes
 * Obtener todos los clientes
 */
router.get(
  '/clientes',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('ADMIN'),
  AdminController.getClientes
);

/**
 * ====================================
 * RUTAS FINANCIERAS
 * ====================================
 */

/**
 * GET /api/admin/finanzas/metricas
 * Obtener métricas financieras generales
 */
router.get(
  '/finanzas/metricas',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('ADMIN'),
  AdminController.getMetricasFinancieras
);

/**
 * GET /api/admin/finanzas/ingresos-diarios
 * Obtener ingresos diarios para gráficos
 */
router.get(
  '/finanzas/ingresos-diarios',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('ADMIN'),
  AdminController.getIngresosDiarios
);

/**
 * GET /api/admin/finanzas/por-gruero
 * Obtener estadísticas financieras por gruero
 */
router.get(
  '/finanzas/por-gruero',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('ADMIN'),
  AdminController.getFinanzasPorGruero
);

/**
 * GET /api/admin/finanzas/por-vehiculo
 * Obtener estadísticas financieras por tipo de vehículo
 */
router.get(
  '/finanzas/por-vehiculo',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('ADMIN'),
  AdminController.getFinanzasPorVehiculo
);

/**
 * GET /api/admin/finanzas/transacciones
 * Obtener transacciones recientes con filtros
 */
router.get(
  '/finanzas/transacciones',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('ADMIN'),
  AdminController.getTransacciones
);

/**
 * ====================================
 * RUTAS DE RECLAMOS (ADMIN)
 * ====================================
 */

/**
 * GET /api/admin/reclamos
 * Obtener todos los reclamos con filtros
 */
router.get(
  '/reclamos',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('ADMIN'),
  ReclamoController.getAllReclamos
);

/**
 * GET /api/admin/reclamos/:id
 * Obtener detalle de un reclamo
 */
router.get(
  '/reclamos/:id',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('ADMIN'),
  ReclamoController.getReclamoDetalle
);

/**
 * PATCH /api/admin/reclamos/:id/estado
 * Cambiar estado de un reclamo
 */
router.patch(
  '/reclamos/:id/estado',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('ADMIN'),
  ReclamoController.cambiarEstado
);

/**
 * PATCH /api/admin/reclamos/:id/resolver
 * Resolver un reclamo
 */
router.patch(
  '/reclamos/:id/resolver',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('ADMIN'),
  ReclamoController.resolverReclamo
);

/**
 * PATCH /api/admin/reclamos/:id/rechazar
 * Rechazar un reclamo
 */
router.patch(
  '/reclamos/:id/rechazar',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('ADMIN'),
  ReclamoController.rechazarReclamo
);

/**
 * PATCH /api/admin/reclamos/:id/notas
 * Agregar notas internas a un reclamo
 */
router.patch(
  '/reclamos/:id/notas',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('ADMIN'),
  ReclamoController.agregarNotas
);

/**
 * ====================================
 * RUTAS DE LOGS DE SEGURIDAD
 * ====================================
 */

/**
 * /api/admin/security-logs/*
 * Rutas de logs de seguridad (GET, stats, check-ip, clean)
 */
router.use('/security-logs', securityLogRoutes);

/**
 * ====================================
 * DEBUG / DESARROLLO
 * ====================================
 */

/**
 * POST /api/admin/debug/marcar-pagados
 * Marcar todos los servicios completados como pagados (SOLO DESARROLLO)
 */
router.post(
  '/debug/marcar-pagados',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('ADMIN'),
  AdminController.marcarServiciosPagados
);

/**
 * GET /api/admin/servicios
 * Obtener todos los servicios
 */
router.get(
  '/servicios',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('ADMIN'),
  AdminController.getServicios
);

/**
 * GET /api/admin/estadisticas
 * Obtener estadísticas generales
 */
router.get(
  '/estadisticas',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('ADMIN'),
  AdminController.getEstadisticas
);

export default router;