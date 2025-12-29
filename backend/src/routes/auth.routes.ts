import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/**
 * POST /api/auth/register/cliente
 * Registrar un nuevo cliente
 */
router.post('/register/cliente', AuthController.registerCliente);

/**
 * POST /api/auth/register/gruero
 * Registrar un nuevo gruero
 */
router.post('/register/gruero', AuthController.registerGruero);

/**
 * POST /api/auth/login
 * Login de usuario (cliente o gruero)
 */
router.post('/login', AuthController.login);

/**
 * GET /api/auth/profile
 * Obtener perfil del usuario autenticado
 */
router.get('/profile', AuthMiddleware.authenticate, AuthController.getProfile);

export default router;