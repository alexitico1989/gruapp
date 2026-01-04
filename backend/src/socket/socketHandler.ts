import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface GrueroLocation {
  grueroId: string;
  lat: number;
  lng: number;
}

// Almacenar grueros conectados en memoria
const gruerosSockets = new Map<string, Socket>();

export const setupSocketHandlers = (io: Server) => {
  console.log('🔧 setupSocketHandlers llamado - Registrando handlers...');
  
  io.on('connection', (socket: Socket) => {
    console.log('👤 Cliente conectado:', socket.id);

    // Log de todos los eventos recibidos
    socket.onAny((eventName, ...args) => {
      console.log(`📨 Evento recibido: ${eventName}`, args);
    });

    /**
     * Cliente se registra (para notificaciones)
     */
    socket.on('cliente:register', async (data: { userId: string }) => {
      try {
        const { userId } = data;
        
        // Unir a sala personal del cliente
        socket.join(`cliente-${userId}`);
        socket.data.userId = userId;
        
        console.log(`🔔 Cliente ${userId} unido a sala: cliente-${userId}`);
        
        socket.emit('cliente:registered', {
          success: true,
          userId,
        });
      } catch (error) {
        console.error('❌ Error al registrar cliente:', error);
        socket.emit('error', { message: 'Error al registrar cliente' });
      }
    });

    /**
     * Gruero se registra y comienza a transmitir ubicación
     */
    socket.on('gruero:register', async (data: { grueroId: string; userId: string }) => {
      try {
        const { grueroId, userId } = data;
        
        // ✅ SIEMPRE unir a sala personal (incluso si grueroId está vacío)
        socket.join(`gruero-${userId}`);
        socket.data.userId = userId;
        console.log(`🔔 Gruero ${userId} unido a sala de notificaciones: gruero-${userId}`);
        
        // Si viene grueroId, verificar el gruero y guardar el socket
        if (grueroId) {
          const gruero = await prisma.gruero.findUnique({
            where: { id: grueroId },
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

          if (gruero) {
            // Guardar socket del gruero
            gruerosSockets.set(grueroId, socket);
            socket.data.grueroId = grueroId;

            console.log(`✅ Gruero registrado: ${gruero.user.nombre} (${grueroId})`);

            // Confirmar registro
            socket.emit('gruero:registered', {
              success: true,
              gruero: {
                id: gruero.id,
                nombre: gruero.user.nombre,
                status: gruero.status,
              },
            });

            // Notificar a todos los clientes que hay un nuevo gruero disponible
            io.emit('gruero:conectado', {
              grueroId,
              nombre: gruero.user.nombre,
            });
          } else {
            console.log('⚠️ Gruero no encontrado, pero sala de notificaciones creada');
            socket.emit('gruero:registered', {
              success: true,
              message: 'Sala de notificaciones creada',
            });
          }
        } else {
          // Solo confirmamos que se unió a la sala de notificaciones
          console.log('✅ Sala de notificaciones creada (sin grueroId)');
          socket.emit('gruero:registered', {
            success: true,
            message: 'Sala de notificaciones creada',
          });
        }
      } catch (error) {
        console.error('❌ Error al registrar gruero:', error);
        socket.emit('error', { message: 'Error al registrar gruero' });
      }
    });

    /**
     * Gruero actualiza su ubicación en tiempo real
     */
    socket.on('gruero:updateLocation', async (data: GrueroLocation) => {
      try {
        const { grueroId, lat, lng } = data;

        // Actualizar ubicación en base de datos
        await prisma.gruero.update({
          where: { id: grueroId },
          data: {
            latitud: lat,
            longitud: lng,
          },
        });

        // Emitir ubicación actualizada a todos los clientes
        io.emit('gruero:locationUpdated', {
          grueroId,
          ubicacion: { lat, lng },
        });

        console.log(`📍 Ubicación actualizada - Gruero: ${grueroId} -> (${lat}, ${lng})`);
      } catch (error) {
        console.error('❌ Error actualizando ubicación:', error);
      }
    });

    /**
     * Gruero cambia su disponibilidad
     */
    socket.on('gruero:updateStatus', async (data: { grueroId: string; status: string }) => {
      try {
        const { grueroId, status } = data;

        const gruero = await prisma.gruero.update({
          where: { id: grueroId },
          data: { status },
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

        console.log(`✅ Estado actualizado - Gruero: ${grueroId} -> ${status}`);

        // Si se pone DISPONIBLE, notificar a todos los clientes
        if (status === 'DISPONIBLE' && gruero.latitud && gruero.longitud) {
          const gruaData = {
            id: gruero.id,
            nombre: `${gruero.user.nombre} ${gruero.user.apellido}`,
            telefono: gruero.user.telefono,
            patente: gruero.patente,
            marca: gruero.marca,
            modelo: gruero.modelo,
            capacidad: gruero.capacidadToneladas,
            ubicacion: {
              lat: gruero.latitud,
              lng: gruero.longitud,
            },
            calificacion: gruero.calificacionPromedio,
            totalServicios: gruero.totalServicios,
            fotoGruero: gruero.fotoGruero,
            fotoGrua: gruero.fotoGrua,
          };

          console.log('🚛 Notificando nueva grúa disponible a todos los clientes');
          io.emit('gruero:disponible', gruaData);
        }

        // Notificar cambio de estado general
        io.emit('gruero:statusUpdated', {
          grueroId,
          status,
        });
      } catch (error) {
        console.error('❌ Error actualizando estado:', error);
      }
    });

    /**
     * Cliente solicita grúas disponibles
     */
    socket.on('cliente:getGruasDisponibles', async () => {
      try {
        console.log('🔍 Cliente solicita grúas disponibles...');
        
        const gruas = await prisma.gruero.findMany({
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

        console.log(`📊 Grúas encontradas: ${gruas.length}`);
        gruas.forEach(g => {
          console.log(`  - ${g.user.nombre}: status=${g.status}, lat=${g.latitud}, lng=${g.longitud}`);
        });

        const gruasDisponibles = gruas.map((grua) => ({
          id: grua.id,
          nombre: `${grua.user.nombre} ${grua.user.apellido}`,
          telefono: grua.user.telefono,
          patente: grua.patente,
          marca: grua.marca,
          modelo: grua.modelo,
          capacidad: grua.capacidadToneladas,
          ubicacion: {
            lat: grua.latitud,
            lng: grua.longitud,
          },
          calificacion: grua.calificacionPromedio,
          totalServicios: grua.totalServicios,
          fotoGruero: grua.fotoGruero,
          fotoGrua: grua.fotoGrua,
        }));

        console.log('✅ Enviando grúas al cliente:', gruasDisponibles.length);
        socket.emit('cliente:gruasDisponibles', gruasDisponibles);
      } catch (error) {
        console.error('❌ Error obteniendo grúas:', error);
      }
    });

    /**
     * Servicio aceptado por gruero
     */
    socket.on('servicio:aceptado', async (data: { servicioId: string; grueroId: string }) => {
      try {
        const { servicioId, grueroId } = data;

        console.log(`📤 Servicio aceptado - ID: ${servicioId}, Gruero: ${grueroId}`);

        const servicio = await prisma.servicio.findUnique({
          where: { id: servicioId },
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

        if (servicio && servicio.gruero) {
          console.log(`✅ Notificando aceptación al cliente`);
          
          // Notificar al cliente que su servicio fue aceptado
          io.emit('cliente:servicioAceptado', {
            servicioId,
            gruero: {
              id: servicio.gruero.id,
              nombre: `${servicio.gruero.user.nombre} ${servicio.gruero.user.apellido}`,
              telefono: servicio.gruero.user.telefono,
              patente: servicio.gruero.patente,
            },
          });
        }
      } catch (error) {
        console.error('❌ Error notificando servicio aceptado:', error);
      }
    });

    /**
     * Servicio cambia de estado (EN_CAMINO, EN_SITIO, COMPLETADO, etc)
     */
    socket.on('servicio:estadoActualizado', async (data: any) => {
      try {
        // El evento puede venir como array o como objeto
        const eventData = Array.isArray(data) ? data[0] : data;
        const { servicioId, status } = eventData;

        console.log(`📢 Cambio de estado - Servicio: ${servicioId} -> ${status}`);

        const servicio = await prisma.servicio.findUnique({
          where: { id: servicioId },
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

        if (servicio && servicio.gruero) {
          console.log(`✅ Notificando cambio de estado al cliente`);
          
          // Notificar al cliente el cambio de estado CON DATOS COMPLETOS
          io.emit('cliente:estadoActualizado', {
            servicioId,
            status,
            servicio: {
              id: servicio.id,
              origenDireccion: servicio.origenDireccion,
              destinoDireccion: servicio.destinoDireccion,
              distanciaKm: servicio.distanciaKm,
              totalCliente: servicio.totalCliente,
            },
            gruero: {
              id: servicio.gruero.id,
              nombre: servicio.gruero.user.nombre,
              apellido: servicio.gruero.user.apellido,
              telefono: servicio.gruero.user.telefono,
              patente: servicio.gruero.patente,
              marca: servicio.gruero.marca,
              modelo: servicio.gruero.modelo,
              capacidad: servicio.gruero.capacidadToneladas,
              calificacion: servicio.gruero.calificacionPromedio,
            },
          });
        } else {
          console.log('⚠️ Servicio o gruero no encontrado');
        }
      } catch (error) {
        console.error('❌ Error notificando cambio de estado:', error);
      }
    });

    /**
     * Servicio cancelado
     */
    socket.on('servicio:cancelado', async (data: { servicioId: string; canceladoPor: string }) => {
      try {
        const { servicioId, canceladoPor } = data;

        console.log(`🚫 Servicio cancelado - ID: ${servicioId}, Cancelado por: ${canceladoPor}`);

        const servicio = await prisma.servicio.findUnique({
          where: { id: servicioId },
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

        if (servicio) {
          // Notificar a ambas partes
          io.emit('servicio:canceladoNotificacion', {
            servicioId,
            canceladoPor,
            cliente: servicio.cliente ? {
              nombre: `${servicio.cliente.user.nombre} ${servicio.cliente.user.apellido}`,
            } : null,
            gruero: servicio.gruero ? {
              nombre: `${servicio.gruero.user.nombre} ${servicio.gruero.user.apellido}`,
            } : null,
          });

          console.log(`✅ Notificación de cancelación enviada`);
        }
      } catch (error) {
        console.error('❌ Error notificando cancelación:', error);
      }
    });

    /**
     * Desconexión
     */
    socket.on('disconnect', () => {
      const grueroId = socket.data.grueroId;

      if (grueroId) {
        gruerosSockets.delete(grueroId);
        console.log(`🔴 Gruero desconectado: ${grueroId}`);

        // Notificar desconexión
        io.emit('gruero:desconectado', { grueroId });
      } else {
        console.log('🔴 Cliente desconectado:', socket.id);
      }
    });
  });

  console.log('✅ Socket.IO handlers configurados');
};