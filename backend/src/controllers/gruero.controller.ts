import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { UpdateGrueroLocationDTO } from '../types';
import { config } from '../config';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export class GrueroController {
  /**
 * Obtener perfil del gruero autenticado
 */
  static async getPerfil(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      const gruero = await prisma.gruero.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true,
              telefono: true,
              rut: true,
              createdAt: true,
            },
          },
        },
      });

      if (!gruero) {
        return res.status(404).json({
          success: false,
          message: 'Gruero no encontrado',
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          id: gruero.id,
          userId: gruero.userId,
          patente: gruero.patente,
          marca: gruero.marca,
          modelo: gruero.modelo,
          anio: gruero.anio,
          tipoGrua: gruero.tipoGrua,
          capacidadToneladas: gruero.capacidadToneladas,
          tiposVehiculosAtiende: gruero.tiposVehiculosAtiende,
          status: gruero.status,
          latitud: gruero.latitud,
          longitud: gruero.longitud,
          verificado: gruero.verificado,
          totalServicios: gruero.totalServicios,
          calificacionPromedio: gruero.calificacionPromedio,
          cuentaSuspendida: gruero.cuentaSuspendida,
          motivoSuspension: gruero.motivoSuspension,
          // ✅ NUEVO: Campos de cuenta bancaria
          banco: gruero.banco,
          tipoCuenta: gruero.tipoCuenta,
          numeroCuenta: gruero.numeroCuenta,
          nombreTitular: gruero.nombreTitular,
          rutTitular: gruero.rutTitular,
          emailTransferencia: gruero.emailTransferencia,
          user: gruero.user,
        },
      });
    } catch (error: any) {
      console.error('Error obteniendo perfil gruero:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener perfil',
        error: error.message,
      });
    }
  }

  /**
 * ADMIN - Obtener detalle completo de un gruero por ID
 * GET /api/admin/grueros/:id
 */
