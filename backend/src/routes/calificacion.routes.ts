import { Router } from 'express';
import { CalificacionController } from '../controllers/calificacion.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(AuthMiddleware.authenticate);

/**
 * POST /api/calificaciones
 * Crear calificación para un servicio completado
 */
router.post('/', CalificacionController.crearCalificacion);

/**
 * GET /api/calificaciones/gruero/:grueroId
 * Obtener calificaciones de un gruero
 */
router.get('/gruero/:grueroId', CalificacionController.getCalificacionesGruero);

/**
 * GET /api/calificaciones/servicio/:servicioId
 * Obtener calificación de un servicio específico
 */
router.get('/servicio/:servicioId', CalificacionController.getCalificacionServicio);

export default router;