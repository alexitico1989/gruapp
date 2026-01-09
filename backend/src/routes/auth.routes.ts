import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { handleValidationErrors } from '../middlewares/validation.middleware';
import {
  registerClienteValidation,
  registerGrueroValidation,
  loginValidation,
} from '../validators/auth.validator';

const router = Router();

/**
 * POST /api/auth/register/cliente
 * Registrar un nuevo cliente
 */
router.post(
  '/register/cliente',
  registerClienteValidation,
  handleValidationErrors,
  AuthController.registerCliente
);

/**
 * POST /api/auth/register/gruero
 * Registrar un nuevo gruero
 */
router.post(
  '/register/gruero',
  registerGrueroValidation,
  handleValidationErrors,
  AuthController.registerGruero
);

/**
 * POST /api/auth/login
 * Login de usuario (cliente o gruero)
 */
router.post(
  '/login',
  loginValidation,
  handleValidationErrors,
  AuthController.login
);

/**
 * GET /api/auth/profile
 * Obtener perfil del usuario autenticado
 */
router.get('/profile', AuthMiddleware.authenticate, AuthController.getProfile);

export default router;