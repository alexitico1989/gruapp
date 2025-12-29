import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class NotificacionController {
  /**
   * Obtener notificaciones del usuario autenticado
   */
  static async getNotificaciones(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const soloNoLeidas = req.query.soloNoLeidas === 'true';
      
      const whereClause: any = { userId };
      
      if (soloNoLeidas) {
        whereClause.leida = false;
      }
      
      const notificaciones = await prisma.notificacion.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
      
      return res.status(200).json({
        success: true,
        data: notificaciones,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener notificaciones',
        error: error.message,
      });
    }
  }
  
  /**
   * Marcar notificación como leída
   */
  static async marcarLeida(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      
      // Verificar que la notificación pertenece al usuario
      const notificacion = await prisma.notificacion.findUnique({
        where: { id },
      });
      
      if (!notificacion) {
        return res.status(404).json({
          success: false,
          message: 'Notificación no encontrada',
        });
      }
      
      if (notificacion.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para marcar esta notificación',
        });
      }
      
      const notificacionActualizada = await prisma.notificacion.update({
        where: { id },
        data: { leida: true },
      });
      
      return res.status(200).json({
        success: true,
        data: notificacionActualizada,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error al marcar notificación',
        error: error.message,
      });
    }
  }
  
  /**
   * Marcar todas las notificaciones como leídas
   */
  static async marcarTodasLeidas(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      
      await prisma.notificacion.updateMany({
        where: {
          userId,
          leida: false,
        },
        data: { leida: true },
      });
      
      return res.status(200).json({
        success: true,
        message: 'Todas las notificaciones marcadas como leídas',
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error al marcar notificaciones',
        error: error.message,
      });
    }
  }
  
  /**
   * Obtener contador de notificaciones no leídas
   */
  static async getContadorNoLeidas(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      
      const count = await prisma.notificacion.count({
        where: {
          userId,
          leida: false,
        },
      });
      
      return res.status(200).json({
        success: true,
        data: { count },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener contador',
        error: error.message,
      });
    }
  }
  
  /**
   * Eliminar una notificación
   */
  static async deleteNotificacion(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      
      // Verificar que la notificación pertenece al usuario
      const notificacion = await prisma.notificacion.findUnique({
        where: { id },
      });
      
      if (!notificacion) {
        return res.status(404).json({
          success: false,
          message: 'Notificación no encontrada',
        });
      }
      
      if (notificacion.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para eliminar esta notificación',
        });
      }
      
      await prisma.notificacion.delete({
        where: { id },
      });
      
      return res.status(200).json({
        success: true,
        message: 'Notificación eliminada',
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error al eliminar notificación',
        error: error.message,
      });
    }
  }
  
  /**
   * Crear una notificación (uso interno)
   */
  static async crearNotificacion(
    userId: string,
    tipo: string,
    titulo: string,
    mensaje: string,
    data?: any
  ) {
    try {
      const notificacion = await prisma.notificacion.create({
        data: {
          userId,
          tipo,
          titulo,
          mensaje,
          data: data ? JSON.stringify(data) : null,
        },
      });
      
      return notificacion;
    } catch (error) {
      console.error('Error al crear notificación:', error);
      return null;
    }
  }
}