import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export class ClienteController {
  /**
   * GET /api/cliente/perfil
   * Obtener perfil completo del cliente
   */
  static async getPerfil(req: Request, res: Response) {
    try {
      const userId = (req.user as any)?.userId;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          nombre: true,
          apellido: true,
          telefono: true,
          rut: true,
          createdAt: true,
          clienteProfile: {
            select: {
              id: true,
              cuentaSuspendida: true,
              motivoSuspension: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado',
        });
      }

      // Obtener estadísticas
      const servicios = await prisma.servicio.findMany({
        where: { 
          cliente: {
            userId: userId,
          },
        },
      });

      const stats = {
        totalServicios: servicios.length,
        serviciosCompletados: servicios.filter((s) => s.status === 'COMPLETADO').length,
        serviciosCancelados: servicios.filter((s) => s.status === 'CANCELADO').length,
        totalGastado: servicios
          .filter((s) => s.status === 'COMPLETADO')
          .reduce((sum, s) => sum + s.totalCliente, 0),
      };

      return res.json({
        success: true,
        data: {
          ...user,
          stats,
        },
      });
    } catch (error: any) {
      console.error('❌ Error al obtener perfil:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener perfil',
        error: error.message,
      });
    }
  }

  /**
   * PATCH /api/cliente/perfil
   * Actualizar datos del perfil
   */
  static async updatePerfil(req: Request, res: Response) {
    try {
      const userId = (req.user as any)?.userId;
      const { nombre, apellido, telefono, rut } = req.body;

      // Validaciones
      if (!nombre || !apellido || !telefono) {
        return res.status(400).json({
          success: false,
          message: 'Nombre, apellido y teléfono son requeridos',
        });
      }

      // Verificar que el RUT no esté en uso por otro usuario
      if (rut) {
        const rutExistente = await prisma.user.findFirst({
          where: {
            rut,
            id: { not: userId },
          },
        });

        if (rutExistente) {
          return res.status(400).json({
            success: false,
            message: 'El RUT ya está registrado por otro usuario',
          });
        }
      }

      const userActualizado = await prisma.user.update({
        where: { id: userId },
        data: {
          nombre,
          apellido,
          telefono,
          rut: rut || null,
        },
        select: {
          id: true,
          email: true,
          nombre: true,
          apellido: true,
          telefono: true,
          rut: true,
        },
      });

      return res.json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: userActualizado,
      });
    } catch (error: any) {
      console.error('❌ Error al actualizar perfil:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar perfil',
        error: error.message,
      });
    }
  }

  /**
   * PATCH /api/cliente/password
   * Cambiar contraseña
   */
  static async cambiarPassword(req: Request, res: Response) {
    try {
      const userId = (req.user as any)?.userId;
      const { passwordActual, passwordNuevo } = req.body;

      if (!passwordActual || !passwordNuevo) {
        return res.status(400).json({
          success: false,
          message: 'Contraseña actual y nueva son requeridas',
        });
      }

      if (passwordNuevo.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'La nueva contraseña debe tener al menos 6 caracteres',
        });
      }

      // Verificar contraseña actual
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado',
        });
      }

      const passwordValido = await bcrypt.compare(passwordActual, user.password);

      if (!passwordValido) {
        return res.status(401).json({
          success: false,
          message: 'La contraseña actual es incorrecta',
        });
      }

      // Hashear nueva contraseña
      const hashedPassword = await bcrypt.hash(passwordNuevo, 10);

      // Actualizar contraseña
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      return res.json({
        success: true,
        message: 'Contraseña actualizada exitosamente',
      });
    } catch (error: any) {
      console.error('❌ Error al cambiar contraseña:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al cambiar contraseña',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/cliente/pagos
   * Obtener historial de pagos
   */
  static async getPagos(req: Request, res: Response) {
    try {
      const userId = (req.user as any)?.userId;
      const { page = '1', limit = '20' } = req.query;

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

      const cliente = await prisma.cliente.findUnique({
        where: { userId },
      });

      if (!cliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado',
        });
      }

      const [pagos, total] = await Promise.all([
        prisma.servicio.findMany({
          where: {
            clienteId: cliente.id,
            status: 'COMPLETADO',
            pagado: true,
          },
          select: {
            id: true,
            totalCliente: true,
            completadoAt: true,
            mpPaymentId: true,
            origenDireccion: true,
            destinoDireccion: true,
            gruero: {
              select: {
                user: {
                  select: {
                    nombre: true,
                    apellido: true,
                  },
                },
              },
            },
          },
          orderBy: { completadoAt: 'desc' },
          skip,
          take: parseInt(limit as string),
        }),
        prisma.servicio.count({
          where: {
            clienteId: cliente.id,
            status: 'COMPLETADO',
            pagado: true,
          },
        }),
      ]);

      // Estadísticas
      const todosLosPagos = await prisma.servicio.findMany({
        where: {
          clienteId: cliente.id,
          status: 'COMPLETADO',
          pagado: true,
        },
        select: {
          totalCliente: true,
          completadoAt: true,
        },
      });

      const stats = {
        totalGastado: todosLosPagos.reduce((sum, p) => sum + p.totalCliente, 0),
        totalPagos: todosLosPagos.length,
        promedioGasto: todosLosPagos.length > 0 
          ? todosLosPagos.reduce((sum, p) => sum + p.totalCliente, 0) / todosLosPagos.length 
          : 0,
      };

      return res.json({
        success: true,
        data: pagos,
        stats,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string)),
        },
      });
    } catch (error: any) {
      console.error('❌ Error al obtener pagos:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener historial de pagos',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/cliente/estadisticas
   * Obtener estadísticas generales del cliente
   */
  static async getEstadisticas(req: Request, res: Response) {
    try {
      const userId = (req.user as any)?.userId;

      const cliente = await prisma.cliente.findUnique({
        where: { userId },
      });

      if (!cliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado',
        });
      }

      const servicios = await prisma.servicio.findMany({
        where: { clienteId: cliente.id },
        include: {
          calificacion: true,
        },
      });

      const stats = {
        totalServicios: servicios.length,
        completados: servicios.filter((s) => s.status === 'COMPLETADO').length,
        cancelados: servicios.filter((s) => s.status === 'CANCELADO').length,
        enProceso: servicios.filter((s) => 
          ['SOLICITADO', 'ACEPTADO', 'EN_CAMINO', 'EN_SITIO'].includes(s.status)
        ).length,
        totalGastado: servicios
          .filter((s) => s.status === 'COMPLETADO')
          .reduce((sum, s) => sum + s.totalCliente, 0),
        promedioGasto: servicios.filter((s) => s.status === 'COMPLETADO').length > 0
          ? servicios
              .filter((s) => s.status === 'COMPLETADO')
              .reduce((sum, s) => sum + s.totalCliente, 0) / 
            servicios.filter((s) => s.status === 'COMPLETADO').length
          : 0,
        calificacionesRealizadas: servicios.filter((s) => s.calificacion).length,
      };

      return res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error('❌ Error al obtener estadísticas:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas',
        error: error.message,
      });
    }
  }

  /**
   * DELETE /api/cliente/cuenta
   * Solicitar eliminación de cuenta
   */
  static async eliminarCuenta(req: Request, res: Response) {
    try {
      const userId = (req.user as any)?.userId;
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'La contraseña es requerida para eliminar la cuenta',
        });
      }

      // Verificar contraseña
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado',
        });
      }

      const passwordValido = await bcrypt.compare(password, user.password);

      if (!passwordValido) {
        return res.status(401).json({
          success: false,
          message: 'Contraseña incorrecta',
        });
      }

      // Verificar que no tenga servicios activos
      const cliente = await prisma.cliente.findUnique({
        where: { userId },
      });

      if (cliente) {
        const serviciosActivos = await prisma.servicio.count({
          where: {
            clienteId: cliente.id,
            status: {
              in: ['SOLICITADO', 'ACEPTADO', 'EN_CAMINO', 'EN_SITIO'],
            },
          },
        });

        if (serviciosActivos > 0) {
          return res.status(400).json({
            success: false,
            message: 'No puedes eliminar tu cuenta con servicios activos',
          });
        }
      }

      // Eliminar usuario (cascade eliminará el perfil de cliente)
      await prisma.user.delete({
        where: { id: userId },
      });

      return res.json({
        success: true,
        message: 'Cuenta eliminada exitosamente',
      });
    } catch (error: any) {
      console.error('❌ Error al eliminar cuenta:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al eliminar cuenta',
        error: error.message,
      });
    }
  }
}