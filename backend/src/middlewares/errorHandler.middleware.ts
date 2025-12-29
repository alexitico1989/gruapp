import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export class ErrorHandlerMiddleware {
  static handle(error: any, req: Request, res: Response, next: NextFunction) {
    console.error('Error:', error);
    
    // Error de validación de Prisma
    if (error instanceof Prisma.PrismaClientValidationError) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación en los datos',
        error: error.message,
      });
    }
    
    // Error de constraint único (email duplicado, etc)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res.status(409).json({
          success: false,
          message: 'Ya existe un registro con estos datos',
          field: error.meta?.target,
        });
      }
      
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'Registro no encontrado',
        });
      }
    }
    
    // Error de JWT
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido',
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado',
      });
    }
    
    // Error genérico
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Error interno del servidor';
    
    return res.status(statusCode).json({
      success: false,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
  }
}