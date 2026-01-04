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
          fotoGruero: gruero.fotoGruero,
          fotoGrua: gruero.fotoGrua,
          licenciaConducir: gruero.licenciaConducir,
          licenciaVencimiento: gruero.licenciaVencimiento,
          seguroVigente: gruero.seguroVigente,
          seguroVencimiento: gruero.seguroVencimiento,
          revisionTecnica: gruero.revisionTecnica,
          revisionVencimiento: gruero.revisionVencimiento,
          permisoCirculacion: gruero.permisoCirculacion,
          permisoVencimiento: gruero.permisoVencimiento,
          cuentaSuspendida: gruero.cuentaSuspendida,
          motivoSuspension: gruero.motivoSuspension,
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

        // Tipos válidos - EXACTAMENTE IGUALES al ClienteDashboard y PerfilGruero
        const tiposValidos = ['AUTOMOVIL', 'CAMIONETA', 'MOTO', 'FURGONETA', 'LIVIANO', 'MEDIANO', 'PESADO', 'BUS', 'MAQUINARIA'];
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
      const { status } = req.body;

      if (!status || !['DISPONIBLE', 'OCUPADO', 'OFFLINE'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Estado inválido. Debe ser: DISPONIBLE, OCUPADO u OFFLINE',
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

      // Verificar si la cuenta está suspendida
      if (gruero.cuentaSuspendida && status === 'DISPONIBLE') {
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
   * Subir documentos del gruero (método antiguo - mantener por compatibilidad)
   */
  static async uploadDocumentos(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const { licenciaConducir, seguroVigente, revisionTecnica } = req.body;
      
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
          ...(licenciaConducir && { licenciaConducir }),
          ...(seguroVigente && { seguroVigente }),
          ...(revisionTecnica && { revisionTecnica }),
        },
      });
      
      return res.status(200).json({
        success: true,
        message: 'Documentos actualizados',
        data: grueroActualizado,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error al subir documentos',
        error: error.message,
      });
    }
  }

  /**
   * Subir foto del gruero
   */
  static async uploadFotoGruero(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No se recibió ningún archivo',
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

      // Actualizar con la URL relativa del archivo
      const fotoUrl = `/uploads/gruero-photos/${file.filename}`;

      await prisma.gruero.update({
        where: { id: gruero.id },
        data: { fotoGruero: fotoUrl },
      });

      return res.status(200).json({
        success: true,
        message: 'Foto de perfil actualizada',
        data: {
          fotoGruero: fotoUrl,
        },
      });
    } catch (error: any) {
      console.error('Error subiendo foto de gruero:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al subir foto',
        error: error.message,
      });
    }
  }

  /**
   * Subir foto de la grúa
   */
  static async uploadFotoGrua(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No se recibió ningún archivo',
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

      // Actualizar con la URL relativa del archivo
      const fotoUrl = `/uploads/grua-photos/${file.filename}`;

      await prisma.gruero.update({
        where: { id: gruero.id },
        data: { fotoGrua: fotoUrl },
      });

      return res.status(200).json({
        success: true,
        message: 'Foto de la grúa actualizada',
        data: {
          fotoGrua: fotoUrl,
        },
      });
    } catch (error: any) {
      console.error('Error subiendo foto de grúa:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al subir foto',
        error: error.message,
      });
    }
  }

  /**
   * Subir documento con fecha de vencimiento
   */
  static async uploadDocumento(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const file = req.file;
      const { tipoDocumento, fechaVencimiento } = req.body;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No se recibió ningún archivo',
        });
      }

      if (!tipoDocumento) {
        return res.status(400).json({
          success: false,
          message: 'Debe especificar el tipo de documento',
        });
      }

      const tiposValidos = ['licenciaConducir', 'seguroVigente', 'revisionTecnica', 'permisoCirculacion'];
      if (!tiposValidos.includes(tipoDocumento)) {
        return res.status(400).json({
          success: false,
          message: 'Tipo de documento inválido',
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

      // Construir objeto de actualización dinámicamente
      const documentoUrl = `/uploads/documentos/${file.filename}`;
      const updateData: any = {
        [tipoDocumento]: documentoUrl,
      };

      // Agregar fecha de vencimiento si se proporciona
      if (fechaVencimiento) {
        const campoVencimiento = tipoDocumento.replace('Conducir', '').replace('Vigente', '').replace('Tecnica', '').replace('Circulacion', '') + 'Vencimiento';
        updateData[campoVencimiento] = new Date(fechaVencimiento);
      }

      // Actualizar documento
      const grueroActualizado = await prisma.gruero.update({
        where: { id: gruero.id },
        data: updateData,
      });

      // Verificar vencimientos
      const hoy = new Date();
      const documentosVencidos = [];

      if (grueroActualizado.licenciaVencimiento && grueroActualizado.licenciaVencimiento < hoy) {
        documentosVencidos.push('Licencia de Conducir');
      }
      if (grueroActualizado.seguroVencimiento && grueroActualizado.seguroVencimiento < hoy) {
        documentosVencidos.push('Seguro');
      }
      if (grueroActualizado.revisionVencimiento && grueroActualizado.revisionVencimiento < hoy) {
        documentosVencidos.push('Revisión Técnica');
      }
      if (grueroActualizado.permisoVencimiento && grueroActualizado.permisoVencimiento < hoy) {
        documentosVencidos.push('Permiso de Circulación');
      }

      // Si hay documentos vencidos, suspender cuenta
      if (documentosVencidos.length > 0) {
        await prisma.gruero.update({
          where: { id: gruero.id },
          data: {
            cuentaSuspendida: true,
            motivoSuspension: `DOCUMENTOS_VENCIDOS: ${documentosVencidos.join(', ')}`,
            status: 'SUSPENDIDO',
          },
        });
      } else {
        // Si todos los documentos están al día, reactivar cuenta si estaba suspendida
        if (grueroActualizado.cuentaSuspendida && grueroActualizado.motivoSuspension?.includes('DOCUMENTOS_VENCIDOS')) {
          await prisma.gruero.update({
            where: { id: gruero.id },
            data: {
              cuentaSuspendida: false,
              motivoSuspension: null,
              status: 'OFFLINE',
            },
          });
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Documento actualizado exitosamente',
        data: {
          tipoDocumento,
          url: documentoUrl,
          fechaVencimiento: fechaVencimiento || null,
          documentosVencidos: documentosVencidos.length > 0 ? documentosVencidos : null,
        },
      });
    } catch (error: any) {
      console.error('Error subiendo documento:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al subir documento',
        error: error.message,
      });
    }
  }

  /**
   * Verificar documentos próximos a vencer (alerta 10 días antes)
   */
  static async verificarDocumentos(req: Request, res: Response) {
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
      const en10Dias = new Date();
      en10Dias.setDate(en10Dias.getDate() + 10);

      const alertas = [];

      // Verificar cada documento
      if (gruero.licenciaVencimiento) {
        if (gruero.licenciaVencimiento < hoy) {
          alertas.push({
            tipo: 'licenciaConducir',
            mensaje: 'Licencia de Conducir VENCIDA',
            fechaVencimiento: gruero.licenciaVencimiento,
            estado: 'vencido',
          });
        } else if (gruero.licenciaVencimiento <= en10Dias) {
          alertas.push({
            tipo: 'licenciaConducir',
            mensaje: 'Licencia de Conducir próxima a vencer',
            fechaVencimiento: gruero.licenciaVencimiento,
            estado: 'proximo',
          });
        }
      }

      if (gruero.seguroVencimiento) {
        if (gruero.seguroVencimiento < hoy) {
          alertas.push({
            tipo: 'seguroVigente',
            mensaje: 'Seguro VENCIDO',
            fechaVencimiento: gruero.seguroVencimiento,
            estado: 'vencido',
          });
        } else if (gruero.seguroVencimiento <= en10Dias) {
          alertas.push({
            tipo: 'seguroVigente',
            mensaje: 'Seguro próximo a vencer',
            fechaVencimiento: gruero.seguroVencimiento,
            estado: 'proximo',
          });
        }
      }

      if (gruero.revisionVencimiento) {
        if (gruero.revisionVencimiento < hoy) {
          alertas.push({
            tipo: 'revisionTecnica',
            mensaje: 'Revisión Técnica VENCIDA',
            fechaVencimiento: gruero.revisionVencimiento,
            estado: 'vencido',
          });
        } else if (gruero.revisionVencimiento <= en10Dias) {
          alertas.push({
            tipo: 'revisionTecnica',
            mensaje: 'Revisión Técnica próxima a vencer',
            fechaVencimiento: gruero.revisionVencimiento,
            estado: 'proximo',
          });
        }
      }

      if (gruero.permisoVencimiento) {
        if (gruero.permisoVencimiento < hoy) {
          alertas.push({
            tipo: 'permisoCirculacion',
            mensaje: 'Permiso de Circulación VENCIDO',
            fechaVencimiento: gruero.permisoVencimiento,
            estado: 'vencido',
          });
        } else if (gruero.permisoVencimiento <= en10Dias) {
          alertas.push({
            tipo: 'permisoCirculacion',
            mensaje: 'Permiso de Circulación próximo a vencer',
            fechaVencimiento: gruero.permisoVencimiento,
            estado: 'proximo',
          });
        }
      }

      return res.status(200).json({
        success: true,
        data: {
          cuentaSuspendida: gruero.cuentaSuspendida,
          motivoSuspension: gruero.motivoSuspension,
          alertas,
        },
      });
    } catch (error: any) {
      console.error('Error verificando documentos:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al verificar documentos',
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
}