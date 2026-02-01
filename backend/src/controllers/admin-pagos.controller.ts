import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AdminPagosController {
  /**
   * GET /api/admin/pagos/pendientes
   * Obtener todos los grueros con pagos pendientes
   */
  static async obtenerPendientes(req: Request, res: Response) {
    try {
      // Calcular inicio y fin de la semana actual
      const now = new Date();
      const dayOfWeek = now.getDay();
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      
      const inicioSemana = new Date(now);
      inicioSemana.setDate(now.getDate() + diffToMonday);
      inicioSemana.setHours(0, 0, 0, 0);

      const finSemana = new Date(inicioSemana);
      finSemana.setDate(inicioSemana.getDate() + 6);
      finSemana.setHours(23, 59, 59, 999);

      // Buscar todos los grueros que tienen servicios completados y pagados sin asignar a pago
      const grueros = await prisma.gruero.findMany({
        where: {
          servicios: {
            some: {
              status: 'COMPLETADO',
              pagoId: null,
              completadoAt: {
                gte: inicioSemana,
                lte: finSemana,
              },
            },
          },
        },
        include: {
          user: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true,
              telefono: true,
            },
          },
          servicios: {
            where: {
              status: 'COMPLETADO',
              pagoId: null,
              completadoAt: {
                gte: inicioSemana,
                lte: finSemana,
              },
            },
            include: {
              cliente: {
                include: {
                  user: {
                    select: {
                      nombre: true,
                      apellido: true,
                    },
                  },
                },
              },
            },
          },
        },
      });



      const gruerosPendientes = grueros.map((gruero) => ({
        grueroId: gruero.id,
        nombre: `${gruero.user.nombre} ${gruero.user.apellido}`,
        email: gruero.user.email,
        telefono: gruero.user.telefono,
        patente: gruero.patente,
        banco: gruero.banco,
        tipoCuenta: gruero.tipoCuenta,
        numeroCuenta: gruero.numeroCuenta,
        nombreTitular: gruero.nombreTitular,
        rutTitular: gruero.rutTitular,
        totalServicios: gruero.servicios.length,
        montoTotal: gruero.servicios.reduce((sum, s) => sum + s.totalGruero, 0),
        servicios: gruero.servicios.map((s) => ({
          id: s.id,
          fecha: s.completadoAt,
          cliente: `${s.cliente.user.nombre} ${s.cliente.user.apellido}`,
          origen: s.origenDireccion,
          destino: s.destinoDireccion,
          monto: s.totalGruero,
        })),
      }));

      return res.json({
        success: true,
        data: {
          periodo: `${inicioSemana.toLocaleDateString('es-CL')} - ${finSemana.toLocaleDateString('es-CL')}`,
          inicioSemana: inicioSemana.toISOString(),
          finSemana: finSemana.toISOString(),
          grueros: gruerosPendientes,
          totalGrueros: gruerosPendientes.length,
          montoTotalGeneral: gruerosPendientes.reduce((sum, g) => sum + g.montoTotal, 0),
        },
      });
    } catch (error: any) {
      console.error('❌ Error obteniendo pagos pendientes:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener pagos pendientes',
        error: error.message,
      });
    }
  }

  /**
   * POST /api/admin/pagos/marcar-pagado
   * Marcar un pago semanal como transferido
   */
  static async marcarPagado(req: Request, res: Response) {
    try {
      const adminId = (req.user as any)?.userId;
      const { grueroId, metodoPago, numeroComprobante, notasAdmin } = req.body;

      if (!grueroId) {
        return res.status(400).json({
          success: false,
          message: 'grueroId es requerido',
        });
      }

      // Calcular inicio y fin de la semana actual
      const now = new Date();
      const dayOfWeek = now.getDay();
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      
      const inicioSemana = new Date(now);
      inicioSemana.setDate(now.getDate() + diffToMonday);
      inicioSemana.setHours(0, 0, 0, 0);

      const finSemana = new Date(inicioSemana);
      finSemana.setDate(inicioSemana.getDate() + 6);
      finSemana.setHours(23, 59, 59, 999);

      // Buscar servicios pendientes de esta semana
      const serviciosPendientes = await prisma.servicio.findMany({
        where: {
          grueroId,
          status: 'COMPLETADO',
          pagoId: null,
          completadoAt: {
            gte: inicioSemana,
            lte: finSemana,
          },
        },
      });

      if (serviciosPendientes.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No hay servicios pendientes para este gruero',
        });
      }

      const montoTotal = serviciosPendientes.reduce((sum, s) => sum + s.totalGruero, 0);

      // Calcular período (formato: 2025-W03)
      const year = inicioSemana.getFullYear();
      const weekNumber = Math.ceil(
        ((inicioSemana.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + 1) / 7
      );
      const periodo = `${year}-W${weekNumber.toString().padStart(2, '0')}`;

      // Crear el registro de pago semanal
      const pago = await prisma.pago.create({
        data: {
          grueroId,
          periodo,
          fechaInicio: inicioSemana,
          fechaFin: finSemana,
          totalServicios: serviciosPendientes.length,
          montoTotal,
          estado: 'PAGADO',
          metodoPago: metodoPago || 'TRANSFERENCIA',
          numeroComprobante,
          notasAdmin,
          pagadoAt: new Date(),
          pagadoPor: adminId,
        },
      });

     // Asignar todos los servicios a este pago y marcar como pagados
      await prisma.servicio.updateMany({
        where: {
          id: {
            in: serviciosPendientes.map((s) => s.id),
          },
        },
        data: {
          pagoId: pago.id,
          pagado: true,
        },
      });

      // Crear notificación para el gruero
      const gruero = await prisma.gruero.findUnique({
        where: { id: grueroId },
        include: {
          user: true,
        },
      });

      if (gruero) {
        await prisma.notificacion.create({
          data: {
            userId: gruero.userId,
            tipo: 'PAGO_RECIBIDO',
            titulo: '💰 Pago semanal recibido',
            mensaje: `Se te ha transferido $${montoTotal.toLocaleString('es-CL')} por ${serviciosPendientes.length} servicios completados.`,
            referencia: pago.id,
          },
        });

        console.log('✅ Notificación enviada al gruero:', gruero.user.nombre);
      }

      return res.json({
        success: true,
        data: {
          pago,
          serviciosActualizados: serviciosPendientes.length,
        },
        message: 'Pago registrado exitosamente',
      });
    } catch (error: any) {
      console.error('❌ Error marcando pago:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al registrar el pago',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/admin/pagos/historial
   * Obtener historial de todos los pagos realizados
   */
  static async obtenerHistorial(req: Request, res: Response) {
    try {
      const { grueroId, desde, hasta } = req.query;

      const where: any = {
        estado: 'PAGADO',
      };

      if (grueroId) {
        where.grueroId = grueroId as string;
      }

      if (desde || hasta) {
        where.pagadoAt = {};
        if (desde) {
          where.pagadoAt.gte = new Date(desde as string);
        }
        if (hasta) {
          where.pagadoAt.lte = new Date(hasta as string);
        }
      }

      const pagos = await prisma.pago.findMany({
        where,
        include: {
          gruero: {
            include: {
              user: {
                select: {
                  nombre: true,
                  apellido: true,
                  email: true,
                },
              },
            },
          },
          servicios: {
            select: {
              id: true,
              completadoAt: true,
              totalGruero: true,
            },
          },
        },
        orderBy: {
          pagadoAt: 'desc',
        },
      });

      return res.json({
        success: true,
        data: {
          pagos: pagos.map((pago) => ({
            id: pago.id,
            periodo: pago.periodo,
            fechaInicio: pago.fechaInicio,
            fechaFin: pago.fechaFin,
            gruero: {
              id: pago.gruero.id,
              nombre: `${pago.gruero.user.nombre} ${pago.gruero.user.apellido}`,
              email: pago.gruero.user.email,
              patente: pago.gruero.patente,
            },
            totalServicios: pago.totalServicios,
            montoTotal: pago.montoTotal,
            metodoPago: pago.metodoPago,
            numeroComprobante: pago.numeroComprobante,
            notasAdmin: pago.notasAdmin,
            pagadoAt: pago.pagadoAt,
          })),
          totalPagos: pagos.length,
          montoTotal: pagos.reduce((sum, p) => sum + p.montoTotal, 0),
        },
      });
    } catch (error: any) {
      console.error('❌ Error obteniendo historial:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener historial',
        error: error.message,
      });
    }
  }
}