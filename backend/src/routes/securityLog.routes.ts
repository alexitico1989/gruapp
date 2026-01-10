import { Router } from 'express';
import { SecurityLogController } from '../controllers/securityLog.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación y rol ADMIN
router.use(AuthMiddleware.authenticate);
router.use(AuthMiddleware.authorize('ADMIN'));

/**
 * GET /api/admin/security-logs
 * Obtener logs de seguridad con filtros
 * Query params:
 * - tipo: SecurityEventType (LOGIN_FAILED, LOGIN_SUCCESS, etc)
 * - nivel: SecurityLevel (INFO, WARNING, DANGER, CRITICAL)
 * - ip: string
 * - userId: string
 * - startDate: ISO date
 * - endDate: ISO date
 * - limit: number (default: 50)
 * - offset: number (default: 0)
 */
router.get('/', SecurityLogController.getLogs);

/**
 * GET /api/admin/security-logs/stats
 * Obtener estadísticas de seguridad
 * Query params:
 * - days: number (default: 7)
 */
router.get('/stats', SecurityLogController.getStats);

/**
 * GET /api/admin/security-logs/check-ip/:ip
 * Verificar si una IP está comprometida
 * Params:
 * - ip: string
 * Query params:
 * - minutes: number (default: 15)
 */
router.get('/check-ip/:ip', SecurityLogController.checkIP);

/**
 * DELETE /api/admin/security-logs/clean
 * Limpiar logs antiguos
 * Query params:
 * - days: number (default: 90) - Mantener logs de últimos X días
 */
router.delete('/clean', SecurityLogController.cleanOldLogs);

export default router;