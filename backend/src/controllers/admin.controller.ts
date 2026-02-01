import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { JWTService } from '../utils/jwt';

const prisma = new PrismaClient();

export class AdminController {
  /**
   * POST /api/admin/login
   * Login de administrador
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validar campos requeridos
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email y contraseña son requeridos',
        });
        return;
      }

      // Buscar admin
      const admin = await prisma.admin.findUnique({
        where: { email },
      });

      if (!admin) {
        res.status(401).json({
          success: false,
          message: 'Credenciales inválidas',
        });
        return;
      }

      // Verificar contraseña
      const passwordMatch = await bcrypt.compare(password, admin.password);

      if (!passwordMatch) {
        res.status(401).json({
          success: false,
          message: 'Credenciales inválidas',
        });
        return;
      }

      // Generar token JWT
      const token = JWTService.generateToken(admin.id, admin.email, 'ADMIN');

      res.json({
        success: true,
        message: 'Login exitoso',
        data: {
          admin: {
            id: admin.id,
            email: admin.email,
            nombre: admin.nombre,
            apellido: admin.apellido,
          },
          token,
        },
      });
    } catch (error) {
      console.error('❌ Error en login admin:', error);
      res.status(500).json({
        success: false,
        message: 'Error al iniciar sesión',
      });
    }
  }

  /**
   * GET /api/admin/grueros/pendientes
   * Obtener grueros pendientes de verificación
   */
  static async getGruerosPendientes(req: Request, res: Response): Promise<void> {
    try {
      const grueros = await prisma.gruero.findMany({
        where: {
          estadoVerificacion: 'PENDIENTE',
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              nombre: true,
              apellido: true,
              telefono: true,
              rut: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.json({
        success: true,
        data: grueros,
      });
    } catch (error) {
      console.error('❌ Error al obtener grueros pendientes:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener grueros pendientes',
      });
    }
  }

  /**
   * GET /api/admin/grueros
   * Obtener todos los grueros con filtros
   */
  static async getGrueros(req: Request, res: Response): Promise<void> {
    try {
      const { estado, verificacion } = req.query;

      const where: any = {};

      if (estado) {
        where.estadoVerificacion = estado;
      }

      if (verificacion === 'verificados') {
        where.verificado = true;
      } else if (verificacion === 'no_verificados') {
        where.verificado = false;
      }

      const grueros = await prisma.gruero.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              nombre: true,
              apellido: true,
              telefono: true,
              rut: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.json({
        success: true,
        data: grueros,
      });
    } catch (error) {
      console.error('❌ Error al obtener grueros:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener grueros',
      });
    }
  }

  /**
 * GET /api/admin/grueros/:id
 * Obtener detalle de un gruero
 */
  static async getGrueroDetalle(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const gruero = await prisma.gruero.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              nombre: true,
              apellido: true,
              telefono: true,
              rut: true,
              createdAt: true,
            },
          },
          servicios: {
            orderBy: { solicitadoAt: 'desc' },
          },
          calificacionesRecibidas: true,
        },
      });

      if (!gruero) {
        res.status(404).json({
          success: false,
          message: 'Gruero no encontrado',
        });
        return;
      }

      // 🧮 Estadísticas
      const totalServicios = gruero.servicios.length;

      const serviciosCompletados = gruero.servicios.filter(
        (s) => s.status === 'COMPLETADO'
      );

      const calificacionPromedio =
        gruero.calificacionesRecibidas.length > 0
          ? gruero.calificacionesRecibidas.reduce(
              (sum, c) => sum + c.puntuacionGruero,
              0
            ) / gruero.calificacionesRecibidas.length
          : 0;

      res.json({
        success: true,
        data: {
          ...gruero,
          totalServicios,
          calificacionPromedio: Number(calificacionPromedio.toFixed(2)),
        },
      });
    } catch (error) {
      console.error('❌ Error al obtener detalle de gruero:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener detalle del gruero',
      });
    }
  }


  /**
   * PATCH /api/admin/grueros/:id/aprobar
   * Aprobar un gruero
   */
  static async aprobarGruero(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const gruero = await prisma.gruero.update({
        where: { id },
        data: {
          estadoVerificacion: 'APROBADO',
          verificado: true,
          motivoRechazo: null,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              nombre: true,
              apellido: true,
            },
          },
        },
      });

      // Enviar notificación al gruero
      await prisma.notificacion.create({
        data: {
          userId: gruero.userId,
          tipo: 'APROBACION_CUENTA',
          titulo: '✅ Cuenta Aprobada',
          mensaje: '¡Felicitaciones! Tu cuenta ha sido aprobada. Ya puedes empezar a recibir servicios.',
        },
      });

      res.json({
        success: true,
        message: 'Gruero aprobado exitosamente',
        data: gruero,
      });
    } catch (error) {
      console.error('❌ Error al aprobar gruero:', error);
      res.status(500).json({
        success: false,
        message: 'Error al aprobar gruero',
      });
    }
  }

  /**
   * PATCH /api/admin/grueros/:id/rechazar
   * Rechazar un gruero
   */
  static async rechazarGruero(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { motivo } = req.body;

      if (!motivo) {
        res.status(400).json({
          success: false,
          message: 'El motivo de rechazo es requerido',
        });
        return;
      }

      const gruero = await prisma.gruero.update({
        where: { id },
        data: {
          estadoVerificacion: 'RECHAZADO',
          verificado: false,
          motivoRechazo: motivo,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              nombre: true,
              apellido: true,
            },
          },
        },
      });

      // Enviar notificación al gruero
      await prisma.notificacion.create({
        data: {
          userId: gruero.userId,
          tipo: 'RECHAZO_CUENTA',
          titulo: '❌ Cuenta Rechazada',
          mensaje: `Tu cuenta ha sido rechazada. Motivo: ${motivo}`,
        },
      });

      res.json({
        success: true,
        message: 'Gruero rechazado',
        data: gruero,
      });
    } catch (error) {
      console.error('❌ Error al rechazar gruero:', error);
      res.status(500).json({
        success: false,
        message: 'Error al rechazar gruero',
      });
    }
  }

  /**
   * PATCH /api/admin/grueros/:id/suspender
   * Suspender cuenta de un gruero
   */
  static async suspenderGruero(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { motivo } = req.body;

      if (!motivo) {
        res.status(400).json({
          success: false,
          message: 'El motivo de suspensión es requerido',
        });
        return;
      }

      const gruero = await prisma.gruero.update({
        where: { id },
        data: {
          cuentaSuspendida: true,
          motivoSuspension: motivo,
          status: 'SUSPENDIDO',
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              nombre: true,
              apellido: true,
            },
          },
        },
      });

      // Enviar notificación al gruero
      await prisma.notificacion.create({
        data: {
          userId: gruero.userId,
          tipo: 'SUSPENSION_CUENTA',
          titulo: '⚠️ Cuenta Suspendida',
          mensaje: `Tu cuenta ha sido suspendida. Motivo: ${motivo}`,
        },
      });

      res.json({
        success: true,
        message: 'Gruero suspendido',
        data: gruero,
      });
    } catch (error) {
      console.error('❌ Error al suspender gruero:', error);
      res.status(500).json({
        success: false,
        message: 'Error al suspender gruero',
      });
    }
  }

  /**
   * PATCH /api/admin/grueros/:id/reactivar
   * Reactivar cuenta de un gruero
   */
  static async reactivarGruero(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const gruero = await prisma.gruero.update({
        where: { id },
        data: {
          cuentaSuspendida: false,
          motivoSuspension: null,
          status: 'OFFLINE',
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              nombre: true,
              apellido: true,
            },
          },
        },
      });

      // Enviar notificación al gruero
      await prisma.notificacion.create({
        data: {
          userId: gruero.userId,
          tipo: 'REACTIVACION_CUENTA',
          titulo: '✅ Cuenta Reactivada',
          mensaje: 'Tu cuenta ha sido reactivada. Ya puedes volver a operar.',
        },
      });

      res.json({
        success: true,
        message: 'Gruero reactivado',
        data: gruero,
      });
    } catch (error) {
      console.error('❌ Error al reactivar gruero:', error);
      res.status(500).json({
        success: false,
        message: 'Error al reactivar gruero',
      });
    }
  }

  static async eliminarGruero(req: Request, res: Response) {
    const { id } = req.params;
    try {
      // 1. Buscar gruero para obtener userId
      const gruero = await prisma.gruero.findUnique({
        where: { id },
        select: { userId: true }
      });

      if (!gruero) {
        res.status(404).json({
          success: false,
          message: 'Gruero no encontrado',
        });
        return;
      }

      // 2. ✅ Eliminar solo el User (esto elimina Gruero por cascada automática)
      await prisma.user.delete({ 
        where: { id: gruero.userId } 
      });

      res.status(200).json({ 
        success: true,
        message: "Gruero eliminado correctamente" 
      });
    } catch (error) {
      console.error('Error eliminando gruero:', error);
      res.status(500).json({ 
        success: false,
        error: "Error eliminando gruero", 
        details: error 
      });
    }
  }

  /**
   * Eliminar cliente permanentemente
   */
  static async eliminarCliente(req: Request, res: Response) {
    const { id } = req.params;
    try {
      // 1. Buscar cliente para obtener userId
      const cliente = await prisma.cliente.findUnique({
        where: { id },
        select: { userId: true }
      });

      if (!cliente) {
        res.status(404).json({
          success: false,
          message: 'Cliente no encontrado',
        });
        return;
      }

      // 2. ✅ Eliminar solo el User (esto elimina Cliente por cascada automática)
      await prisma.user.delete({ 
        where: { id: cliente.userId } 
      });
      
      res.status(200).json({ 
        success: true,
        message: "Cliente eliminado correctamente" 
      });
    } catch (error) {
      console.error('Error eliminando cliente:', error);
      res.status(500).json({ 
        success: false,
        error: "Error eliminando cliente", 
        details: error 
      });
    }
  }

  /**
   * GET /api/admin/servicios
   * Obtener todos los servicios con filtros
   */
  static async getServicios(req: Request, res: Response): Promise<void> {
    try {
      const { status, fecha } = req.query;

      const where: any = {};

      if (status) {
        where.status = status;
      }

      if (fecha) {
        const fechaInicio = new Date(fecha as string);
        const fechaFin = new Date(fecha as string);
        fechaFin.setDate(fechaFin.getDate() + 1);

        where.solicitadoAt = {
          gte: fechaInicio,
          lt: fechaFin,
        };
      }

      const servicios = await prisma.servicio.findMany({
        where,
        select: {
          id: true,
          origenDireccion: true,
          destinoDireccion: true,
          tipoVehiculo: true,
          distanciaKm: true,
          totalCliente: true,
          totalGruero: true,
          comisionPlataforma: true,
          status: true,
          pagado: true,
          solicitadoAt: true,
          completadoAt: true,
          cliente: {
            include: {
              user: {
                select: {
                  nombre: true,
                  apellido: true,
                  email: true,
                  telefono: true,
                },
              },
            },
          },
          gruero: {
            include: {
              user: {
                select: {
                  nombre: true,
                  apellido: true,
                  email: true,
                  telefono: true,
                },
              },
            },
          },
          calificacion: true,
        },
        orderBy: {
          solicitadoAt: 'desc',
        },
        take: 50,
      });

      res.json({
        success: true,
        data: servicios,
      });
    } catch (error) {
      console.error('❌ Error al obtener servicios:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener servicios',
      });
    }
  }

  /**
   * GET /api/admin/estadisticas
   * Obtener estadísticas generales de la plataforma
   */
  static async getEstadisticas(req: Request, res: Response): Promise<void> {
    try {
      // Total de usuarios
      const totalClientes = await prisma.cliente.count();
      const totalGrueros = await prisma.gruero.count();
      const gruerosPendientes = await prisma.gruero.count({
        where: { estadoVerificacion: 'PENDIENTE' },
      });
      const gruerosActivos = await prisma.gruero.count({
        where: { status: 'DISPONIBLE' },
      });

      // Servicios
      const totalServicios = await prisma.servicio.count();
      const serviciosHoy = await prisma.servicio.count({
        where: {
          solicitadoAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      });
      const serviciosCompletados = await prisma.servicio.count({
        where: { status: 'COMPLETADO' },
      });
      const serviciosEnCurso = await prisma.servicio.count({
        where: {
          status: {
            in: ['ACEPTADO', 'EN_CAMINO', 'EN_SITIO'],
          },
        },
      });

      // Ingresos
      const ingresos = await prisma.servicio.aggregate({
        where: {
          status: 'COMPLETADO',
          pagado: true,
        },
        _sum: {
          comisionPlataforma: true,
          totalCliente: true,
        },
      });

      // Servicios por día (últimos 7 días)
      const hace7Dias = new Date();
      hace7Dias.setDate(hace7Dias.getDate() - 7);

      const serviciosPorDia = await prisma.servicio.groupBy({
        by: ['solicitadoAt'],
        where: {
          solicitadoAt: {
            gte: hace7Dias,
          },
        },
        _count: true,
      });

      res.json({
        success: true,
        data: {
          usuarios: {
            totalClientes,
            totalGrueros,
            gruerosPendientes,
            gruerosActivos,
          },
          servicios: {
            total: totalServicios,
            hoy: serviciosHoy,
            completados: serviciosCompletados,
            enCurso: serviciosEnCurso,
          },
          ingresos: {
            comisionTotal: ingresos._sum.comisionPlataforma || 0,
            facturacionTotal: ingresos._sum.totalCliente || 0,
          },
          serviciosPorDia,
        },
      });
    } catch (error) {
      console.error('❌ Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas',
      });
    }
  }

  /**
   * GET /api/admin/clientes
   * Obtener todos los clientes
   */
  static async getClientes(req: Request, res: Response): Promise<void> {
    try {
      const clientes = await prisma.cliente.findMany({
        include: {
          user: {
            select: {
              id: true,
              email: true,
              nombre: true,
              apellido: true,
              telefono: true,
              rut: true,
              createdAt: true,
            },
          },
          servicios: {
            select: {
              id: true,
              status: true,
              totalCliente: true,
              solicitadoAt: true,
            },
          },
        },
        orderBy: {
          user: {
            createdAt: 'desc',
          },
        },
      });

      const clientesConEstadisticas = clientes.map((cliente) => ({
        ...cliente,
        totalServicios: cliente.servicios.length,
        totalGastado: cliente.servicios
          .filter((s) => s.status === 'COMPLETADO')
          .reduce((sum, s) => sum + s.totalCliente, 0),
      }));

      res.json({
        success: true,
        data: clientesConEstadisticas,
      });
    } catch (error) {
      console.error('❌ Error al obtener clientes:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener clientes',
      });
    }
  }

  /**
   * GET /api/admin/grueros/:id/servicios
   * Obtener historial de servicios de un gruero específico
   */
  static async getGrueroServicios(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { page = '1', limit = '10', status, periodo } = req.query;

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

      const where: any = {
        grueroId: id,
      };

      // Filtro por status
      if (status && status !== 'TODOS') {
        where.status = status;
      }

      // Filtro por período
      if (periodo) {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        switch (periodo) {
          case 'hoy':
            where.solicitadoAt = { gte: hoy };
            break;
          case 'semana':
            const inicioSemana = new Date();
            inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
            inicioSemana.setHours(0, 0, 0, 0);
            where.solicitadoAt = { gte: inicioSemana };
            break;
          case 'mes':
            const inicioMes = new Date();
            inicioMes.setDate(1);
            inicioMes.setHours(0, 0, 0, 0);
            where.solicitadoAt = { gte: inicioMes };
            break;
          case 'año':
            const inicioAño = new Date();
            inicioAño.setMonth(0, 1);
            inicioAño.setHours(0, 0, 0, 0);
            where.solicitadoAt = { gte: inicioAño };
            break;
        }
      }

      const [servicios, total] = await Promise.all([
        prisma.servicio.findMany({
          where,
          select: {
            id: true,
            status: true,
            tipoVehiculo: true,
            origenDireccion: true,
            destinoDireccion: true,
            distanciaKm: true,
            totalCliente: true,
            totalGruero: true,
            solicitadoAt: true,
            completadoAt: true,
            cliente: {
              select: {
                user: {
                  select: {
                    nombre: true,
                    apellido: true,
                    telefono: true,
                  },
                },
              },
            },
            calificacion: {
              select: {
                puntuacionGruero: true,
                comentarioGruero: true,
                createdAt: true,
              },
            },
          },
          orderBy: {
            solicitadoAt: 'desc',
          },
          skip,
          take: parseInt(limit as string),
        }),
        prisma.servicio.count({ where }),
      ]);

      // Calcular estadísticas
      const estadisticas = {
        total,
        completados: await prisma.servicio.count({
          where: { ...where, status: 'COMPLETADO' },
        }),
        cancelados: await prisma.servicio.count({
          where: { ...where, status: 'CANCELADO' },
        }),
        enCurso: await prisma.servicio.count({
          where: {
            ...where,
            status: { in: ['ACEPTADO', 'EN_CAMINO', 'EN_SITIO'] },
          },
        }),
        totalGanado: servicios
          .filter((s) => s.status === 'COMPLETADO')
          .reduce((sum, s) => sum + s.totalGruero, 0),
      };

      res.json({
        success: true,
        data: servicios,
        estadisticas,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string)),
        },
      });
    } catch (error) {
      console.error('❌ Error al obtener servicios del gruero:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener servicios del gruero',
      });
    }
  }

  /**
   * GET /api/admin/clientes/:id
   * Obtener detalle completo de un cliente
   */
  static async getClienteDetalle(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const cliente = await prisma.cliente.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              nombre: true,
              apellido: true,
              telefono: true,
              rut: true,
              createdAt: true,
            },
          },
          servicios: {
            take: 10,
            orderBy: {
              solicitadoAt: 'desc',
            },
            include: {
              gruero: {
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
          calificacionesDadas: {
            take: 10,
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      if (!cliente) {
        res.status(404).json({
          success: false,
          message: 'Cliente no encontrado',
        });
        return;
      }

      // Calcular estadísticas
      const totalServicios = cliente.servicios.length;
      const serviciosCompletados = cliente.servicios.filter(s => s.status === 'COMPLETADO').length;
      const serviciosCancelados = cliente.servicios.filter(s => s.status === 'CANCELADO').length;
      const totalGastado = cliente.servicios
        .filter(s => s.status === 'COMPLETADO')
        .reduce((sum, s) => sum + s.totalCliente, 0);
      const tasaCancelacion = totalServicios > 0 ? (serviciosCancelados / totalServicios) * 100 : 0;

      res.json({
        success: true,
        data: {
          ...cliente,
          estadisticas: {
            totalServicios,
            serviciosCompletados,
            serviciosCancelados,
            totalGastado,
            tasaCancelacion,
          },
        },
      });
    } catch (error) {
      console.error('❌ Error al obtener detalle de cliente:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener detalle del cliente',
      });
    }
  }

  /**
   * GET /api/admin/clientes/:id/servicios
   * Obtener historial de servicios de un cliente específico
   */
  static async getClienteServicios(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { page = '1', limit = '10', status, periodo } = req.query;

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

      const where: any = {
        clienteId: id,
      };

      // Filtro por status
      if (status && status !== 'TODOS') {
        where.status = status;
      }

      // Filtro por período
      if (periodo) {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        switch (periodo) {
          case 'hoy':
            where.solicitadoAt = { gte: hoy };
            break;
          case 'semana':
            const inicioSemana = new Date();
            inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
            inicioSemana.setHours(0, 0, 0, 0);
            where.solicitadoAt = { gte: inicioSemana };
            break;
          case 'mes':
            const inicioMes = new Date();
            inicioMes.setDate(1);
            inicioMes.setHours(0, 0, 0, 0);
            where.solicitadoAt = { gte: inicioMes };
            break;
          case 'año':
            const inicioAño = new Date();
            inicioAño.setMonth(0, 1);
            inicioAño.setHours(0, 0, 0, 0);
            where.solicitadoAt = { gte: inicioAño };
            break;
        }
      }

      const [servicios, total] = await Promise.all([
        prisma.servicio.findMany({
          where,
          select: {
            id: true,
            status: true,
            tipoVehiculo: true,
            origenDireccion: true,
            destinoDireccion: true,
            distanciaKm: true,
            totalCliente: true,
            totalGruero: true,
            solicitadoAt: true,
            completadoAt: true,
            canceladoAt: true,
            motivoCancelacion: true,
            gruero: {
              select: {
                user: {
                  select: {
                    nombre: true,
                    apellido: true,
                    telefono: true,
                  },
                },
                patente: true,
                marca: true,
                modelo: true,
              },
            },
            calificacion: {
              select: {
                puntuacionGruero: true,
                comentarioGruero: true,
                puntuacionCliente: true,
                comentarioCliente: true,
                createdAt: true,
              },
            },
          },
          orderBy: {
            solicitadoAt: 'desc',
          },
          skip,
          take: parseInt(limit as string),
        }),
        prisma.servicio.count({ where }),
      ]);

      // Calcular estadísticas
      const estadisticas = {
        total,
        completados: await prisma.servicio.count({
          where: { ...where, status: 'COMPLETADO' },
        }),
        cancelados: await prisma.servicio.count({
          where: { ...where, status: 'CANCELADO' },
        }),
        enCurso: await prisma.servicio.count({
          where: {
            ...where,
            status: { in: ['SOLICITADO', 'ACEPTADO', 'EN_CAMINO', 'EN_SITIO'] },
          },
        }),
        totalGastado: servicios
          .filter((s) => s.status === 'COMPLETADO')
          .reduce((sum, s) => sum + s.totalCliente, 0),
      };

      res.json({
        success: true,
        data: servicios,
        estadisticas,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string)),
        },
      });
    } catch (error) {
      console.error('❌ Error al obtener servicios del cliente:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener servicios del cliente',
      });
    }
  }

  /**
   * PATCH /api/admin/clientes/:id/suspender
   * Suspender cuenta de un cliente
   */
  static async suspenderCliente(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { motivo } = req.body;

      if (!motivo) {
        res.status(400).json({
          success: false,
          message: 'El motivo de suspensión es requerido',
        });
        return;
      }

      // Actualizar cliente con suspensión
      const cliente = await prisma.cliente.update({
        where: { id },
        data: {
          cuentaSuspendida: true,
          motivoSuspension: motivo,
        },
        include: { user: true },
      });

      // Enviar notificación
      await prisma.notificacion.create({
        data: {
          userId: cliente.userId,
          tipo: 'SUSPENSION_CUENTA',
          titulo: '⚠️ Cuenta Suspendida',
          mensaje: `Tu cuenta ha sido suspendida. Motivo: ${motivo}`,
        },
      });

      res.json({
        success: true,
        message: 'Cliente suspendido exitosamente',
        data: cliente,
      });
    } catch (error) {
      console.error('❌ Error al suspender cliente:', error);
      res.status(500).json({
        success: false,
        message: 'Error al suspender cliente',
      });
    }
  }

  /**
   * PATCH /api/admin/clientes/:id/reactivar
   * Reactivar cuenta de un cliente
   */
  static async reactivarCliente(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const cliente = await prisma.cliente.update({
        where: { id },
        data: {
          cuentaSuspendida: false,
          motivoSuspension: null,
        },
        include: { user: true },
      });

      // Enviar notificación de reactivación
      await prisma.notificacion.create({
        data: {
          userId: cliente.userId,
          tipo: 'REACTIVACION_CUENTA',
          titulo: '✅ Cuenta Reactivada',
          mensaje: 'Tu cuenta ha sido reactivada. Ya puedes volver a solicitar servicios.',
        },
      });

      res.json({
        success: true,
        message: 'Cliente reactivado exitosamente',
        data: cliente,
      });
    } catch (error) {
      console.error('❌ Error al reactivar cliente:', error);
      res.status(500).json({
        success: false,
        message: 'Error al reactivar cliente',
      });
    }
  }

  /**
   * GET /api/admin/finanzas/metricas
   * Obtener métricas financieras generales
   */
  static async getMetricasFinancieras(req: Request, res: Response): Promise<void> {
    try {
      const ahora = new Date();
      const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      const inicioMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
      const finMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth(), 0, 23, 59, 59);

      // Ingresos totales (todos los tiempos)
      const ingresosTotal = await prisma.servicio.aggregate({
        where: {
          status: 'COMPLETADO',
          pagado: true,
        },
        _sum: {
          comisionPlataforma: true,
          totalCliente: true,
          totalGruero: true,
        },
      });

      // Ingresos del mes actual
      const ingresosMesActual = await prisma.servicio.aggregate({
        where: {
          status: 'COMPLETADO',
          pagado: true,
          completadoAt: {
            gte: inicioMes,
          },
        },
        _sum: {
          comisionPlataforma: true,
          totalCliente: true,
          totalGruero: true,
        },
      });

      // Ingresos del mes anterior
      const ingresosMesAnterior = await prisma.servicio.aggregate({
        where: {
          status: 'COMPLETADO',
          pagado: true,
          completadoAt: {
            gte: inicioMesAnterior,
            lte: finMesAnterior,
          },
        },
        _sum: {
          comisionPlataforma: true,
        },
      });

      // Servicios completados este mes
      const serviciosCompletadosMes = await prisma.servicio.count({
        where: {
          status: 'COMPLETADO',
          completadoAt: {
            gte: inicioMes,
          },
        },
      });

      // Servicios totales este mes (para calcular tasa de conversión)
      const serviciosTotalesMes = await prisma.servicio.count({
        where: {
          solicitadoAt: {
            gte: inicioMes,
          },
        },
      });

      // Calcular comisión promedio
      const comisionPromedio = serviciosCompletadosMes > 0
        ? (ingresosMesActual._sum.comisionPlataforma || 0) / serviciosCompletadosMes
        : 0;

      // Calcular porcentaje de cambio vs mes anterior
      const cambioMensual = ingresosMesAnterior._sum.comisionPlataforma
        ? ((ingresosMesActual._sum.comisionPlataforma || 0) - (ingresosMesAnterior._sum.comisionPlataforma || 0)) /
          (ingresosMesAnterior._sum.comisionPlataforma || 1) * 100
        : 0;

      // Tasa de conversión
      const tasaConversion = serviciosTotalesMes > 0
        ? (serviciosCompletadosMes / serviciosTotalesMes) * 100
        : 0;

      // Proyección mensual (basado en días transcurridos)
      const diasMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0).getDate();
      const diasTranscurridos = ahora.getDate();
      const proyeccionMensual = diasTranscurridos > 0
        ? ((ingresosMesActual._sum.comisionPlataforma || 0) / diasTranscurridos) * diasMes
        : 0;

      res.json({
        success: true,
        data: {
          ingresosTotal: ingresosTotal._sum.comisionPlataforma || 0,
          facturacionTotal: ingresosTotal._sum.totalCliente || 0,
          pagoGruerosTotal: ingresosTotal._sum.totalGruero || 0,
          
          ingresosMesActual: ingresosMesActual._sum.comisionPlataforma || 0,
          facturacionMesActual: ingresosMesActual._sum.totalCliente || 0,
          pagoGruerosMesActual: ingresosMesActual._sum.totalGruero || 0,
          
          ingresosMesAnterior: ingresosMesAnterior._sum.comisionPlataforma || 0,
          cambioMensual: Number(cambioMensual.toFixed(2)),
          
          serviciosCompletadosMes,
          serviciosTotalesMes,
          tasaConversion: Number(tasaConversion.toFixed(2)),
          
          comisionPromedio: Number(comisionPromedio.toFixed(2)),
          proyeccionMensual: Number(proyeccionMensual.toFixed(2)),
        },
      });
    } catch (error) {
      console.error('❌ Error al obtener métricas financieras:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener métricas financieras',
      });
    }
  }

  /**
   * GET /api/admin/finanzas/ingresos-diarios
   * Obtener ingresos diarios para gráfico
   */
  static async getIngresosDiarios(req: Request, res: Response): Promise<void> {
    try {
      const { dias = '30' } = req.query;
      const diasNum = parseInt(dias as string);
      
      const fechaInicio = new Date();
      fechaInicio.setDate(fechaInicio.getDate() - diasNum);
      fechaInicio.setHours(0, 0, 0, 0);

      const servicios = await prisma.servicio.findMany({
        where: {
          status: 'COMPLETADO',
          pagado: true,
          completadoAt: {
            gte: fechaInicio,
          },
        },
        select: {
          completadoAt: true,
          comisionPlataforma: true,
          totalCliente: true,
          totalGruero: true,
        },
        orderBy: {
          completadoAt: 'asc',
        },
      });

      // Agrupar por día
      const ingresosPorDia: { [key: string]: any } = {};
      
      servicios.forEach((servicio) => {
        if (!servicio.completadoAt) return;
        
        const fecha = servicio.completadoAt.toISOString().split('T')[0];
        
        if (!ingresosPorDia[fecha]) {
          ingresosPorDia[fecha] = {
            fecha,
            comisionPlataforma: 0,
            facturacion: 0,
            pagoGrueros: 0,
            servicios: 0,
          };
        }
        
        ingresosPorDia[fecha].comisionPlataforma += servicio.comisionPlataforma;
        ingresosPorDia[fecha].facturacion += servicio.totalCliente;
        ingresosPorDia[fecha].pagoGrueros += servicio.totalGruero;
        ingresosPorDia[fecha].servicios += 1;
      });

      // Convertir a array y ordenar
      const resultado = Object.values(ingresosPorDia).map((dia: any) => ({
        fecha: dia.fecha,
        comisionPlataforma: Number(dia.comisionPlataforma.toFixed(2)),
        facturacion: Number(dia.facturacion.toFixed(2)),
        pagoGrueros: Number(dia.pagoGrueros.toFixed(2)),
        servicios: dia.servicios,
      }));

      res.json({
        success: true,
        data: resultado,
      });
    } catch (error) {
      console.error('❌ Error al obtener ingresos diarios:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener ingresos diarios',
      });
    }
  }

  /**
   * GET /api/admin/finanzas/por-gruero
   * Obtener estadísticas financieras por gruero
   */
  static async getFinanzasPorGruero(req: Request, res: Response): Promise<void> {
    try {
      const { limit = '10', orden = 'desc' } = req.query;
      
      const grueros = await prisma.gruero.findMany({
        include: {
          user: {
            select: {
              nombre: true,
              apellido: true,
            },
          },
          servicios: {
            where: {
              status: 'COMPLETADO',
              pagado: true,
            },
            select: {
              totalGruero: true,
              comisionPlataforma: true,
              totalCliente: true,
            },
          },
        },
      });

      const estadisticas = grueros.map((gruero) => {
        const totalGanado = gruero.servicios.reduce((sum, s) => sum + s.totalGruero, 0);
        const comisionGenerada = gruero.servicios.reduce((sum, s) => sum + s.comisionPlataforma, 0);
        const facturacionTotal = gruero.servicios.reduce((sum, s) => sum + s.totalCliente, 0);
        
        return {
          grueroId: gruero.id,
          nombre: `${gruero.user.nombre} ${gruero.user.apellido}`,
          patente: gruero.patente,
          marca: gruero.marca,
          modelo: gruero.modelo,
          serviciosCompletados: gruero.servicios.length,
          totalGanado: Number(totalGanado.toFixed(2)),
          comisionGenerada: Number(comisionGenerada.toFixed(2)),
          facturacionTotal: Number(facturacionTotal.toFixed(2)),
          promedioServicio: gruero.servicios.length > 0 
            ? Number((totalGanado / gruero.servicios.length).toFixed(2))
            : 0,
        };
      });

      // Ordenar y limitar
      estadisticas.sort((a, b) => 
        orden === 'desc' 
          ? b.comisionGenerada - a.comisionGenerada
          : a.comisionGenerada - b.comisionGenerada
      );

      const resultado = estadisticas.slice(0, parseInt(limit as string));

      res.json({
        success: true,
        data: resultado,
      });
    } catch (error) {
      console.error('❌ Error al obtener finanzas por gruero:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener finanzas por gruero',
      });
    }
  }

  /**
   * GET /api/admin/finanzas/por-vehiculo
   * Obtener estadísticas financieras por tipo de vehículo
   */
  static async getFinanzasPorVehiculo(req: Request, res: Response): Promise<void> {
    try {
      const servicios = await prisma.servicio.findMany({
        where: {
          status: 'COMPLETADO',
          pagado: true,
        },
        select: {
          tipoVehiculo: true,
          comisionPlataforma: true,
          totalCliente: true,
          totalGruero: true,
        },
      });

      // Agrupar por tipo de vehículo
      const estadisticas: { [key: string]: any } = {};
      
      servicios.forEach((servicio) => {
        const tipo = servicio.tipoVehiculo;
        
        if (!estadisticas[tipo]) {
          estadisticas[tipo] = {
            tipoVehiculo: tipo,
            servicios: 0,
            comisionTotal: 0,
            facturacionTotal: 0,
            pagoGruerosTotal: 0,
          };
        }
        
        estadisticas[tipo].servicios += 1;
        estadisticas[tipo].comisionTotal += servicio.comisionPlataforma;
        estadisticas[tipo].facturacionTotal += servicio.totalCliente;
        estadisticas[tipo].pagoGruerosTotal += servicio.totalGruero;
      });

      // Convertir a array y calcular promedios
      const resultado = Object.values(estadisticas).map((stat: any) => ({
        tipoVehiculo: stat.tipoVehiculo,
        servicios: stat.servicios,
        comisionTotal: Number(stat.comisionTotal.toFixed(2)),
        facturacionTotal: Number(stat.facturacionTotal.toFixed(2)),
        pagoGruerosTotal: Number(stat.pagoGruerosTotal.toFixed(2)),
        comisionPromedio: Number((stat.comisionTotal / stat.servicios).toFixed(2)),
        facturacionPromedio: Number((stat.facturacionTotal / stat.servicios).toFixed(2)),
      }));

      // Ordenar por comisión total descendente
      resultado.sort((a, b) => b.comisionTotal - a.comisionTotal);

      res.json({
        success: true,
        data: resultado,
      });
    } catch (error) {
      console.error('❌ Error al obtener finanzas por vehículo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener finanzas por vehículo',
      });
    }
  }

  /**
   * GET /api/admin/finanzas/transacciones
   * Obtener transacciones recientes con filtros
   */
  static async getTransacciones(req: Request, res: Response): Promise<void> {
    try {
      const { 
        page = '1', 
        limit = '20',
        fechaInicio,
        fechaFin,
        grueroId,
        clienteId,
      } = req.query;

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      const where: any = {
        status: 'COMPLETADO',
        pagado: true,
      };

      // Filtros opcionales
      if (fechaInicio || fechaFin) {
        where.completadoAt = {};
        if (fechaInicio) {
          where.completadoAt.gte = new Date(fechaInicio as string);
        }
        if (fechaFin) {
          const fin = new Date(fechaFin as string);
          fin.setHours(23, 59, 59, 999);
          where.completadoAt.lte = fin;
        }
      }

      if (grueroId) {
        where.grueroId = grueroId;
      }

      if (clienteId) {
        where.clienteId = clienteId;
      }

      const [transacciones, total] = await Promise.all([
        prisma.servicio.findMany({
          where,
          select: {
            id: true,
            tipoVehiculo: true,
            distanciaKm: true,
            totalCliente: true,
            totalGruero: true,
            comisionPlataforma: true,
            comisionMP: true,
            completadoAt: true,
            mpPaymentId: true,
            cliente: {
              select: {
                user: {
                  select: {
                    nombre: true,
                    apellido: true,
                  },
                },
              },
            },
            gruero: {
              select: {
                user: {
                  select: {
                    nombre: true,
                    apellido: true,
                  },
                },
                patente: true,
              },
            },
          },
          orderBy: {
            completadoAt: 'desc',
          },
          skip,
          take: parseInt(limit as string),
        }),
        prisma.servicio.count({ where }),
      ]);

      // Calcular totales de la página actual
      const totalesPagina = transacciones.reduce(
        (acc, t) => ({
          facturacion: acc.facturacion + t.totalCliente,
          pagoGrueros: acc.pagoGrueros + t.totalGruero,
          comisionPlataforma: acc.comisionPlataforma + t.comisionPlataforma,
          comisionMP: acc.comisionMP + t.comisionMP,
        }),
        { facturacion: 0, pagoGrueros: 0, comisionPlataforma: 0, comisionMP: 0 }
      );

      res.json({
        success: true,
        data: transacciones,
        totales: {
          facturacion: Number(totalesPagina.facturacion.toFixed(2)),
          pagoGrueros: Number(totalesPagina.pagoGrueros.toFixed(2)),
          comisionPlataforma: Number(totalesPagina.comisionPlataforma.toFixed(2)),
          comisionMP: Number(totalesPagina.comisionMP.toFixed(2)),
        },
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string)),
        },
      });
    } catch (error) {
      console.error('❌ Error al obtener transacciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener transacciones',
      });
    }
  }

  /**
   * POST /api/admin/debug/marcar-pagados
   * Marcar todos los servicios completados como pagados (SOLO DESARROLLO)
   */
  static async marcarServiciosPagados(req: Request, res: Response): Promise<void> {
    try {
      // Primero, ver cuántos servicios hay
      const completados = await prisma.servicio.count({
        where: { status: 'COMPLETADO' }
      });

      const yaPagados = await prisma.servicio.count({
        where: { 
          status: 'COMPLETADO',
          pagado: true 
        }
      });

      // Actualizar los que NO están pagados
      const result = await prisma.servicio.updateMany({
        where: {
          status: 'COMPLETADO',
          pagado: false,
        },
        data: {
          pagado: true,
        }
      });

      res.json({
        success: true,
        message: `Servicios actualizados exitosamente`,
        data: {
          totalCompletados: completados,
          yaPagados: yaPagados,
          recienMarcados: result.count,
          totalPagadosAhora: yaPagados + result.count,
        }
      });
    } catch (error) {
      console.error('❌ Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar servicios',
      });
    }
  }
}