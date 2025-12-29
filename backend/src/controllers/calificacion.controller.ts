import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { CalificarServicioDTO } from '../types';
import EmailService from '../services/email.service';

const prisma = new PrismaClient();

export class CalificacionController {
  /**
   * Crear calificación para un servicio completado
   */
  static async crearCalificacion(req: Request, res: Response) {
    try {
      const data: CalificarServicioDTO = req.body;
      const userId = req.user?.userId;
      const role = req.user?.role;
      
      // Verificar que el servicio existe y está completado
      const servicio = await prisma.servicio.findUnique({
        where: { id: data.servicioId },
        include: {
          cliente: {
            include: {
              user: true,
            },
          },
          gruero: {
            include: {
              user: true,
            },
          },
        },
      });
      
      if (!servicio) {
        return res.status(404).json({
          success: false,
          message: 'Servicio no encontrado',
        });
      }
      
      if (servicio.status !== 'COMPLETADO') {
        return res.status(400).json({
          success: false,
          message: 'Solo se pueden calificar servicios completados',
        });
      }
      
      // Verificar que el usuario sea parte del servicio
      if (role === 'CLIENTE') {
        const cliente = await prisma.cliente.findUnique({ where: { userId } });
        if (servicio.clienteId !== cliente?.id) {
          return res.status(403).json({
            success: false,
            message: 'No tienes permiso para calificar este servicio',
          });
        }
      } else if (role === 'GRUERO') {
        const gruero = await prisma.gruero.findUnique({ where: { userId } });
        if (servicio.grueroId !== gruero?.id) {
          return res.status(403).json({
            success: false,
            message: 'No tienes permiso para calificar este servicio',
          });
        }
      }
      
      // Verificar si ya existe una calificación
      const calificacionExistente = await prisma.calificacion.findUnique({
        where: { servicioId: data.servicioId },
      });
      
      if (calificacionExistente) {
        return res.status(400).json({
          success: false,
          message: 'Este servicio ya tiene una calificación',
        });
      }
      
      // Validar puntuaciones (1-5)
      if (
        data.puntuacionGruero < 1 ||
        data.puntuacionGruero > 5 ||
        data.puntuacionCliente < 1 ||
        data.puntuacionCliente > 5
      ) {
        return res.status(400).json({
          success: false,
          message: 'Las puntuaciones deben estar entre 1 y 5',
        });
      }
      
      if (!servicio.grueroId) {
        return res.status(400).json({
          success: false,
          message: 'El servicio no tiene un gruero asignado',
        });
      }
      
      // Crear calificación
      const calificacion = await prisma.calificacion.create({
        data: {
          servicioId: data.servicioId,
          clienteId: servicio.clienteId,
          grueroId: servicio.grueroId,
          puntuacionGruero: data.puntuacionGruero,
          comentarioGruero: data.comentarioGruero,
          puntuacionCliente: data.puntuacionCliente,
          comentarioCliente: data.comentarioCliente,
        },
      });
      
      // Actualizar promedio de calificación del gruero
      const todasCalificaciones = await prisma.calificacion.findMany({
        where: { grueroId: servicio.grueroId },
        select: { puntuacionGruero: true },
      });
      
      const promedio =
        todasCalificaciones.reduce((sum, c) => sum + c.puntuacionGruero, 0) /
        todasCalificaciones.length;
      
      await prisma.gruero.update({
        where: { id: servicio.grueroId },
        data: { calificacionPromedio: Math.round(promedio * 10) / 10 },
      });
      
      // 📧 ENVIAR EMAIL AL GRUERO (solo si es el cliente quien califica)
      if (role === 'CLIENTE' && servicio.gruero) {
        EmailService.enviarCalificacionRecibida({
          email: servicio.gruero.user.email,
          nombre: servicio.gruero.user.nombre,
          apellido: servicio.gruero.user.apellido,
          calificacion: data.puntuacionGruero,
          comentario: data.comentarioGruero,
          nombreCliente: `${servicio.cliente.user.nombre} ${servicio.cliente.user.apellido}`,
        }).catch((error) => {
          console.error('❌ Error al enviar email de calificación:', error);
          // No fallar la calificación si el email falla
        });
      }
      
      return res.status(201).json({
        success: true,
        message: 'Calificación creada exitosamente',
        data: calificacion,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error al crear calificación',
        error: error.message,
      });
    }
  }
  
  /**
   * Obtener calificaciones de un gruero
   */
  static async getCalificacionesGruero(req: Request, res: Response) {
    try {
      const { grueroId } = req.params;
      
      const calificaciones = await prisma.calificacion.findMany({
        where: { grueroId },
        include: {
          servicio: {
            select: {
              origenDireccion: true,
              destinoDireccion: true,
              completadoAt: true,
            },
          },
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
        orderBy: { createdAt: 'desc' },
      });
      
      // Calcular estadísticas
      const total = calificaciones.length;
      const promedio =
        total > 0
          ? calificaciones.reduce((sum, c) => sum + c.puntuacionGruero, 0) / total
          : 0;
      
      const distribucion = {
        5: calificaciones.filter((c) => c.puntuacionGruero === 5).length,
        4: calificaciones.filter((c) => c.puntuacionGruero === 4).length,
        3: calificaciones.filter((c) => c.puntuacionGruero === 3).length,
        2: calificaciones.filter((c) => c.puntuacionGruero === 2).length,
        1: calificaciones.filter((c) => c.puntuacionGruero === 1).length,
      };
      
      return res.status(200).json({
        success: true,
        data: {
          calificaciones,
          estadisticas: {
            total,
            promedio: Math.round(promedio * 10) / 10,
            distribucion,
          },
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener calificaciones',
        error: error.message,
      });
    }
  }
  
  /**
   * Obtener calificación de un servicio específico
   */
  static async getCalificacionServicio(req: Request, res: Response) {
    try {
      const { servicioId } = req.params;
      
      const calificacion = await prisma.calificacion.findUnique({
        where: { servicioId },
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
      });
      
      if (!calificacion) {
        return res.status(404).json({
          success: false,
          message: 'Calificación no encontrada',
        });
      }
      
      return res.status(200).json({
        success: true,
        data: calificacion,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener calificación',
        error: error.message,
      });
    }
  }
}