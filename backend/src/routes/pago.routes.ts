import { Router } from 'express';
import { PagoController } from '../controllers/pago.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/**
 * POST /api/pagos/crear-preferencia
 * Crear preferencia de pago para un servicio
 * Requiere autenticación de CLIENTE
 */
router.post(
  '/crear-preferencia',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('CLIENTE'),
  PagoController.crearPreferencia
);

/**
 * POST /api/pagos/webhook
 * Webhook de Mercado Pago (NO requiere autenticación)
 */
router.post('/webhook', PagoController.webhook);

/**
 * GET /api/pagos/estado/:servicioId
 * Verificar estado de pago de un servicio
 * Requiere autenticación de CLIENTE
 */
router.get(
  '/estado/:servicioId',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('CLIENTE'),
  PagoController.verificarEstado
);

/**
 * GET /api/pagos/historial
 * Obtener historial de pagos del cliente autenticado
 * Requiere autenticación de CLIENTE
 */
router.get(
  '/historial',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('CLIENTE'),
  PagoController.obtenerHistorial
);

/**
 * GET /api/pagos/detalle/:servicioId
 * Obtener detalle completo de un pago
 * Requiere autenticación de CLIENTE
 */
router.get(
  '/detalle/:servicioId',
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize('CLIENTE'),
  PagoController.obtenerDetalle
);

export default router;