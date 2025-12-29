import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ReclamoController {
  /**
   * POST /api/reclamos
   * Crear un nuevo reclamo (Cliente o Gruero)
   */
  static async crearReclamo(req: Request, res: Response): Promise<void> {
    try {
      const { servicioId, tipo, descripcion, prioridad, adjuntos } = req.body;
      const userId = (req.user as any)?.userId;  // ← CAMBIADO: .id → .userId
      const userRole = (req.user as any)?.role;

      // LOGS DE DEBUG
      console.log('🔍 [RECLAMO] Intentando crear reclamo');
      console.log('📋 [RECLAMO] Body:', { servicioId, tipo, descripcion, prioridad });
      console.log('👤 [RECLAMO] User:', { userId, userRole });

      // Validaciones
      if (!servicioId || !tipo || !descripcion) {
        console.log('❌ [RECLAMO] Validación fallida: faltan campos requeridos');
        res.status(400).json({
          success: false,
          message: 'Servicio, tipo y descripción son requeridos',
        });
        return;
      }

      // Verificar que el servicio existe y que el usuario está relacionado
      const servicio = await prisma.servicio.findUnique({
        where: { id: servicioId },
        include: {
          cliente: true,
          gruero: true,
        },
      });

      console.log('🔍 [RECLAMO] Servicio encontrado:', servicio ? 'SÍ' : 'NO');
      if (servicio) {
        console.log('📋 [RECLAMO] Cliente userId:', servicio.cliente.userId);
        console.log('📋 [RECLAMO] Gruero userId:', servicio.gruero?.userId || 'No asignado');
        console.log('📋 [RECLAMO] Usuario actual:', userId);
        console.log('📋 [RECLAMO] Rol actual:', userRole);
      }

      if (!servicio) {
        console.log('❌ [RECLAMO] Servicio no encontrado');
        res.status(404).json({
          success: false,
          message: 'Servicio no encontrado',
        });
        return;
      }

      // Verificar que el usuario está relacionado con el servicio
      let reportadoPor = '';
      if (userRole === 'CLIENTE' && servicio.cliente.userId === userId) {
        reportadoPor = 'CLIENTE';
        console.log('✅ [RECLAMO] Usuario es CLIENTE del servicio');
      } else if (userRole === 'GRUERO' && servicio.gruero?.userId === userId) {
        reportadoPor = 'GRUERO';
        console.log('✅ [RECLAMO] Usuario es GRUERO del servicio');
      } else {
        console.log('❌ [RECLAMO] Usuario NO está relacionado con el servicio');
        console.log('🔍 [RECLAMO] Comparación CLIENTE:', {
          userRole,
          esCliente: userRole === 'CLIENTE',
          clienteUserId: servicio.cliente.userId,
          userId,
          coincide: servicio.cliente.userId === userId
        });
        console.log('🔍 [RECLAMO] Comparación GRUERO:', {
          userRole,
          esGruero: userRole === 'GRUERO',
          grueroUserId: servicio.gruero?.userId,
          userId,
          coincide: servicio.gruero?.userId === userId
        });
        res.status(403).json({
          success: false,
          message: 'No tienes permiso para reportar este servicio',
        });
        return;
      }

      console.log('✅ [RECLAMO] Creando reclamo...');

      // Crear el reclamo
      const reclamo = await prisma.reclamo.create({
        data: {
          servicioId,
          tipo,
          descripcion,
          prioridad: prioridad || 'MEDIA',
          reportadoPor,
          reportadorId: userId!,
          adjuntos: adjuntos ? JSON.stringify(adjuntos) : null,
        },
        include: {
          servicio: {
            include: {
              cliente: {
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
            },
          },
        },
      });

      console.log('✅ [RECLAMO] Reclamo creado exitosamente:', reclamo.id);

      // Notificar al otro usuario del servicio
      const otroUserId = reportadoPor === 'CLIENTE' 
        ? servicio.gruero?.userId 
        : servicio.cliente.userId;

      if (otroUserId) {
        await prisma.notificacion.create({
          data: {
            userId: otroUserId,
            tipo: 'RECLAMO_NUEVO',
            titulo: '⚠️ Nuevo Reclamo en Servicio',
            mensaje: `Se ha creado un reclamo sobre el servicio #${servicioId.slice(0, 8)}`,
            data: JSON.stringify({ reclamoId: reclamo.id, servicioId }),
          },
        });
        console.log('✅ [RECLAMO] Notificación enviada a:', otroUserId);
      }

      res.status(201).json({
        success: true,
        message: 'Reclamo creado exitosamente',
        data: reclamo,
      });
    } catch (error) {
      console.error('❌ Error al crear reclamo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear reclamo',
      });
    }
  }

  /**
   * GET /api/reclamos/mis-reclamos
   * Obtener reclamos del usuario autenticado (Cliente o Gruero)
   */
  static async getMisReclamos(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.user as any)?.userId;  // ← CAMBIADO: .id → .userId

      const reclamos = await prisma.reclamo.findMany({
        where: {
          reportadorId: userId,
        },
        include: {
          servicio: {
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
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.json({
        success: true,
        data: reclamos,
      });
    } catch (error) {
      console.error('❌ Error al obtener mis reclamos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener reclamos',
      });
    }
  }

  /**
   * GET /api/reclamos/:id
   * Obtener detalle de un reclamo
   */
  static async getReclamoDetalle(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req.user as any)?.userId;  // ← CAMBIADO: .id → .userId
      const userRole = (req.user as any)?.role;

      const reclamo = await prisma.reclamo.findUnique({
        where: { id },
        include: {
          servicio: {
            include: {
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
            },
          },
        },
      });

      if (!reclamo) {
        res.status(404).json({
          success: false,
          message: 'Reclamo no encontrado',
        });
        return;
      }

      // Verificar permisos (solo admin o usuarios relacionados)
      if (userRole !== 'ADMIN') {
        const esCliente = reclamo.servicio.cliente.userId === userId;
        const esGruero = reclamo.servicio.gruero?.userId === userId;

        if (!esCliente && !esGruero) {
          res.status(403).json({
            success: false,
            message: 'No tienes permiso para ver este reclamo',
          });
          return;
        }
      }

      res.json({
        success: true,
        data: reclamo,
      });
    } catch (error) {
      console.error('❌ Error al obtener reclamo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener reclamo',
      });
    }
  }

  /**
   * GET /api/admin/reclamos
   * Obtener todos los reclamos (Admin)
   */
  static async getAllReclamos(req: Request, res: Response): Promise<void> {
    try {
      const { estado, tipo, prioridad, page = '1', limit = '20' } = req.query;

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

      const where: any = {};

      if (estado && estado !== 'TODOS') {
        where.estado = estado;
      }

      if (tipo && tipo !== 'TODOS') {
        where.tipo = tipo;
      }

      if (prioridad && prioridad !== 'TODOS') {
        where.prioridad = prioridad;
      }

      const [reclamos, total] = await Promise.all([
        prisma.reclamo.findMany({
          where,
          include: {
            servicio: {
              include: {
                cliente: {
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
              },
            },
          },
          orderBy: [
            { estado: 'asc' }, // PENDIENTE primero
            { prioridad: 'desc' }, // ALTA primero
            { createdAt: 'desc' },
          ],
          skip,
          take: parseInt(limit as string),
        }),
        prisma.reclamo.count({ where }),
      ]);

      // Estadísticas
      const estadisticas = {
        total,
        pendientes: await prisma.reclamo.count({ where: { estado: 'PENDIENTE' } }),
        enRevision: await prisma.reclamo.count({ where: { estado: 'EN_REVISION' } }),
        resueltos: await prisma.reclamo.count({ where: { estado: 'RESUELTO' } }),
        rechazados: await prisma.reclamo.count({ where: { estado: 'RECHAZADO' } }),
      };

      res.json({
        success: true,
        data: reclamos,
        estadisticas,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string)),
        },
      });
    } catch (error) {
      console.error('❌ Error al obtener reclamos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener reclamos',
      });
    }
  }

  /**
   * PATCH /api/admin/reclamos/:id/estado
   * Cambiar estado de un reclamo (Admin)
   */
  static async cambiarEstado(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (!estado) {
        res.status(400).json({
          success: false,
          message: 'El estado es requerido',
        });
        return;
      }

      const estadosValidos = ['PENDIENTE', 'EN_REVISION', 'RESUELTO', 'RECHAZADO'];
      if (!estadosValidos.includes(estado)) {
        res.status(400).json({
          success: false,
          message: 'Estado inválido',
        });
        return;
      }

      const reclamo = await prisma.reclamo.update({
        where: { id },
        data: {
          estado,
        },
        include: {
          servicio: {
            include: {
              cliente: true,
              gruero: true,
            },
          },
        },
      });

      // Notificar al reportador
      await prisma.notificacion.create({
        data: {
          userId: reclamo.reportadorId,
          tipo: 'RECLAMO_ACTUALIZADO',
          titulo: `Reclamo ${estado === 'EN_REVISION' ? 'En Revisión' : estado === 'RESUELTO' ? 'Resuelto' : 'Rechazado'}`,
          mensaje: `Tu reclamo ha cambiado a estado: ${estado}`,
          data: JSON.stringify({ reclamoId: id }),
        },
      });

      res.json({
        success: true,
        message: 'Estado actualizado',
        data: reclamo,
      });
    } catch (error) {
      console.error('❌ Error al cambiar estado:', error);
      res.status(500).json({
        success: false,
        message: 'Error al cambiar estado',
      });
    }
  }

  /**
   * PATCH /api/admin/reclamos/:id/resolver
   * Resolver un reclamo (Admin)
   */
  static async resolverReclamo(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { resolucion } = req.body;
      const adminId = (req.user as any)?.userId;  // ← CAMBIADO: .id → .userId

      if (!resolucion) {
        res.status(400).json({
          success: false,
          message: 'La resolución es requerida',
        });
        return;
      }

      const reclamo = await prisma.reclamo.update({
        where: { id },
        data: {
          estado: 'RESUELTO',
          resolucion,
          resueltoAt: new Date(),
          resueltoBy: adminId,
        },
        include: {
          servicio: {
            include: {
              cliente: true,
              gruero: true,
            },
          },
        },
      });

      // Notificar al reportador
      await prisma.notificacion.create({
        data: {
          userId: reclamo.reportadorId,
          tipo: 'RECLAMO_RESUELTO',
          titulo: '✅ Reclamo Resuelto',
          mensaje: `Tu reclamo ha sido resuelto. Resolución: ${resolucion}`,
          data: JSON.stringify({ reclamoId: id }),
        },
      });

      res.json({
        success: true,
        message: 'Reclamo resuelto',
        data: reclamo,
      });
    } catch (error) {
      console.error('❌ Error al resolver reclamo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al resolver reclamo',
      });
    }
  }

  /**
   * PATCH /api/admin/reclamos/:id/rechazar
   * Rechazar un reclamo (Admin)
   */
  static async rechazarReclamo(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { motivo } = req.body;
      const adminId = (req.user as any)?.userId;  // ← CAMBIADO: .id → .userId

      if (!motivo) {
        res.status(400).json({
          success: false,
          message: 'El motivo es requerido',
        });
        return;
      }

      const reclamo = await prisma.reclamo.update({
        where: { id },
        data: {
          estado: 'RECHAZADO',
          resolucion: `RECHAZADO: ${motivo}`,
          resueltoAt: new Date(),
          resueltoBy: adminId,
        },
        include: {
          servicio: {
            include: {
              cliente: true,
              gruero: true,
            },
          },
        },
      });

      // Notificar al reportador
      await prisma.notificacion.create({
        data: {
          userId: reclamo.reportadorId,
          tipo: 'RECLAMO_RECHAZADO',
          titulo: '❌ Reclamo Rechazado',
          mensaje: `Tu reclamo ha sido rechazado. Motivo: ${motivo}`,
          data: JSON.stringify({ reclamoId: id }),
        },
      });

      res.json({
        success: true,
        message: 'Reclamo rechazado',
        data: reclamo,
      });
    } catch (error) {
      console.error('❌ Error al rechazar reclamo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al rechazar reclamo',
      });
    }
  }

  /**
   * PATCH /api/admin/reclamos/:id/notas
   * Agregar notas internas (Admin)
   */
  static async agregarNotas(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { notas } = req.body;

      const reclamo = await prisma.reclamo.update({
        where: { id },
        data: {
          notasInternas: notas,
        },
      });

      res.json({
        success: true,
        message: 'Notas actualizadas',
        data: reclamo,
      });
    } catch (error) {
      console.error('❌ Error al agregar notas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al agregar notas',
      });
    }
  }
}