import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { CreateServicioDTO } from '../types';
import { RoutingService } from '../utils/routing';
import { PricingService } from '../utils/pricing';
import { calcularDistancia, filtrarGruerosPorDistancia } from '../utils/distance';
import { NotificacionController } from './notificacion.controller';

const prisma = new PrismaClient();

// Configuración de radio máximo (en kilómetros)
const RADIO_MAXIMO_KM = 10;

// Definir qué tipos de vehículo son pesados
const VEHICULOS_PESADOS = ['MEDIANO', 'PESADO', 'BUS', 'MAQUINARIA'];

export class ServicioController {
  /**
   * Crear una nueva solicitud de servicio
   */
  static async createServicio(req: Request, res: Response) {
    try {
      const data: CreateServicioDTO = req.body;
      const userId = req.user?.userId;
      
      // Verificar que el usuario tenga perfil de cliente
      const cliente = await prisma.cliente.findUnique({
        where: { userId },
      });
      
      if (!cliente) {
        return res.status(403).json({
          success: false,
          message: 'Solo los clientes pueden solicitar servicios',
        });
      }
      
      // Calcular la ruta real usando OSRM
      const route = await RoutingService.calculateRoute(
        data.origenLat,
        data.origenLng,
        data.destinoLat,
        data.destinoLng
      );
      
      // Convertir distancia a km
      const distanciaKm = RoutingService.metersToKm(route.distance);
      
      // Determinar si el vehículo es pesado
      const tipoVehiculo = data.tipoVehiculo || 'AUTOMOVIL';
      const esPesado = VEHICULOS_PESADOS.includes(tipoVehiculo);
      
      // Calcular pricing con tarifas diferenciadas
      const pricing = esPesado 
        ? PricingService.calculatePricingPesado(distanciaKm)  // Tarifas pesados
        : PricingService.calculatePricing(distanciaKm);       // Tarifas livianos
      
      console.log(`🚗 Tipo de vehículo: ${tipoVehiculo} | Pesado: ${esPesado}`);
      console.log(`💰 Pricing calculado:`, pricing);
      
      // Crear el servicio
      const servicio = await prisma.servicio.create({
        data: {
          clienteId: cliente.id,
          origenLat: data.origenLat,
          origenLng: data.origenLng,
          origenDireccion: data.origenDireccion,
          destinoLat: data.destinoLat,
          destinoLng: data.destinoLng,
          destinoDireccion: data.destinoDireccion,
          tipoVehiculo: tipoVehiculo, // ← Guardar tipo de vehículo
          distanciaKm: pricing.distanciaKm,
          tarifaBase: pricing.tarifaBase,
          tarifaDistancia: pricing.tarifaDistancia,
          subtotal: pricing.subtotal,
          comisionPlataforma: pricing.comisionPlataforma,
          comisionMP: pricing.comisionMP,
          totalCliente: pricing.totalCliente,
          totalGruero: pricing.totalGruero,
          status: 'SOLICITADO',
          observaciones: data.observaciones,
        },
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
        },
      });
      
      // Buscar grueros disponibles FILTRADOS por distancia Y tipo de vehículo
      const gruerosCercanos = await ServicioController.getGruerosCercanos(
        data.origenLat,
        data.origenLng,
        RADIO_MAXIMO_KM,
        tipoVehiculo // ← Pasar tipo de vehículo para filtrar
      );
      
      console.log(`📍 Grueros cercanos que atienden ${tipoVehiculo} (< ${RADIO_MAXIMO_KM}km):`, gruerosCercanos.length);
      
      // Emitir notificación SOLO a grueros cercanos que atienden este tipo de vehículo
      const io = (req as any).app.get('io');
      if (io && gruerosCercanos.length > 0) {
        gruerosCercanos.forEach(async (gruero) => {
          io.to(`gruero-${gruero.userId}`).emit('nuevo-servicio', {
            servicio,
            distancia: gruero.distancia,
          });
          console.log(`🔔 Notificación enviada a gruero ${gruero.user.nombre} (${gruero.distancia}km) - Atiende ${tipoVehiculo}`);
          
          // Guardar notificación en la base de datos
          const notificacion = await NotificacionController.crearNotificacion(
            gruero.userId,
            'NUEVO_SERVICIO',
            'Nuevo servicio disponible',
            `Servicio de ${tipoVehiculo} disponible a ${gruero.distancia}km de distancia`,
            { servicioId: servicio.id, distancia: gruero.distancia, tipoVehiculo }
          );

          // Emitir notificación en tiempo real
          if (notificacion && io) {
            const salaGruero = `gruero-${gruero.userId}`;
            console.log('📤 [Backend] Emitiendo a sala:', salaGruero);
            io.to(salaGruero).emit('nueva-notificacion', notificacion);
            console.log('✅ [Backend] Notificación emitida');
          }
        });
      }
      
      return res.status(201).json({
        success: true,
        message: 'Servicio creado exitosamente',
        data: {
          servicio,
          gruerosCercanos: gruerosCercanos.length,
          tipoVehiculo,
          esPesado,
          ruta: {
            distanciaKm: pricing.distanciaKm,
            duracionMinutos: RoutingService.secondsToMinutes(route.duration),
            geometry: route.geometry,
          },
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error al crear servicio',
        error: error.message,
      });
    }
  }

