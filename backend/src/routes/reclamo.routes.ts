import { Router } from 'express';
import { ReclamoController } from '../controllers/reclamo.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/**
 * POST /api/reclamos
 * Crear un nuevo reclamo
 */
router.post(
  '/',
  AuthMiddleware.authenticate,
  ReclamoController.crearReclamo
);

/**
 * GET /api/reclamos/mis-reclamos
 * Obtener reclamos del usuario autenticado
 */
router.get(
  '/mis-reclamos',
  AuthMiddleware.authenticate,
  ReclamoController.getMisReclamos
);

/**
 * GET /api/reclamos/:id
 * Obtener detalle de un reclamo
 */
router.get(
  '/:id',
  AuthMiddleware.authenticate,
  ReclamoController.getReclamoDetalle
);

export default router;