static async adminGetGrueroById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const gruero = await prisma.gruero.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            telefono: true,
            rut: true,
            createdAt: true,
          },
        },
      },
    });

    if (!gruero) {
      return res.status(404).json({
        success: false,
        message: 'Gruero no encontrado',
      });
    }

    return res.json({
      success: true,
      data: {
        id: gruero.id,
        patente: gruero.patente,
        marca: gruero.marca,
        modelo: gruero.modelo,
        anio: gruero.anio,
        tipoGrua: gruero.tipoGrua,
        capacidadToneladas: gruero.capacidadToneladas,
        tiposVehiculosAtiende: gruero.tiposVehiculosAtiende,
        status: gruero.status,
        verificado: gruero.verificado,
        totalServicios: gruero.totalServicios,
        calificacionPromedio: gruero.calificacionPromedio,
        cuentaSuspendida: gruero.cuentaSuspendida,
        motivoSuspension: gruero.motivoSuspension,

        // 🔥 CAMPOS QUE NO VEÍAS EN EL ADMIN
        banco: gruero.banco,
        tipoCuenta: gruero.tipoCuenta,
        numeroCuenta: gruero.numeroCuenta,
        nombreTitular: gruero.nombreTitular,
        rutTitular: gruero.rutTitular,
        emailTransferencia: gruero.emailTransferencia,

        user: gruero.user,
      },
    });
  } catch (error: any) {
    console.error('❌ Error adminGetGrueroById:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener detalle del gruero',
    });
  }
}


  /**
   * Obtener ubicación actual de un gruero específico
   * GET /api/grueros/:id/ubicacion
   */
  static async getUbicacionGruero(req: Request, res: Response) {
    console.log('🎯 [CONTROLLER] getUbicacionGruero EJECUTADO');
    console.log('🎯 [CONTROLLER] ID recibido:', req.params.id);
    console.log('🎯 [CONTROLLER] URL:', req.originalUrl);
    console.log('🎯 [CONTROLLER] Method:', req.method);
    
    try {
      const { id } = req.params;

      const gruero = await prisma.gruero.findUnique({
        where: { id },
        select: {
          latitud: true,
          longitud: true,
          status: true,
        },
      });

      if (!gruero) {
        console.log('❌ [CONTROLLER] Gruero no encontrado:', id);
        return res.status(404).json({
          success: false,
          message: 'Gruero no encontrado',
        });
      }

      if (!gruero.latitud || !gruero.longitud) {
        console.log('❌ [CONTROLLER] Gruero sin ubicación:', id);
        return res.status(404).json({
          success: false,
          message: 'Gruero sin ubicación registrada',
        });
      }

      console.log('✅ [CONTROLLER] Ubicación encontrada');
      
      return res.json({
        success: true,
        data: {
          lat: gruero.latitud,
          lng: gruero.longitud,
          status: gruero.status,
        },
      });
    } catch (error: any) {
      console.error('❌ [CONTROLLER] Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener ubicación del gruero',
        error: error.message,
      });
    }
  }

  /**
   * Actualizar información personal del gruero
   */
  static async updatePerfil(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const { nombre, apellido, telefono, email } = req.body;

      // Actualizar usuario
      const userUpdated = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(nombre && { nombre }),
          ...(apellido && { apellido }),
          ...(telefono && { telefono }),
          ...(email && { email }),
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: userUpdated,
      });
    } catch (error: any) {
      console.error('Error actualizando perfil:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar perfil',
        error: error.message,
      });
    }
  }

  /**
   * Actualizar información del vehículo
   */
  static async updateVehiculo(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const { patente, marca, modelo, anio, capacidadToneladas, tipoGrua, tiposVehiculosAtiende } = req.body;

      const gruero = await prisma.gruero.findUnique({
        where: { userId },
      });

      if (!gruero) {
        return res.status(404).json({
          success: false,
          message: 'Gruero no encontrado',
        });
      }

      // Validar tiposVehiculosAtiende si se proporciona
      if (tiposVehiculosAtiende) {
        if (!Array.isArray(tiposVehiculosAtiende)) {
          return res.status(400).json({
            success: false,
            message: 'tiposVehiculosAtiende debe ser un array',
          });
        }

        if (tiposVehiculosAtiende.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Debes seleccionar al menos un tipo de vehículo',
          });
        }

        // Tipos válidos - NOMBRES REALES DE LA BASE DE DATOS
        const tiposValidos = ['AUTOMOVIL', 'SUV', 'MOTO', 'FURGON', 'CAMION_LIVIANO', 'CAMION_MEDIANO', 'CAMION_PESADO', 'BUS', 'MAQUINARIA'];
        const tiposInvalidos = tiposVehiculosAtiende.filter(tipo => !tiposValidos.includes(tipo));
        
        if (tiposInvalidos.length > 0) {
          return res.status(400).json({
            success: false,
            message: `Tipos de vehículo inválidos: ${tiposInvalidos.join(', ')}`,
          });
        }
      }

      const grueroUpdated = await prisma.gruero.update({
        where: { id: gruero.id },
        data: {
          ...(patente && { patente }),
          ...(marca && { marca }),
          ...(modelo && { modelo }),
          ...(anio && { anio: parseInt(anio) }),
          ...(capacidadToneladas && { capacidadToneladas: parseFloat(capacidadToneladas) }),
          ...(tipoGrua && { tipoGrua }),
          ...(tiposVehiculosAtiende && { tiposVehiculosAtiende: JSON.stringify(tiposVehiculosAtiende) }),
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Información del vehículo actualizada',
        data: grueroUpdated,
      });
    } catch (error: any) {
      console.error('Error actualizando vehículo:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar vehículo',
        error: error.message,
      });
    }
  }

  /**
   * Actualizar disponibilidad del gruero
   */
  static async updateDisponibilidad(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const { disponible } = req.body;

      // Validar que sea boolean
      if (typeof disponible !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'El campo disponible debe ser true o false',
        });
      }

      const gruero = await prisma.gruero.findUnique({
        where: { userId },
      });

      if (!gruero) {
        return res.status(404).json({
          success: false,
          message: 'Gruero no encontrado',
        });
      }

      // Convertir boolean a status
      const status = disponible ? 'DISPONIBLE' : 'OFFLINE';

      // Verificar si la cuenta está suspendida
      if (gruero.cuentaSuspendida && disponible) {
        return res.status(403).json({
          success: false,
          message: 'No puedes ponerte disponible con la cuenta suspendida',
          motivoSuspension: gruero.motivoSuspension,
        });
      }

      const grueroActualizado = await prisma.gruero.update({
        where: { id: gruero.id },
        data: { status },
      });

      return res.status(200).json({
        success: true,
        message: 'Disponibilidad actualizada',
        data: {
          id: grueroActualizado.id,
          status: grueroActualizado.status,
          disponible: grueroActualizado.status === 'DISPONIBLE',
        },
      });
    } catch (error: any) {
      console.error('Error actualizando disponibilidad:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar disponibilidad',
        error: error.message,
      });
    }
  }

  /**
   * Actualizar ubicación y estado del gruero
   */
  static async updateLocation(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const data: UpdateGrueroLocationDTO = req.body;
      
      const gruero = await prisma.gruero.findUnique({
        where: { userId },
      });
      
      if (!gruero) {
        return res.status(404).json({
          success: false,
          message: 'Perfil de gruero no encontrado',
        });
      }
      
      const grueroActualizado = await prisma.gruero.update({
        where: { id: gruero.id },
        data: {
          latitud: data.latitud,
          longitud: data.longitud,
          status: data.status,
        },
      });
      
      return res.status(200).json({
        success: true,
        message: 'Ubicación actualizada',
        data: grueroActualizado,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar ubicación',
        error: error.message,
      });
    }
  }
  
  /**
   * Obtener grueros disponibles cercanos a una ubicación
   */
  static async getGruerosDisponibles(req: Request, res: Response) {
    try {
      const { lat, lng } = req.query;
      
      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          message: 'Se requieren coordenadas (lat, lng)',
        });
      }
      
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);
      
      const grueros = await prisma.gruero.findMany({
        where: {
          status: 'DISPONIBLE',
          verificado: true,
          cuentaSuspendida: false,
          latitud: { not: null },
          longitud: { not: null },
        },
        include: {
          user: {
            select: {
              nombre: true,
              apellido: true,
              telefono: true,
            },
          },
        },
      });
      
      const gruerosConDistancia = grueros
        .map((gruero) => {
          const distance = this.calculateDistance(
            latitude,
            longitude,
            gruero.latitud!,
            gruero.longitud!
          );
          
          return {
            ...gruero,
            distanciaKm: Math.round(distance * 100) / 100,
          };
        })
        .filter((gruero) => gruero.distanciaKm <= config.grueroSearchRadius)
        .sort((a, b) => a.distanciaKm - b.distanciaKm);
      
      return res.status(200).json({
        success: true,
        data: gruerosConDistancia,
        total: gruerosConDistancia.length,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error al buscar grueros',
        error: error.message,
      });
    }
  }
  
  /**
   * Obtener estadísticas del gruero
   */
  static async getEstadisticas(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      
      const gruero = await prisma.gruero.findUnique({
        where: { userId },
      });
      
      if (!gruero) {
        return res.status(404).json({
          success: false,
          message: 'Perfil de gruero no encontrado',
        });
      }

      // Servicios completados
      const serviciosCompletados = await prisma.servicio.count({
        where: {
          grueroId: gruero.id,
          status: 'COMPLETADO',
        },
      });

      // Servicios activos
      const serviciosActivos = await prisma.servicio.count({
        where: {
          grueroId: gruero.id,
          status: {
            in: ['ACEPTADO', 'EN_CAMINO', 'EN_SITIO'],
          },
        },
      });

      // Ganancias hoy
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const serviciosHoy = await prisma.servicio.findMany({
        where: {
          grueroId: gruero.id,
          status: 'COMPLETADO',
          completadoAt: {
            gte: hoy,
          },
        },
        select: {
          totalGruero: true,
        },
      });

      const gananciasHoy = serviciosHoy.reduce((sum, s) => sum + s.totalGruero, 0);

      // Ganancias esta semana
      const inicioSemana = new Date();
      inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
      inicioSemana.setHours(0, 0, 0, 0);

      const serviciosSemana = await prisma.servicio.findMany({
        where: {
          grueroId: gruero.id,
          status: 'COMPLETADO',
          completadoAt: {
            gte: inicioSemana,
          },
        },
        select: {
          totalGruero: true,
        },
      });

      const gananciasSemana = serviciosSemana.reduce((sum, s) => sum + s.totalGruero, 0);

      // Ganancias mes
      const inicioMes = new Date();
      inicioMes.setDate(1);
      inicioMes.setHours(0, 0, 0, 0);

      const serviciosMes = await prisma.servicio.findMany({
        where: {
          grueroId: gruero.id,
          status: 'COMPLETADO',
          completadoAt: {
            gte: inicioMes,
          },
        },
        select: {
          totalGruero: true,
        },
      });

      const gananciasMes = serviciosMes.reduce((sum, s) => sum + s.totalGruero, 0);

      // Ganancias totales
      const serviciosTotales = await prisma.servicio.findMany({
        where: {
          grueroId: gruero.id,
          status: 'COMPLETADO',
        },
        select: {
          totalGruero: true,
        },
      });

      const gananciasTotales = serviciosTotales.reduce((sum, s) => sum + s.totalGruero, 0);
      
      return res.status(200).json({
        success: true,
        data: {
          serviciosCompletados,
          serviciosActivos,
          gananciasHoy,
          gananciasSemana,
          gananciasMes,
          gananciasTotales,
          calificacionPromedio: gruero.calificacionPromedio,
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas',
        error: error.message,
      });
    }
  }

  /**
   * Obtener historial de servicios del gruero (MEJORADO)
   */
  static async getHistorial(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const { 
        page = '1', 
        limit = '20', 
        status, 
        periodo // 'hoy', 'semana', 'mes', 'todo'
      } = req.query;

      const gruero = await prisma.gruero.findUnique({
        where: { userId },
      });

      if (!gruero) {
        return res.status(404).json({
          success: false,
          message: 'Gruero no encontrado',
        });
      }

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

      const where: any = {
        grueroId: gruero.id,
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
          include: {
            cliente: {
              include: {
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

      // Calcular resumen
      const resumen = {
        totalServicios: total,
        completados: await prisma.servicio.count({ 
          where: { ...where, status: 'COMPLETADO' } 
        }),
        cancelados: await prisma.servicio.count({ 
          where: { ...where, status: 'CANCELADO' } 
        }),
        gananciasTotal: servicios
          .filter(s => s.status === 'COMPLETADO')
          .reduce((sum, s) => sum + s.totalGruero, 0),
      };

      return res.status(200).json({
        success: true,
        data: servicios,
        resumen,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string)),
        },
      });
    } catch (error: any) {
      console.error('Error obteniendo historial:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener historial',
        error: error.message,
      });
    }
  }

  /**
   * DELETE /api/gruero/cuenta
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
      const gruero = await prisma.gruero.findUnique({
        where: { userId },
      });

      if (!gruero) {
        return res.status(404).json({
          success: false,
          message: 'Gruero no encontrado',
        });
      }

      const serviciosActivos = await prisma.servicio.count({
        where: {
          grueroId: gruero.id,
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

      // Eliminar en el orden correcto para respetar las relaciones

      // 1. Eliminar calificaciones donde el gruero es calificado
      await prisma.calificacion.deleteMany({
        where: { grueroId: gruero.id },
      });

      // 2. Eliminar reclamos de los servicios del gruero
      const serviciosGruero = await prisma.servicio.findMany({
        where: { grueroId: gruero.id },
        select: { id: true },
      });

      const servicioIds = serviciosGruero.map(s => s.id);

      if (servicioIds.length > 0) {
        await prisma.reclamo.deleteMany({
          where: { servicioId: { in: servicioIds } },
        });
      }

      // 3. Eliminar servicios del gruero
      await prisma.servicio.deleteMany({
        where: { grueroId: gruero.id },
      });

      // 4. Eliminar notificaciones del usuario
      await prisma.notificacion.deleteMany({
        where: { userId: userId },
      });

      // 5. Eliminar perfil de gruero
      await prisma.gruero.delete({
        where: { id: gruero.id },
      });

      // 6. Finalmente eliminar usuario
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
  
  /**
   * Calcular distancia entre dos puntos (Haversine)
   */
  private static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
 * GET /api/gruero/ganancias
 * Obtener estadísticas detalladas de ganancias
 */
  static async getGanancias(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      const gruero = await prisma.gruero.findUnique({
        where: { userId },
      });

      if (!gruero) {
        return res.status(404).json({
          success: false,
          message: 'Gruero no encontrado',
        });
      }

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      // Ganancias hoy
      const serviciosHoy = await prisma.servicio.findMany({
        where: {
          grueroId: gruero.id,
          status: 'COMPLETADO',
          completadoAt: { gte: hoy },
        },
        select: { totalGruero: true },
      });
      const gananciasHoy = serviciosHoy.reduce((sum, s) => sum + s.totalGruero, 0);

      // Ganancias esta semana
      const inicioSemana = new Date();
      inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
      inicioSemana.setHours(0, 0, 0, 0);

      const serviciosSemana = await prisma.servicio.findMany({
        where: {
          grueroId: gruero.id,
          status: 'COMPLETADO',
          completadoAt: { gte: inicioSemana },
        },
        select: { totalGruero: true, completadoAt: true },
      });
      const gananciasSemana = serviciosSemana.reduce((sum, s) => sum + s.totalGruero, 0);

      // Ganancias mes actual
      const inicioMes = new Date();
      inicioMes.setDate(1);
      inicioMes.setHours(0, 0, 0, 0);

      const serviciosMes = await prisma.servicio.findMany({
        where: {
          grueroId: gruero.id,
          status: 'COMPLETADO',
          completadoAt: { gte: inicioMes },
        },
        select: { totalGruero: true },
      });
      const gananciasMes = serviciosMes.reduce((sum, s) => sum + s.totalGruero, 0);

      // Ganancias año actual
      const inicioAno = new Date();
      inicioAno.setMonth(0, 1);
      inicioAno.setHours(0, 0, 0, 0);

      const serviciosAno = await prisma.servicio.findMany({
        where: {
          grueroId: gruero.id,
          status: 'COMPLETADO',
          completadoAt: { gte: inicioAno },
        },
        select: { totalGruero: true },
      });
      const gananciasAno = serviciosAno.reduce((sum, s) => sum + s.totalGruero, 0);

      // Ganancias totales históricas
      const serviciosTotales = await prisma.servicio.findMany({
        where: {
          grueroId: gruero.id,
          status: 'COMPLETADO',
        },
        select: { totalGruero: true },
      });
      const gananciasTotales = serviciosTotales.reduce((sum, s) => sum + s.totalGruero, 0);

      // Ganancias por día de la semana actual (para gráfico)
      const gananciasPorDia = Array(7).fill(0);
      serviciosSemana.forEach(s => {
        if (s.completadoAt) {
          const dia = s.completadoAt.getDay();
          gananciasPorDia[dia] += s.totalGruero;
        }
      });

      // Promedio diario del mes
      const diasTranscurridos = new Date().getDate();
      const promedioDiario = Math.round(gananciasMes / diasTranscurridos);

      return res.json({
        success: true,
        data: {
          hoy: {
            monto: Math.round(gananciasHoy),
            servicios: serviciosHoy.length,
          },
          semana: {
            monto: Math.round(gananciasSemana),
            servicios: serviciosSemana.length,
            porDia: gananciasPorDia.map(g => Math.round(g)),
          },
          mes: {
            monto: Math.round(gananciasMes),
            servicios: serviciosMes.length,
            promedioDiario,
          },
          ano: {
            monto: Math.round(gananciasAno),
            servicios: serviciosAno.length,
          },
          totales: {
            monto: Math.round(gananciasTotales),
            servicios: serviciosTotales.length,
          },
        },
      });
    } catch (error: any) {
      console.error('Error obteniendo ganancias:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener ganancias',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/gruero/pagos-pendientes
   * Obtener pagos pendientes y historial
   */
  static async getPagosPendientes(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      const gruero = await prisma.gruero.findUnique({
        where: { userId },
      });

      if (!gruero) {
        return res.status(404).json({
          success: false,
          message: 'Gruero no encontrado',
        });
      }

      // Servicios completados sin pagar (no asignados a ningún pago)
      const serviciosSinPagar = await prisma.servicio.findMany({
        where: {
          grueroId: gruero.id,
          status: 'COMPLETADO',
          pagoId: null,
        },
        select: {
          id: true,
          totalGruero: true,
          completadoAt: true,
          origenDireccion: true,
          destinoDireccion: true,
        },
        orderBy: {
          completadoAt: 'desc',
        },
      });

      const montoPendiente = serviciosSinPagar.reduce((sum, s) => sum + s.totalGruero, 0);

      // Historial de pagos
      const pagos = await prisma.pago.findMany({
        where: {
          grueroId: gruero.id,
        },
        include: {
          servicios: {
            select: {
              id: true,
              totalGruero: true,
              completadoAt: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 20,
      });

      return res.json({
        success: true,
        data: {
          pendiente: {
            monto: Math.round(montoPendiente),
            servicios: serviciosSinPagar.length,
            detalles: serviciosSinPagar,
          },
          historial: pagos.map(p => ({
            id: p.id,
            periodo: p.periodo,
            fechaInicio: p.fechaInicio,
            fechaFin: p.fechaFin,
            monto: p.montoTotal,
            servicios: p.totalServicios,
            estado: p.estado,
            metodoPago: p.metodoPago,
            numeroComprobante: p.numeroComprobante,
            pagadoAt: p.pagadoAt,
            notasAdmin: p.notasAdmin,
          })),
        },
      });
    } catch (error: any) {
      console.error('Error obteniendo pagos pendientes:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener pagos pendientes',
        error: error.message,
      });
    }
  }

  /**
   * PUT /api/gruero/cuenta-bancaria
   * Actualizar o crear cuenta bancaria
   */
  static async updateCuentaBancaria(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const {
        banco,
        tipoCuenta,
        numeroCuenta,
        nombreTitular,
        rutTitular,
        emailTransferencia,
      } = req.body;

      const gruero = await prisma.gruero.findUnique({
        where: { userId },
        include: {
          user: {
            select: { rut: true, nombre: true, apellido: true },
          },
        },
      });

      if (!gruero) {
        return res.status(404).json({
          success: false,
          message: 'Gruero no encontrado',
        });
      }

      // Si no proporciona datos, usar RUT como Cuenta RUT del Banco Estado
      const datosFinales = {
        banco: banco || 'Banco Estado',
        tipoCuenta: tipoCuenta || 'CUENTA_RUT',
        numeroCuenta: numeroCuenta || gruero.user.rut?.replace(/\./g, '').replace('-', ''),
        nombreTitular: nombreTitular || `${gruero.user.nombre} ${gruero.user.apellido}`,
        rutTitular: rutTitular || gruero.user.rut,
        emailTransferencia: emailTransferencia || null,
      };

      const grueroActualizado = await prisma.gruero.update({
        where: { id: gruero.id },
        data: datosFinales,
      });

      return res.json({
        success: true,
        message: 'Cuenta bancaria actualizada exitosamente',
        data: {
          banco: grueroActualizado.banco,
          tipoCuenta: grueroActualizado.tipoCuenta,
          numeroCuenta: grueroActualizado.numeroCuenta,
          nombreTitular: grueroActualizado.nombreTitular,
          rutTitular: grueroActualizado.rutTitular,
          emailTransferencia: grueroActualizado.emailTransferencia,
        },
      });
    } catch (error: any) {
      console.error('Error actualizando cuenta bancaria:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar cuenta bancaria',
        error: error.message,
      });
    }
  }
}