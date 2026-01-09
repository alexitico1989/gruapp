import rateLimit from 'express-rate-limit';

/**
 * Rate limiter general para todas las rutas
 * Previene spam y ataques DDoS
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 requests por IP
  message: {
    success: false,
    message: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter estricto para login
 * Previene ataques de fuerza bruta en credenciales
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo 5 intentos de login
  skipSuccessfulRequests: true, // No contar logins exitosos
  message: {
    success: false,
    message: 'Demasiados intentos de inicio de sesión. Por favor intenta de nuevo en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter para registro
 * Previene creación masiva de cuentas
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // Máximo 3 registros por hora
  message: {
    success: false,
    message: 'Demasiados registros desde esta IP. Por favor intenta de nuevo en 1 hora.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter para APIs sensibles (pagos, cambio de contraseña, etc)
 */
export const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Máximo 10 requests
  message: {
    success: false,
    message: 'Demasiadas peticiones a esta operación sensible. Por favor intenta de nuevo más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter para webhooks (Mercado Pago, etc)
 * Más permisivo pero con límite
 */
export const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 30, // Máximo 30 webhooks por minuto
  message: {
    success: false,
    message: 'Demasiados webhooks recibidos'
  },
  standardHeaders: true,
  legacyHeaders: false,
});