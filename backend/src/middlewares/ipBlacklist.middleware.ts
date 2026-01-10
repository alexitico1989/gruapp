import { Request, Response, NextFunction } from 'express';
import { IPBlacklistService } from '../services/ipBlacklist.service';
import { SecurityLogService, SecurityEventType, SecurityLevel } from '../services/securityLog.service';

/**
 * Middleware para verificar si una IP está bloqueada
 * Debe ir ANTES de cualquier otro middleware de rutas
 */
export const checkIPBlacklist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

    // Verificar si la IP está bloqueada
    const isBlocked = await IPBlacklistService.isBlocked(ip);

    if (isBlocked) {
      console.warn(`🚫 Request bloqueada de IP en blacklist: ${ip}`);

      // Registrar intento de acceso desde IP bloqueada
      await SecurityLogService.log({
        tipo: SecurityEventType.SUSPICIOUS_REQUEST,
        nivel: SecurityLevel.DANGER,
        req,
        mensaje: `Intento de acceso desde IP bloqueada: ${ip}`,
        statusCode: 403,
      });

      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Tu IP ha sido bloqueada por actividad sospechosa.',
        error: 'IP_BLOCKED',
      });
    }

    next();
  } catch (error) {
    console.error('Error verificando IP blacklist:', error);
    // En caso de error, permitir el request (fail-open)
    next();
  }
};

/**
 * Middleware para registrar intentos fallidos y auto-bloquear
 * Usar después de handlers que fallan (login, etc)
 */
export const trackFailedAttempt = async (req: Request, res: Response) => {
  try {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

    // Contar intentos fallidos recientes de esta IP
    const recentFailures = await SecurityLogService.getLogs({
      ip,
      tipo: SecurityEventType.LOGIN_FAILED,
      startDate: new Date(Date.now() - 15 * 60 * 1000), // Últimos 15 minutos
      limit: 10,
    });

    const failureCount = recentFailures.total;

    console.log(`⚠️ IP ${ip} - Intentos fallidos recientes: ${failureCount}`);

    // Si hay 5 o más intentos fallidos en 15 minutos, bloquear
    if (failureCount >= 5) {
      await IPBlacklistService.autoBlock(
        ip,
        `AUTO_BLOCKED - ${failureCount} intentos fallidos en 15 minutos`
      );

      // Log crítico de bloqueo automático
      await SecurityLogService.log({
        tipo: SecurityEventType.RATE_LIMIT_EXCEEDED,
        nivel: SecurityLevel.CRITICAL,
        req,
        mensaje: `IP bloqueada automáticamente - ${failureCount} intentos fallidos`,
        statusCode: 429,
        metadata: {
          failureCount,
          reason: 'AUTO_BLOCK',
        },
      });
    }
  } catch (error) {
    console.error('Error rastreando intento fallido:', error);
  }
};

/**
 * Wrapper para agregar tracking de intentos fallidos a endpoints de login
 */
export const withFailureTracking = (
  handler: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Guardar el método original res.json
    const originalJson = res.json.bind(res);

    // Sobrescribir res.json para interceptar respuestas
    res.json = function (body: any) {
      const statusCode = res.statusCode;

      // Si es un login fallido (401, 400, etc), trackear
      if (statusCode >= 400 && statusCode < 500) {
        // Ejecutar tracking sin esperar (async)
        trackFailedAttempt(req, res).catch((err) =>
          console.error('Error en trackFailedAttempt:', err)
        );
      }

      // Llamar al método original
      return originalJson(body);
    };

    // Ejecutar el handler original
    await handler(req, res, next);
  };
};

/**
 * Middleware para verificar y alertar sobre IPs con múltiples intentos
 */
export const checkSuspiciousActivity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

    // Verificar si la IP está comprometida
    const isCompromised = await SecurityLogService.isIPCompromised(ip, 15);

    if (isCompromised) {
      console.warn(`⚠️ IP sospechosa detectada: ${ip}`);

      // Log de advertencia (no bloquear aún, solo alertar)
      await SecurityLogService.log({
        tipo: SecurityEventType.SUSPICIOUS_REQUEST,
        nivel: SecurityLevel.WARNING,
        req,
        mensaje: `IP con actividad sospechosa detectada: ${ip}`,
        statusCode: res.statusCode,
      });
    }

    next();
  } catch (error) {
    console.error('Error verificando actividad sospechosa:', error);
    next();
  }
};