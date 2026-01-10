import { PrismaClient } from '@prisma/client';
import { Request } from 'express';

const prisma = new PrismaClient();

export enum SecurityEventType {
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  REGISTER_FAILED = 'REGISTER_FAILED',
  REGISTER_SUCCESS = 'REGISTER_SUCCESS',
  PASSWORD_CHANGE_FAILED = 'PASSWORD_CHANGE_FAILED',
  PASSWORD_CHANGE_SUCCESS = 'PASSWORD_CHANGE_SUCCESS',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_REQUEST = 'SUSPICIOUS_REQUEST',
  XSS_ATTEMPT = 'XSS_ATTEMPT',
  SQL_INJECTION_ATTEMPT = 'SQL_INJECTION_ATTEMPT',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  ACCOUNT_DELETED = 'ACCOUNT_DELETED',
  ACCOUNT_SUSPENDED = 'ACCOUNT_SUSPENDED',
}

export enum SecurityLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  DANGER = 'DANGER',
  CRITICAL = 'CRITICAL',
}

interface LogSecurityEventParams {
  tipo: SecurityEventType;
  nivel: SecurityLevel;
  req: Request;
  userId?: string;
  email?: string;
  mensaje: string;
  metadata?: any;
  statusCode?: number;
}

export class SecurityLogService {
  /**
   * Registrar evento de seguridad
   */
  static async log({
    tipo,
    nivel,
    req,
    userId,
    email,
    mensaje,
    metadata,
    statusCode,
  }: LogSecurityEventParams): Promise<void> {
    try {
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.get('user-agent') || null;
      const endpoint = req.path;
      const method = req.method;

      await prisma.securityLog.create({
        data: {
          tipo,
          nivel,
          ip,
          userAgent,
          userId,
          email,
          endpoint,
          method,
          statusCode,
          mensaje,
          metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
        },
      });

      // Log en consola con colores según nivel
      const emoji = {
        INFO: 'ℹ️',
        WARNING: '⚠️',
        DANGER: '🚨',
        CRITICAL: '🔴',
      }[nivel];

      console.log(`${emoji} [SECURITY] [${nivel}] ${tipo}: ${mensaje}`, {
        ip,
        endpoint,
        userId: userId || 'anónimo',
      });

      // Si es crítico, enviar alerta (implementar según necesidad)
      if (nivel === SecurityLevel.CRITICAL) {
        await this.sendCriticalAlert({
          tipo,
          ip,
          endpoint,
          mensaje,
          userId,
        });
      }
    } catch (error) {
      console.error('❌ Error al registrar log de seguridad:', error);
    }
  }

  /**
   * Obtener logs de seguridad con filtros
   */
  static async getLogs(filters: {
    tipo?: SecurityEventType;
    nivel?: SecurityLevel;
    ip?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    try {
      const where: any = {};

      if (filters.tipo) where.tipo = filters.tipo;
      if (filters.nivel) where.nivel = filters.nivel;
      if (filters.ip) where.ip = filters.ip;
      if (filters.userId) where.userId = filters.userId;
      if (filters.startDate || filters.endDate) {
        where.createdAt = {};
        if (filters.startDate) where.createdAt.gte = filters.startDate;
        if (filters.endDate) where.createdAt.lte = filters.endDate;
      }

      const [logs, total] = await Promise.all([
        prisma.securityLog.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: filters.limit || 50,
          skip: filters.offset || 0,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                nombre: true,
                apellido: true,
                role: true,
              },
            },
          },
        }),
        prisma.securityLog.count({ where }),
      ]);

      return { logs, total };
    } catch (error) {
      console.error('❌ Error al obtener logs:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de seguridad
   */
  static async getStats(days: number = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const stats = await prisma.securityLog.groupBy({
        by: ['tipo', 'nivel'],
        where: {
          createdAt: {
            gte: startDate,
          },
        },
        _count: true,
      });

      // Obtener IPs más activas
      const topIPs = await prisma.securityLog.groupBy({
        by: ['ip'],
        where: {
          createdAt: { gte: startDate },
          nivel: { in: ['DANGER', 'CRITICAL'] },
        },
        _count: true,
        orderBy: {
          _count: {
            ip: 'desc',
          },
        },
        take: 10,
      });

      return {
        stats,
        topIPs,
        period: `${days} días`,
      };
    } catch (error) {
      console.error('❌ Error al obtener estadísticas:', error);
      throw error;
    }
  }

  /**
   * Verificar si una IP está comprometida
   */
  static async isIPCompromised(ip: string, minutes: number = 15): Promise<boolean> {
    try {
      const startDate = new Date();
      startDate.setMinutes(startDate.getMinutes() - minutes);

      const count = await prisma.securityLog.count({
        where: {
          ip,
          nivel: { in: ['DANGER', 'CRITICAL'] },
          createdAt: { gte: startDate },
        },
      });

      // Si hay más de 5 eventos peligrosos en 15 minutos, considerar IP comprometida
      return count >= 5;
    } catch (error) {
      console.error('❌ Error al verificar IP:', error);
      return false;
    }
  }

  /**
   * Limpiar logs antiguos (ejecutar en cron)
   */
  static async cleanOldLogs(daysToKeep: number = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await prisma.securityLog.deleteMany({
        where: {
          createdAt: { lt: cutoffDate },
          nivel: { notIn: ['DANGER', 'CRITICAL'] }, // Mantener logs críticos por más tiempo
        },
      });

      console.log(`🧹 Logs antiguos limpiados: ${result.count} registros eliminados`);
      return result.count;
    } catch (error) {
      console.error('❌ Error al limpiar logs:', error);
      throw error;
    }
  }

  /**
   * Enviar alerta crítica (implementar según necesidad)
   */
  private static async sendCriticalAlert(data: {
    tipo: SecurityEventType;
    ip: string;
    endpoint: string;
    mensaje: string;
    userId?: string;
  }) {
    // TODO: Implementar envío de email/slack/telegram para alertas críticas
    console.error('🔴🔴🔴 ALERTA CRÍTICA DE SEGURIDAD 🔴🔴🔴', data);
  }
}