  /**
   * Obtener grueros cercanos dentro del radio máximo QUE ATIENDAN el tipo de vehículo
   */
  static async getGruerosCercanos(
    lat: number, 
    lng: number, 
    radioKm: number = RADIO_MAXIMO_KM,
    tipoVehiculo?: string
  ) {
    // Construir filtro base (sin tipo de vehículo por ahora)
    const whereCondition: any = {
      status: 'DISPONIBLE',
      verificado: true,
      cuentaSuspendida: false,
      latitud: { not: null },
      longitud: { not: null },
    };
    
    // Obtener grueros que cumplen los criterios base
    const gruerosDisponibles = await prisma.gruero.findMany({
      where: whereCondition,
      include: {
        user: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            telefono: true,
          },
        },
      },
    });
    
    // Filtrar por tipo de vehículo en memoria (porque es un campo JSON string)
    let gruerosFiltrados = gruerosDisponibles;
    if (tipoVehiculo) {
      gruerosFiltrados = gruerosDisponibles.filter(gruero => {
        try {
          const tipos = JSON.parse(gruero.tiposVehiculosAtiende);
          return Array.isArray(tipos) && tipos.includes(tipoVehiculo);
        } catch (error) {
          console.error('Error parseando tiposVehiculosAtiende:', error);
          return false;
        }
      });
    }
    
    console.log(`🔍 Grueros disponibles que atienden ${tipoVehiculo}:`, gruerosFiltrados.length);
    
    // Filtrar por distancia y agregar campo de distancia
    const gruerosCercanos = gruerosFiltrados
      .map(gruero => ({
        ...gruero,
        userId: gruero.user.id,
        distancia: calcularDistancia(lat, lng, gruero.latitud!, gruero.longitud!),
      }))
      .filter(gruero => gruero.distancia <= radioKm)
      .sort((a, b) => a.distancia - b.distancia); // Ordenar por más cercano
    
    return gruerosCercanos;
  }

  /**
   * Obtener servicio activo del cliente
   */
  static async getServicioActivo(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      
      const cliente = await prisma.cliente.findUnique({
        where: { userId },
      });
      
      if (!cliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado',
        });
      }
      
      // Buscar servicio activo (cualquier estado excepto COMPLETADO y CANCELADO)
      const servicioActivo = await prisma.servicio.findFirst({
        where: {
          clienteId: cliente.id,
          status: {
            notIn: ['COMPLETADO', 'CANCELADO'],
          },
        },
        include: {
          gruero: {
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
        },
        orderBy: {
          solicitadoAt: 'desc',
        },
      });
      
      return res.status(200).json({
        success: true,
        data: servicioActivo,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener servicio activo',
        error: error.message,
      });
    }
  }

  /**
   * Obtener historial de servicios
   */
  static async getHistorialServicios(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const role = req.user?.role;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      let servicios;
      
      if (role === 'CLIENTE') {
        const cliente = await prisma.cliente.findUnique({
          where: { userId },
        });
        
        if (!cliente) {
          return res.status(404).json({
            success: false,
            message: 'Cliente no encontrado',
          });
        }
        
        servicios = await prisma.servicio.findMany({
          where: {
            clienteId: cliente.id,
            status: {
              in: ['COMPLETADO', 'CANCELADO'],
            },
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
            calificacion: true,
          },
          orderBy: { solicitadoAt: 'desc' },
          take: limit,
        });
      } else if (role === 'GRUERO') {
        const gruero = await prisma.gruero.findUnique({
          where: { userId },
        });
        
        if (!gruero) {
          return res.status(404).json({
            success: false,
            message: 'Gruero no encontrado',
          });
        }
        
        servicios = await prisma.servicio.findMany({
          where: {
            grueroId: gruero.id,
            status: {
              in: ['COMPLETADO', 'CANCELADO'],
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
            calificacion: true,
          },
          orderBy: { solicitadoAt: 'desc' },
          take: limit,
        });
      }
      
      return res.status(200).json({
        success: true,
        data: servicios,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener historial',
        error: error.message,
      });
    }
  }

  /**
   * Obtener servicios pendientes (para grueros) - FILTRADOS POR DISTANCIA Y TIPO DE VEHÍCULO
   */
  static async getServiciosPendientes(req: Request, res: Response) {
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
      
      // Verificar que el gruero tenga ubicación
      if (!gruero.latitud || !gruero.longitud) {
        return res.status(400).json({
          success: false,
          message: 'Debes activar tu ubicación para ver servicios disponibles',
          data: [],
        });
      }
      
      // Obtener TODOS los servicios solicitados
      const todosLosServicios = await prisma.servicio.findMany({
        where: {
          status: 'SOLICITADO',
          grueroId: null,
        },
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
        },
        orderBy: {
          solicitadoAt: 'desc',
        },
      });
      
      // Filtrar por distancia Y por tipo de vehículo que atiende el gruero
      const serviciosCercanos = todosLosServicios
        .filter(servicio => {
          // Verificar si el gruero atiende este tipo de vehículo (parsear JSON)
          try {
            const tipos = JSON.parse(gruero.tiposVehiculosAtiende);
            return Array.isArray(tipos) && tipos.includes(servicio.tipoVehiculo);
          } catch (error) {
            console.error('Error parseando tiposVehiculosAtiende:', error);
            return false;
          }
        })
        .map(servicio => ({
          ...servicio,
          distancia: calcularDistancia(
            gruero.latitud!,
            gruero.longitud!,
            servicio.origenLat,
            servicio.origenLng
          ),
        }))
        .filter(servicio => servicio.distancia <= RADIO_MAXIMO_KM)
        .sort((a, b) => a.distancia - b.distancia);
      
      console.log(`📍 Servicios cercanos para gruero que puede atender (< ${RADIO_MAXIMO_KM}km):`, serviciosCercanos.length);
      
      return res.status(200).json({
        success: true,
        data: serviciosCercanos,
        radioMaximoKm: RADIO_MAXIMO_KM,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener servicios pendientes',
        error: error.message,
      });
    }
  }

  /**
   * Calificar un servicio
   */
  static async calificarServicio(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { calificacion, comentario } = req.body;
      const userId = req.user?.userId;
      
      console.log('📝 Intentando calificar servicio:', { id, calificacion, comentario, userId });
      
      // Validar calificación
      if (!calificacion || calificacion < 1 || calificacion > 5) {
        return res.status(400).json({
          success: false,
          message: 'La calificación debe estar entre 1 y 5',
        });
      }
      
      // Verificar que el servicio existe y está completado
      const servicio = await prisma.servicio.findUnique({
        where: { id },
        include: {
          cliente: true,
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
      
      if (!servicio.grueroId) {
        return res.status(400).json({
          success: false,
          message: 'Este servicio no tiene gruero asignado',
        });
      }
      
      // Verificar que el usuario es el cliente del servicio
      const cliente = await prisma.cliente.findUnique({
        where: { userId },
      });
      
      if (!cliente || servicio.clienteId !== cliente.id) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para calificar este servicio',
        });
      }
      
      // Crear o actualizar calificación usando los campos correctos del schema
      const calificacionData = await prisma.calificacion.upsert({
        where: { servicioId: id },
        update: {
          puntuacionGruero: calificacion,
          comentarioGruero: comentario || null,
        },
        create: {
          servicioId: id,
          clienteId: cliente.id,
          grueroId: servicio.grueroId,
          puntuacionGruero: calificacion,
          comentarioGruero: comentario || null,
          puntuacionCliente: 0,
          comentarioCliente: null,
        },
      });
      
      console.log('✅ Calificación creada:', calificacionData);
      
      // Recalcular promedio del gruero
      const calificaciones = await prisma.calificacion.findMany({
        where: { grueroId: servicio.grueroId },
      });
      
      const promedio =
        calificaciones.reduce((sum, cal) => sum + cal.puntuacionGruero, 0) /
        calificaciones.length;
      
      await prisma.gruero.update({
        where: { id: servicio.grueroId },
        data: { calificacionPromedio: promedio },
      });
      
      console.log('✅ Promedio actualizado:', promedio);
      
      // Notificar al gruero que recibió una calificación
      const io = (req as any).app.get('io');
      if (servicio.gruero) {
        const notificacion = await NotificacionController.crearNotificacion(
          servicio.gruero.user.id,
          'CALIFICACION',
          'Nueva calificación recibida',
          `Recibiste ${calificacion} estrella${calificacion > 1 ? 's' : ''} de calificación`,
          { servicioId: servicio.id, calificacion, comentario }
        );
        
        // Emitir notificación en tiempo real
        if (notificacion && io) {
          io.to(`gruero-${servicio.gruero.user.id}`).emit('nueva-notificacion', notificacion);
        }
      }
      
      return res.status(200).json({
        success: true,
        message: 'Calificación registrada exitosamente',
        data: calificacionData,
      });
    } catch (error: any) {
      console.error('❌ Error al calificar servicio:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al calificar servicio',
        error: error.message,
      });
    }
  }
  
  /**
   * Obtener servicios del cliente autenticado
   */
  static async getMisServicios(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const role = req.user?.role;
      
      let servicios;
      
      if (role === 'CLIENTE') {
        const cliente = await prisma.cliente.findUnique({
          where: { userId },
        });
        
        servicios = await prisma.servicio.findMany({
          where: { clienteId: cliente?.id },
          include: {
            gruero: {
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
            calificacion: true,
          },
          orderBy: { solicitadoAt: 'desc' },
        });
      } else if (role === 'GRUERO') {
        const gruero = await prisma.gruero.findUnique({
          where: { userId },
        });
        
        servicios = await prisma.servicio.findMany({
          where: { grueroId: gruero?.id },
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
            calificacion: true,
          },
          orderBy: { solicitadoAt: 'desc' },
        });
      }
      
      return res.status(200).json({
        success: true,
        data: servicios,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener servicios',
        error: error.message,
      });
    }
  }
  
  /**
   * Obtener detalle de un servicio
   */
  static async getServicioById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const servicio = await prisma.servicio.findUnique({
        where: { id },
        include: {
          cliente: {
            include: {
              user: {
                select: {
                  nombre: true,
                  apellido: true,
                  telefono: true,
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
                  telefono: true,
                  email: true,
                },
              },
            },
          },
          calificacion: true,
        },
      });
      
      if (!servicio) {
        return res.status(404).json({
          success: false,
          message: 'Servicio no encontrado',
        });
      }
      
      return res.status(200).json({
        success: true,
        data: servicio,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener servicio',
        error: error.message,
      });
    }
  }
  
  /**
   * Gruero acepta un servicio
   */
  static async acceptServicio(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      
      // Verificar que sea gruero
      const gruero = await prisma.gruero.findUnique({
        where: { userId },
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
      
      if (!gruero) {
        return res.status(403).json({
          success: false,
          message: 'Solo los grueros pueden aceptar servicios',
        });
      }
      
      if (!gruero.verificado) {
        return res.status(403).json({
          success: false,
          message: 'Tu cuenta debe estar verificada para aceptar servicios',
        });
      }
      
      // Verificar que el servicio esté disponible
      const servicio = await prisma.servicio.findUnique({
        where: { id },
      });
      
      if (!servicio) {
        return res.status(404).json({
          success: false,
          message: 'Servicio no encontrado',
        });
      }
      
      if (servicio.status !== 'SOLICITADO') {
        return res.status(400).json({
          success: false,
          message: 'Este servicio ya no está disponible',
        });
      }
      
      // Verificar que el gruero atiende este tipo de vehículo (parsear JSON)
      let atiendeVehiculo = false;
      try {
        const tipos = JSON.parse(gruero.tiposVehiculosAtiende);
        atiendeVehiculo = Array.isArray(tipos) && tipos.includes(servicio.tipoVehiculo);
      } catch (error) {
        console.error('Error parseando tiposVehiculosAtiende:', error);
      }
      
      if (!atiendeVehiculo) {
        return res.status(400).json({
          success: false,
          message: `No puedes aceptar este servicio. Tu grúa no está configurada para atender vehículos tipo ${servicio.tipoVehiculo}`,
        });
      }
      
      // Verificar que el servicio esté dentro del radio máximo
      if (gruero.latitud && gruero.longitud) {
        const distancia = calcularDistancia(
          gruero.latitud,
          gruero.longitud,
          servicio.origenLat,
          servicio.origenLng
        );
        
        if (distancia > RADIO_MAXIMO_KM) {
          return res.status(400).json({
            success: false,
            message: `Este servicio está muy lejos (${distancia.toFixed(1)}km). Radio máximo: ${RADIO_MAXIMO_KM}km`,
          });
        }
      }
      
      // Aceptar el servicio
      const servicioActualizado = await prisma.servicio.update({
        where: { id },
        data: {
          grueroId: gruero.id,
          status: 'ACEPTADO',
          aceptadoAt: new Date(),
        },
        include: {
          cliente: {
            include: {
              user: true,
            },
          },
        },
      });
      
      // Actualizar estado del gruero
      await prisma.gruero.update({
        where: { id: gruero.id },
        data: { status: 'OCUPADO' },
      });
      
      // Notificar al cliente via Socket.io
      const io = (req as any).app.get('io');
      if (io) {
        io.to(`cliente-${servicioActualizado.cliente.userId}`).emit('servicio-aceptado', {
          servicio: servicioActualizado,
          gruero: {
            nombre: gruero.user.nombre,
            apellido: gruero.user.apellido,
            telefono: gruero.user.telefono,
          },
        });
        
        // Guardar notificación en la base de datos
        const notificacion = await NotificacionController.crearNotificacion(
          servicioActualizado.cliente.userId,
          'SERVICIO_ACEPTADO',
          'Gruero aceptó tu solicitud',
          `${gruero.user.nombre} ${gruero.user.apellido} aceptó tu servicio`,
          { servicioId: servicioActualizado.id, grueroId: gruero.id }
        );
        
        // Emitir notificación en tiempo real
        if (notificacion) {
          io.to(`cliente-${servicioActualizado.cliente.userId}`).emit('nueva-notificacion', notificacion);
        }
      }
      
      return res.status(200).json({
        success: true,
        message: 'Servicio aceptado exitosamente',
        data: servicioActualizado,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error al aceptar servicio',
        error: error.message,
      });
    }
  }
  
  /**
   * Actualizar estado del servicio
   */
  static async updateEstado(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const validStatuses = ['EN_CAMINO', 'EN_SITIO', 'COMPLETADO', 'CANCELADO'];
      
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Estado inválido',
        });
      }
      
      const updateData: any = { status };
      
      // Agregar timestamps según el estado
      if (status === 'EN_CAMINO') updateData.enCaminoAt = new Date();
      if (status === 'EN_SITIO') updateData.enSitioAt = new Date();
      if (status === 'COMPLETADO') {
        updateData.completadoAt = new Date();
        
        // Liberar gruero
        const servicio = await prisma.servicio.findUnique({ where: { id } });
        if (servicio?.grueroId) {
          await prisma.gruero.update({
            where: { id: servicio.grueroId },
            data: { 
              status: 'DISPONIBLE',
              totalServicios: { increment: 1 },
            },
          });
        }
      }
      if (status === 'CANCELADO') updateData.canceladoAt = new Date();
      
      const servicioActualizado = await prisma.servicio.update({
        where: { id },
        data: updateData,
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
      
      // Notificar cambio de estado via Socket.io
      const io = (req as any).app.get('io');
      if (io) {
        // ✅ CORREGIDO: Emitir al cliente
        io.to(`cliente-${servicioActualizado.cliente.userId}`).emit('servicio-actualizado', {
          servicio: servicioActualizado,
          nuevoEstado: status,
        });
        
        // ✅ NUEVO: Si hay gruero asignado, también notificarle
        if (servicioActualizado.gruero) {
          console.log(`📤 Emitiendo cliente:estadoActualizado al gruero ${servicioActualizado.gruero.user.id}`);
          io.to(`gruero-${servicioActualizado.gruero.user.id}`).emit('cliente:estadoActualizado', {
            servicioId: servicioActualizado.id,
            status: status,
          });
          
          // ✅ También emitir evento alternativo por compatibilidad
          io.to(`gruero-${servicioActualizado.gruero.user.id}`).emit('servicio-actualizado', {
            servicio: servicioActualizado,
            nuevoEstado: status,
          });
        }
        
        // Guardar notificación en la base de datos
        const mensajes: Record<string, string> = {
          'EN_CAMINO': 'El gruero está en camino',
          'EN_SITIO': 'El gruero llegó al sitio',
          'COMPLETADO': 'Servicio completado',
          'CANCELADO': 'Servicio cancelado',
        };
        
        const notificacion = await NotificacionController.crearNotificacion(
          servicioActualizado.cliente.userId,
          status,
          'Estado del servicio actualizado',
          mensajes[status] || 'El estado de tu servicio cambió',
          { servicioId: servicioActualizado.id, nuevoEstado: status }
        );
        
        // Emitir notificación en tiempo real
        if (notificacion) {
          io.to(`cliente-${servicioActualizado.cliente.userId}`).emit('nueva-notificacion', notificacion);
        }
      }
      
      return res.status(200).json({
        success: true,
        message: 'Estado actualizado',
        data: servicioActualizado,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar estado',
        error: error.message,
      });
    }
  }
  
  /**
   * Cancelar servicio
   */
  static async cancelServicio(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { motivo } = req.body;
      
      const servicio = await prisma.servicio.findUnique({
        where: { id },
        include: {
          cliente: {
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
      
      if (servicio.status === 'COMPLETADO' || servicio.status === 'CANCELADO') {
        return res.status(400).json({
          success: false,
          message: 'No se puede cancelar este servicio',
        });
      }
      
      const servicioActualizado = await prisma.servicio.update({
        where: { id },
        data: {
          status: 'CANCELADO',
          canceladoAt: new Date(),
          motivoCancelacion: motivo,
        },
      });
      
      // Liberar gruero si estaba asignado
      if (servicio.grueroId) {
        await prisma.gruero.update({
          where: { id: servicio.grueroId },
          data: { status: 'DISPONIBLE' },
        });
      }
      
      // Notificar cancelación via Socket.io
      const io = (req as any).app.get('io');
      if (io) {
        // Notificar al cliente
        io.to(`cliente-${servicio.cliente.userId}`).emit('servicio-cancelado', {
          servicio: servicioActualizado,
          motivo,
        });
        
        // Guardar notificación para el cliente
        const notificacionCliente = await NotificacionController.crearNotificacion(
          servicio.cliente.userId,
          'CANCELADO',
          'Servicio cancelado',
          motivo || 'El servicio ha sido cancelado',
          { servicioId: servicioActualizado.id, motivo }
        );
        
        // Emitir notificación en tiempo real al cliente
        if (notificacionCliente) {
          io.to(`cliente-${servicio.cliente.userId}`).emit('nueva-notificacion', notificacionCliente);
        }
        
        // Si había gruero asignado, notificarle también
        if (servicio.grueroId) {
          const gruero = await prisma.gruero.findUnique({
            where: { id: servicio.grueroId },
            include: { user: true },
          });
          if (gruero) {
            io.to(`gruero-${gruero.user.id}`).emit('servicio-cancelado', {
              servicio: servicioActualizado,
              motivo,
            });
            
            // Guardar notificación para el gruero
            const notificacionGruero = await NotificacionController.crearNotificacion(
              gruero.user.id,
              'CANCELADO',
              'Servicio cancelado',
              motivo || 'El servicio ha sido cancelado',
              { servicioId: servicioActualizado.id, motivo }
            );
            
            // Emitir notificación en tiempo real al gruero
            if (notificacionGruero) {
              io.to(`gruero-${gruero.user.id}`).emit('nueva-notificacion', notificacionGruero);
            }
          }
        }
      }
      
      return res.status(200).json({
        success: true,
        message: 'Servicio cancelado',
        data: servicioActualizado,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error al cancelar servicio',
        error: error.message,
      });
    }
  }
}