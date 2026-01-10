import { PrismaClient } from '@prisma/client';
import { Request } from 'express';

const prisma = new PrismaClient();

export class IPBlacklistService {
  /**
   * Verificar si una IP está en whitelist
   */
  static async isWhitelisted(ip: string): Promise<boolean> {
    try {
      const whitelist = await prisma.iPWhitelist.findUnique({
        where: { ip },
      });
      return !!whitelist;
    } catch (error) {
      console.error('Error verificando whitelist:', error);
      return false;
    }
  }

  /**
   * Verificar si una IP está bloqueada
   */
  static async isBlocked(ip: string): Promise<boolean> {
    try {
      // Si está en whitelist, nunca está bloqueada
      if (await this.isWhitelisted(ip)) {
        return false;
      }

      const blacklist = await prisma.iPBlacklist.findUnique({
        where: { ip },
      });

      if (!blacklist) return false;

      // Si es permanente, está bloqueada
      if (blacklist.permanente) return true;

      // Si no está desbloqueada, está bloqueada
      if (!blacklist.desbloqueadoAt) return true;

      // Si ya fue desbloqueada, no está bloqueada
      return false;
    } catch (error) {
      console.error('Error verificando blacklist:', error);
      return false;
    }
  }

  /**
   * Bloquear una IP automáticamente
   */
  static async autoBlock(ip: string, razon: string = 'AUTO_BLOCKED'): Promise<void> {
    try {
      // No bloquear si está en whitelist
      if (await this.isWhitelisted(ip)) {
        console.log(`⚪ IP ${ip} está en whitelist - no se bloqueará`);
        return;
      }

      // Verificar si ya existe
      const existing = await prisma.iPBlacklist.findUnique({
        where: { ip },
      });

      if (existing) {
        // Incrementar intentos
        await prisma.iPBlacklist.update({
          where: { ip },
          data: {
            intentos: existing.intentos + 1,
            bloqueadoAt: new Date(),
            desbloqueadoAt: null, // Resetear desbloqueo
          },
        });
        console.log(`🚫 IP ${ip} bloqueada nuevamente. Intentos: ${existing.intentos + 1}`);
      } else {
        // Crear nuevo bloqueo
        await prisma.iPBlacklist.create({
          data: {
            ip,
            razon,
            intentos: 1,
            permanente: false,
          },
        });
        console.log(`🚫 IP ${ip} bloqueada automáticamente. Razón: ${razon}`);
      }
    } catch (error) {
      console.error('Error bloqueando IP:', error);
    }
  }

  /**
   * Bloquear IP manualmente (admin)
   */
  static async blockIP(
    ip: string,
    razon: string,
    permanente: boolean = false,
    notas?: string,
    adminId?: string
  ): Promise<void> {
    try {
      await prisma.iPBlacklist.upsert({
        where: { ip },
        update: {
          razon,
          permanente,
          notas,
          createdBy: adminId,
          bloqueadoAt: new Date(),
          desbloqueadoAt: null,
        },
        create: {
          ip,
          razon,
          permanente,
          notas,
          createdBy: adminId,
          intentos: 0,
        },
      });
      console.log(`🚫 IP ${ip} bloqueada manualmente por admin`);
    } catch (error) {
      console.error('Error bloqueando IP manualmente:', error);
      throw error;
    }
  }

  /**
   * Desbloquear IP
   */
  static async unblockIP(ip: string): Promise<void> {
    try {
      await prisma.iPBlacklist.update({
        where: { ip },
        data: {
          desbloqueadoAt: new Date(),
        },
      });
      console.log(`✅ IP ${ip} desbloqueada`);
    } catch (error) {
      console.error('Error desbloqueando IP:', error);
      throw error;
    }
  }

  /**
   * Eliminar IP de blacklist
   */
  static async removeIP(ip: string): Promise<void> {
    try {
      await prisma.iPBlacklist.delete({
        where: { ip },
      });
      console.log(`🗑️ IP ${ip} eliminada de blacklist`);
    } catch (error) {
      console.error('Error eliminando IP de blacklist:', error);
      throw error;
    }
  }

  /**
   * Agregar IP a whitelist
   */
  static async addToWhitelist(
    ip: string,
    descripcion: string,
    adminId: string
  ): Promise<void> {
    try {
      await prisma.iPWhitelist.create({
        data: {
          ip,
          descripcion,
          createdBy: adminId,
        },
      });
      console.log(`⚪ IP ${ip} agregada a whitelist`);
    } catch (error) {
      console.error('Error agregando IP a whitelist:', error);
      throw error;
    }
  }

  /**
   * Eliminar IP de whitelist
   */
  static async removeFromWhitelist(ip: string): Promise<void> {
    try {
      await prisma.iPWhitelist.delete({
        where: { ip },
      });
      console.log(`🗑️ IP ${ip} eliminada de whitelist`);
    } catch (error) {
      console.error('Error eliminando IP de whitelist:', error);
      throw error;
    }
  }

  /**
   * Obtener lista de IPs bloqueadas
   */
  static async getBlacklist(includeUnblocked: boolean = false) {
    try {
      const where: any = {};
      if (!includeUnblocked) {
        where.desbloqueadoAt = null;
      }

      const blacklist = await prisma.iPBlacklist.findMany({
        where,
        orderBy: { bloqueadoAt: 'desc' },
      });
      
      return blacklist;
    } catch (error) {
      console.error('Error obteniendo blacklist:', error);
      throw error;
    }
  }

  /**
   * Obtener lista de IPs whitelisted
   */
  static async getWhitelist() {
    try {
      const whitelist = await prisma.iPWhitelist.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return whitelist;
    } catch (error) {
      console.error('Error obteniendo whitelist:', error);
      throw error;
    }
  }

  /**
   * Desbloquear automáticamente IPs antiguas (ejecutar en cron)
   */
  static async autoUnblockOldIPs(hoursToKeep: number = 24) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - hoursToKeep);

      const result = await prisma.iPBlacklist.updateMany({
        where: {
          bloqueadoAt: { lt: cutoffDate },
          permanente: false,
          desbloqueadoAt: null,
        },
        data: {
          desbloqueadoAt: new Date(),
        },
      });

      if (result.count > 0) {
        console.log(`🔓 ${result.count} IPs desbloqueadas automáticamente (>24hrs)`);
      }

      return result.count;
    } catch (error) {
      console.error('Error desbloqueando IPs antiguas:', error);
      throw error;
    }
  }

  /**
   * Obtener detalles de una IP bloqueada
   */
  static async getIPDetails(ip: string) {
    try {
      const [blacklist, whitelist] = await Promise.all([
        prisma.iPBlacklist.findUnique({ where: { ip } }),
        prisma.iPWhitelist.findUnique({ where: { ip } }),
      ]);

      return {
        ip,
        inBlacklist: !!blacklist,
        inWhitelist: !!whitelist,
        blacklistDetails: blacklist,
        whitelistDetails: whitelist,
      };
    } catch (error) {
      console.error('Error obteniendo detalles de IP:', error);
      throw error;
    }
  }
}