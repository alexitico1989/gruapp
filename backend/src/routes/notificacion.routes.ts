import { Router } from 'express';
import { NotificacionController } from '../controllers/notificacion.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(AuthMiddleware.authenticate);

// Obtener notificaciones del usuario
router.get('/', NotificacionController.getNotificaciones);

// Obtener contador de notificaciones no leídas
router.get('/contador', NotificacionController.getContadorNoLeidas);

// Marcar notificación como leída
router.patch('/:id/leida', NotificacionController.marcarLeida);

// Marcar todas como leídas
router.patch('/marcar-todas-leidas', NotificacionController.marcarTodasLeidas);

// Eliminar notificación
router.delete('/:id', NotificacionController.deleteNotificacion);

export default router;