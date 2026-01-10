import { Request, Response, NextFunction } from 'express';
import { SecurityLogService, SecurityEventType, SecurityLevel } from '../services/securityLog.service';

/**
 * Middleware para loggear intentos de login
 * Se debe usar DESPUÉS del handler de login para capturar el resultado
 */
export const logLoginAttempt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Guardar el método original res.json
  const originalJson = res.json.bind(res);

  // Sobrescribir res.json para interceptar la respuesta
  res.json = function (body: any) {
    const statusCode = res.statusCode;
    const email = req.body.email;

    // Si el login fue exitoso (200)
    if (statusCode === 200 && body.success) {
      SecurityLogService.log({
        tipo: SecurityEventType.LOGIN_SUCCESS,
        nivel: SecurityLevel.INFO,
        req,
        userId: body.data?.user?.id,
        email,
        mensaje: `Login exitoso: ${email}`,
        statusCode,
      });
    }
    // Si el login falló (401, 400, etc)
    else if (statusCode >= 400) {
      SecurityLogService.log({
        tipo: SecurityEventType.LOGIN_FAILED,
        nivel: statusCode === 401 ? SecurityLevel.WARNING : SecurityLevel.INFO,
        req,
        email,
        mensaje: `Login fallido: ${email} - ${body.message || 'Credenciales inválidas'}`,
        statusCode,
        metadata: {
          error: body.message,
        },
      });
    }

    // Llamar al método original
    return originalJson(body);
  };

  next();
};

/**
 * Middleware para loggear intentos de registro
 */
export const logRegisterAttempt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const originalJson = res.json.bind(res);

  res.json = function (body: any) {
    const statusCode = res.statusCode;
    const email = req.body.email;
    const nombre = req.body.nombre;

    if (statusCode === 201 && body.success) {
      SecurityLogService.log({
        tipo: SecurityEventType.REGISTER_SUCCESS,
        nivel: SecurityLevel.INFO,
        req,
        userId: body.data?.user?.id,
        email,
        mensaje: `Registro exitoso: ${nombre} (${email})`,
        statusCode,
      });
    } else if (statusCode >= 400) {
      SecurityLogService.log({
        tipo: SecurityEventType.REGISTER_FAILED,
        nivel: SecurityLevel.INFO,
        req,
        email,
        mensaje: `Registro fallido: ${email} - ${body.message || 'Error'}`,
        statusCode,
        metadata: {
          error: body.message,
          nombre,
        },
      });
    }

    return originalJson(body);
  };

  next();
};

/**
 * Middleware para loggear cambios de contraseña
 */
export const logPasswordChange = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const originalJson = res.json.bind(res);

  res.json = function (body: any) {
    const statusCode = res.statusCode;
    const user = (req as any).user;

    if (statusCode === 200 && body.success) {
      SecurityLogService.log({
        tipo: SecurityEventType.PASSWORD_CHANGE_SUCCESS,
        nivel: SecurityLevel.INFO,
        req,
        userId: user?.userId,
        email: user?.email,
        mensaje: `Contraseña cambiada exitosamente`,
        statusCode,
      });
    } else if (statusCode >= 400) {
      SecurityLogService.log({
        tipo: SecurityEventType.PASSWORD_CHANGE_FAILED,
        nivel: SecurityLevel.WARNING,
        req,
        userId: user?.userId,
        email: user?.email,
        mensaje: `Intento fallido de cambio de contraseña`,
        statusCode,
      });
    }

    return originalJson(body);
  };

  next();
};

/**
 * Middleware para loggear rate limit exceeded
 */
export const logRateLimitExceeded = (req: Request, res: Response) => {
  SecurityLogService.log({
    tipo: SecurityEventType.RATE_LIMIT_EXCEEDED,
    nivel: SecurityLevel.DANGER,
    req,
    userId: (req as any).user?.userId,
    email: req.body.email,
    mensaje: 'Rate limit excedido',
    statusCode: 429,
    metadata: {
      endpoint: req.path,
      method: req.method,
    },
  });
};

/**
 * Middleware para loggear accesos no autorizados
 */
export const logUnauthorizedAccess = (req: Request, mensaje: string = 'Acceso no autorizado') => {
  SecurityLogService.log({
    tipo: SecurityEventType.UNAUTHORIZED_ACCESS,
    nivel: SecurityLevel.WARNING,
    req,
    userId: (req as any).user?.userId,
    mensaje,
    statusCode: 403,
  });
};