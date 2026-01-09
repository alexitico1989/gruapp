import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

/**
 * Middleware para manejar errores de validación de express-validator
 * Debe usarse DESPUÉS de las reglas de validación en las rutas
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Log de intento con datos inválidos (seguridad)
    console.warn('⚠️ Validación fallida:', {
      ip: req.ip,
      path: req.path,
      method: req.method,
      errors: errors.array(),
      timestamp: new Date().toISOString(),
    });

    // Formatear errores para respuesta clara
    const formattedErrors = errors.array().map(error => ({
      field: error.type === 'field' ? (error as any).path : 'unknown',
      message: error.msg,
    }));

    res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: formattedErrors,
    });
    return;
  }

  next();
};

// Exportación adicional para compatibilidad
export default handleValidationErrors;