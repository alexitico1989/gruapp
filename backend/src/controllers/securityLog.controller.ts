import { Request, Response } from 'express';
import { SecurityLogService, SecurityEventType, SecurityLevel } from '../services/securityLog.service';

export class SecurityLogController {
  /**
   * GET /api/admin/security-logs
   * Obtener logs de seguridad con filtros
   */
  static async getLogs(req: Request, res: Response) {
    try {
      const {
        tipo,
        nivel,
        ip,
        userId,
        startDate,
        endDate,
        limit,
        offset,
      } = req.query;

      const filters: any = {
        limit: limit ? parseInt(limit as string) : 50,
        offset: offset ? parseInt(offset as string) : 0,
      };

      if (tipo) filters.tipo = tipo as SecurityEventType;
      if (nivel) filters.nivel = nivel as SecurityLevel;
      if (ip) filters.ip = ip as string;
      if (userId) filters.userId = userId as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const result = await SecurityLogService.getLogs(filters);

      res.json({
        success: true,
        data: result.logs,
        total: result.total,
        limit: filters.limit,
        offset: filters.offset,
      });
    } catch (error: any) {
      console.error('Error al obtener logs de seguridad:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener logs de seguridad',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/admin/security-logs/stats
   * Obtener estadísticas de seguridad
   */
  static async getStats(req: Request, res: Response) {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 7;
      const stats = await SecurityLogService.getStats(days);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/admin/security-logs/check-ip/:ip
   * Verificar si una IP está comprometida
   */
  static async checkIP(req: Request, res: Response) {
    try {
      const { ip } = req.params;
      const minutes = req.query.minutes ? parseInt(req.query.minutes as string) : 15;

      const isCompromised = await SecurityLogService.isIPCompromised(ip, minutes);

      res.json({
        success: true,
        data: {
          ip,
          compromised: isCompromised,
          period: `${minutes} minutos`,
        },
      });
    } catch (error: any) {
      console.error('Error al verificar IP:', error);
      res.status(500).json({
        success: false,
        message: 'Error al verificar IP',
        error: error.message,
      });
    }
  }

  /**
   * DELETE /api/admin/security-logs/clean
   * Limpiar logs antiguos
   */
  static async cleanOldLogs(req: Request, res: Response) {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 90;
      const deletedCount = await SecurityLogService.cleanOldLogs(days);

      res.json({
        success: true,
        message: `${deletedCount} logs antiguos eliminados`,
        data: {
          deletedCount,
          daysKept: days,
        },
      });
    } catch (error: any) {
      console.error('Error al limpiar logs:', error);
      res.status(500).json({
        success: false,
        message: 'Error al limpiar logs',
        error: error.message,
      });
    }
  }
}