import rateLimit from 'express-rate-limit';

/**
 * Rate limiter general para todas las rutas
 * Ajustado para uso real en producción
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // ✅ AUMENTADO: 1000 requests por IP (uso normal)
  message: {
    success: false,
    message: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter para login
 * Mantiene protección contra fuerza bruta pero más permisivo
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // ✅ AUMENTADO: 20 intentos (antes 5)
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
 * Ajustado para permitir más registros legítimos
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // ✅ AUMENTADO: 10 registros por hora (antes 3)
  message: {
    success: false,
    message: 'Demasiados registros desde esta IP. Por favor intenta de nuevo en 1 hora.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter para APIs sensibles (pagos, cambio de contraseña, etc)
 * Más permisivo para uso legítimo
 */
export const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 50, // ✅ AUMENTADO: 50 requests (antes 10)
  message: {
    success: false,
    message: 'Demasiadas peticiones a esta operación sensible. Por favor intenta de nuevo más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter para webhooks (Mercado Pago, etc)
 * Mantiene límite razonable
 */
export const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // ✅ AUMENTADO: 100 webhooks por minuto (antes 30)
  message: {
    success: false,
    message: 'Demasiados webhooks recibidos'
  },
  standardHeaders: true,
  legacyHeaders: false,
});