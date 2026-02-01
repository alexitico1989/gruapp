import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class GrueroPagosController {
  /**
   * GET /api/gruero/pagos/pendientes
   * Obtener servicios completados de la semana actual pendientes de pago
   */
  static async obtenerPendientes(req: Request, res: Response) {
    try {
      const userId = (req.user as any)?.userId;

      const gruero = await prisma.gruero.findUnique({
        where: { userId },
      });

      if (!gruero) {
        return res.status(404).json({
          success: false,
          message: 'Gruero no encontrado',
        });
      }

      // Calcular inicio y fin de la semana actual (lunes a domingo)
      const now = new Date();
      const dayOfWeek = now.getDay();
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      
      const inicioSemana = new Date(now);
      inicioSemana.setDate(now.getDate() + diffToMonday);
      inicioSemana.setHours(0, 0, 0, 0);

      const finSemana = new Date(inicioSemana);
      finSemana.setDate(inicioSemana.getDate() + 6);
      finSemana.setHours(23, 59, 59, 999);

      // Buscar servicios completados y pagados por el cliente, pero sin pago semanal asignado
      const serviciosPendientes = await prisma.servicio.findMany({
        where: {
          grueroId: gruero.id,
          status: 'COMPLETADO',
          pagado: { not: false },
          pagoId: null, // No está asignado a ningún pago semanal
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
        orderBy: {
          completadoAt: 'desc',
        },
      });

      const totalPendiente = serviciosPendientes.reduce(
        (sum, servicio) => sum + servicio.totalGruero,
        0
      );

      return res.json({
        success: true,
        data: {
          periodo: `${inicioSemana.toLocaleDateString('es-CL')} - ${finSemana.toLocaleDateString('es-CL')}`,
          inicioSemana: inicioSemana.toISOString(),
          finSemana: finSemana.toISOString(),
          totalServicios: serviciosPendientes.length,
          totalPendiente,
          servicios: serviciosPendientes.map((s) => ({
            servicioId: s.id,
            fecha: s.completadoAt,
            cliente: `${s.cliente.user.nombre} ${s.cliente.user.apellido}`,
            origen: s.origenDireccion,
            destino: s.destinoDireccion,
            distancia: s.distanciaKm,
            monto: s.totalGruero,
          })),
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

  static async obtenerHistorial(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.userId;

    const gruero = await prisma.gruero.findUnique({
      where: { userId },
    });

    if (!gruero) {
      return res.status(404).json({
        success: false,
        message: 'Gruero no encontrado',
      });
    }

    // 1️⃣ Obtener pagos pagados
    const pagos = await prisma.pago.findMany({
      where: { grueroId: gruero.id, estado: 'PAGADO' },
      include: {
        servicios: true, // trae el servicio asociado
      },
      orderBy: { pagadoAt: 'desc' },
    });

    // 2️⃣ Servicios pendientes sin asignar a pago
    const serviciosPendientes = await prisma.servicio.findMany({
      where: {
        grueroId: gruero.id,
        status: 'COMPLETADO',
        pagado: false,
        pagoId: null,
      },
      orderBy: { completadoAt: 'desc' },
    });

    const montoPendiente = serviciosPendientes.reduce(
      (sum, s) => sum + s.totalGruero,
      0
    );

    // 3️⃣ Respuesta final
    return res.json({
      success: true,
      data: {
        pendiente: {
          monto: montoPendiente,
          servicios: serviciosPendientes.length,
          detalles: serviciosPendientes.map((s) => ({
            servicioId: s.id,
            totalGruero: s.totalGruero,
            completadoAt: s.completadoAt,
            origenDireccion: s.origenDireccion,
            destinoDireccion: s.destinoDireccion,
          })),
        },

        historial: pagos.map((pago) => {
          // Si no hay servicio asociado, fallback con ID ficticio
          const detalle = pago.servicios[0]
            ? {
                servicioId: pago.servicios[0].id,
                completadoAt: pago.servicios[0].completadoAt,
                origenDireccion: pago.servicios[0].origenDireccion,
                destinoDireccion: pago.servicios[0].destinoDireccion,
                totalGruero: pago.servicios[0].totalGruero,
                estado: pago.estado,
              }
            : {
                servicioId: 'N/A',
                completadoAt: null,
                origenDireccion: '',
                destinoDireccion: '',
                totalGruero: 0,
              };

          return {
            id: pago.id,
            periodo: pago.periodo,
            fechaInicio: pago.fechaInicio,
            fechaFin: pago.fechaFin,
            monto: pago.montoTotal,
            servicios: pago.totalServicios,
            estado: pago.estado,
            metodoPago: pago.metodoPago,
            numeroComprobante: pago.numeroComprobante,
            pagadoAt: pago.pagadoAt,
            serviciosDetalle: [detalle], // siempre un array con 1 objeto
          };
        }),
      },
    });
  } catch (error: any) {
    console.error('❌ Error obteniendo historial de pagos:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener historial',
      error: error.message,
    });
  }
}


  /**
   * GET /api/gruero/pagos/resumen
   * Obtener resumen general de pagos
   */
  static async obtenerResumen(req: Request, res: Response) {
    try {
      const userId = (req.user as any)?.userId;

      const gruero = await prisma.gruero.findUnique({
        where: { userId },
      });

      if (!gruero) {
        return res.status(404).json({
          success: false,
          message: 'Gruero no encontrado',
        });
      }

      // Total pendiente (servicios sin asignar a pago)
      const serviciosPendientes = await prisma.servicio.findMany({
        where: {
          grueroId: gruero.id,
          status: 'COMPLETADO',
          pagado: true,
          pagoId: null,
        },
      });

      const totalPendiente = serviciosPendientes.reduce(
        (sum, s) => sum + s.totalGruero,
        0
      );

      // Total recibido
      const pagosRecibidos = await prisma.pago.findMany({
        where: {
          grueroId: gruero.id,
          estado: 'PAGADO',
        },
      });

      const totalRecibido = pagosRecibidos.reduce(
        (sum, p) => sum + p.montoTotal,
        0
      );

      // Total de servicios
      const totalServiciosCompletados = await prisma.servicio.count({
        where: {
          grueroId: gruero.id,
          status: 'COMPLETADO',
          pagado: true,
        },
      });

      return res.json({
        success: true,
        data: {
          totalPendiente,
          totalRecibido,
          totalServiciosCompletados,
          serviciosPendientes: serviciosPendientes.length,
          pagosRecibidos: pagosRecibidos.length,
        },
      });
    } catch (error: any) {
      console.error('❌ Error obteniendo resumen:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener resumen',
        error: error.message,
      });
    }
  }
}