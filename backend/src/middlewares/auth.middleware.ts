import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../utils/jwt';
import { JWTPayload, UserRole } from '../types';

// Extender el tipo Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export class AuthMiddleware {
  /**
   * Verifica que el usuario esté autenticado
   */
  static authenticate(req: Request, res: Response, next: NextFunction): void {
    try {
      const token = JWTService.extractTokenFromHeader(req.headers.authorization);
      
      if (!token) {
        res.status(401).json({
          success: false,
          message: 'Token no proporcionado',
        });
        return;
      }
      
      const decoded = JWTService.verifyToken(token);
      req.user = decoded;
      
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Token inválido o expirado',
      });
      return;
    }
  }
  
  /**
   * Verifica que el usuario tenga un rol específico
   */
  static authorize(...allowedRoles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
        });
        return;
      }
      
      if (!allowedRoles.includes(req.user.role)) {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este recurso',
        });
        return;
      }
      
      next();
    };
  }
}