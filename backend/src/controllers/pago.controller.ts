import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import EmailService from '../services/email.service';
import PDFGenerator from '../utils/pdf-generator';

const prisma = new PrismaClient();

// Configurar Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || '',
});

export class PagoController {
  /**
   * POST /api/pagos/crear-preferencia
   * Crear preferencia de pago para un servicio
   */
  static async crearPreferencia(req: Request, res: Response) {
    try {
      const userId = (req.user as any)?.userId;
      const { servicioId } = req.body;

      if (!servicioId) {
        return res.status(400).json({
          success: false,
          message: 'servicioId es requerido',
        });
      }

      // Buscar el servicio
      const servicio = await prisma.servicio.findUnique({
        where: { id: servicioId },
        include: {
          cliente: {
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

      if (!servicio) {
        return res.status(404).json({
          success: false,
          message: 'Servicio no encontrado',
        });
      }

      // Verificar que el servicio pertenece al cliente autenticado
      if (servicio.cliente.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para pagar este servicio',
        });
      }

      // Verificar que el servicio esté completado
      if (servicio.status !== 'COMPLETADO') {
        return res.status(400).json({
          success: false,
          message: 'Solo puedes pagar servicios completados',
        });
      }

      // Verificar que no esté ya pagado
      if (servicio.pagado) {
        return res.status(400).json({
          success: false,
          message: 'Este servicio ya fue pagado',
        });
      }

      // Crear instancia de Preference
      const preference = new Preference(client);

      // Crear preferencia de pago
      const body = {
        items: [
          {
            id: servicio.id,
            title: 'Servicio de Grua',
            description: 'Servicio de grua',
            quantity: 1,
            unit_price: Number(servicio.totalCliente),
            currency_id: 'CLP',
          },
        ],
        back_urls: {
          success: `${process.env.FRONTEND_URL}/cliente/servicios?payment=success&servicioId=${servicioId}`,
          failure: `${process.env.FRONTEND_URL}/cliente/servicios?payment=failure&servicioId=${servicioId}`,
          pending: `${process.env.FRONTEND_URL}/cliente/servicios?payment=pending&servicioId=${servicioId}`,
        },
        notification_url: `${process.env.BACKEND_URL}/api/pagos/webhook`,
        external_reference: servicioId,
      };

      console.log('📝 Creando preferencia MP:', JSON.stringify(body, null, 2));

      const result = await preference.create({ body });

      console.log('✅ Preferencia creada:', result.id);

      // Guardar el ID de preferencia en el servicio
      await prisma.servicio.update({
        where: { id: servicioId },
        data: {
          mpPreferenceId: result.id,
        },
      });

      return res.json({
        success: true,
        data: {
          preferenceId: result.id,
          initPoint: result.init_point,
          sandboxInitPoint: result.sandbox_init_point,
        },
      });
    } catch (error: any) {
      console.error('❌ Error al crear preferencia:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al crear preferencia de pago',
        error: error.message,
      });
    }
  }

  /**
   * POST /api/pagos/webhook
   * Webhook de Mercado Pago para notificaciones de pago
   */
  static async webhook(req: Request, res: Response) {
    try {
      const { type, data } = req.body;

      console.log('📨 Webhook recibido:', { type, data });

      // Responder inmediatamente a MP (importante)
      res.sendStatus(200);

      // Solo procesamos notificaciones de pago
      if (type !== 'payment') {
        console.log('ℹ️ Tipo de notificación ignorado:', type);
        return;
      }

      // Crear instancia de Payment
      const paymentClient = new Payment(client);

      // Obtener información del pago
      const paymentId = data.id;
      const paymentInfo = await paymentClient.get({ id: paymentId });

      console.log('💳 Información del pago:', paymentInfo);

      // Extraer servicioId del external_reference
      const servicioId = paymentInfo.external_reference;

      if (!servicioId) {
        console.error('❌ No se encontró servicioId en external_reference');
        return;
      }

      // Actualizar servicio según el estado del pago
      if (paymentInfo.status === 'approved') {
        await prisma.servicio.update({
          where: { id: servicioId },
          data: {
            pagado: true,
            mpPaymentId: String(paymentInfo.id),
            completadoAt: new Date(),
          },
        });

        // Obtener servicio completo con todas las relaciones
        const servicio = await prisma.servicio.findUnique({
          where: { id: servicioId },
          include: { 
            cliente: {
              include: {
                user: true,
              }
            },
            gruero: {
              include: {
                user: true,
              }
            },
            calificacion: true,
          },
        });

        if (servicio) {
          // Notificación para el CLIENTE
          await prisma.notificacion.create({
            data: {
              userId: servicio.cliente.userId,
              tipo: 'PAGO_CONFIRMADO',
              titulo: 'Pago confirmado',
              mensaje: `Tu pago de $${servicio.totalCliente.toLocaleString('es-CL')} ha sido confirmado exitosamente.`,
              referencia: servicioId,
            },
          });

          // Notificación para el GRUERO
          if (servicio.gruero) {
            await prisma.notificacion.create({
              data: {
                userId: servicio.gruero.userId,
                tipo: 'PAGO_RECIBIDO',
                titulo: 'Pago recibido',
                mensaje: `Has recibido $${servicio.totalGruero.toLocaleString('es-CL')} por el servicio completado.`,
                referencia: servicioId,
              },
            });
            console.log('✅ Notificación de pago enviada al gruero');
          }

          // 📧 GENERAR PDF Y ENVIAR EMAILS
          try {
            // Generar comprobante PDF
            const pdfBuffer = await PDFGenerator.generarComprobantePago({
              servicioId: servicio.id,
              fecha: servicio.completadoAt || new Date(),
              monto: servicio.totalCliente,
              mpPaymentId: servicio.mpPaymentId,
              origen: {
                direccion: servicio.origenDireccion,
                lat: servicio.origenLat,
                lng: servicio.origenLng,
              },
              destino: {
                direccion: servicio.destinoDireccion,
                lat: servicio.destinoLat,
                lng: servicio.destinoLng,
              },
              distancia: servicio.distanciaKm,
              cliente: {
                nombre: `${servicio.cliente.user.nombre} ${servicio.cliente.user.apellido}`,
                email: servicio.cliente.user.email,
              },
              gruero: servicio.gruero ? {
                nombre: `${servicio.gruero.user.nombre} ${servicio.gruero.user.apellido}`,
                telefono: servicio.gruero.user.telefono,
                patente: servicio.gruero.patente,
                marca: servicio.gruero.marca,
                modelo: servicio.gruero.modelo,
              } : null,
              calificacion: servicio.calificacion ? {
                estrellas: (servicio.calificacion as any).puntuacionGruero,
                comentario: (servicio.calificacion as any).comentarioGruero || null,
              } : null,
            });

            console.log('✅ PDF generado exitosamente');

            // Email al CLIENTE con PDF adjunto
            await EmailService.enviarPagoConfirmado({
              email: servicio.cliente.user.email,
              nombre: servicio.cliente.user.nombre,
              apellido: servicio.cliente.user.apellido,
              monto: servicio.totalCliente,
              servicioId: servicio.id,
              origen: servicio.origenDireccion,
              destino: servicio.destinoDireccion,
              gruero: servicio.gruero 
                ? `${servicio.gruero.user.nombre} ${servicio.gruero.user.apellido}`
                : 'No disponible',
              pdfBuffer,
            });

            console.log('✅ Email con comprobante enviado al cliente');

            // Email al GRUERO notificando el pago
            if (servicio.gruero) {
              await EmailService.enviarPagoRecibido({
                email: servicio.gruero.user.email,
                nombre: servicio.gruero.user.nombre,
                apellido: servicio.gruero.user.apellido,
                monto: servicio.totalGruero,
                servicioId: servicio.id,
                nombreCliente: `${servicio.cliente.user.nombre} ${servicio.cliente.user.apellido}`,
              });

              console.log('✅ Email de pago recibido enviado al gruero');
            }
          } catch (emailError) {
            console.error('❌ Error al enviar emails:', emailError);
            // No fallar el webhook si los emails fallan
          }

          console.log('✅ Pago confirmado para servicio:', servicioId);
        }
      } else if (paymentInfo.status === 'rejected') {
        // Crear notificación de pago rechazado
        const servicio = await prisma.servicio.findUnique({
          where: { id: servicioId },
          include: { 
            cliente: {
              include: {
                user: true,
              }
            }
          },
        });

        if (servicio) {
          await prisma.notificacion.create({
            data: {
              userId: servicio.cliente.userId,
              tipo: 'PAGO_RECHAZADO',
              titulo: 'Pago rechazado',
              mensaje: 'Tu pago fue rechazado. Por favor, intenta con otro método de pago.',
              referencia: servicioId,
            },
          });

          console.log('❌ Pago rechazado para servicio:', servicioId);
        }
      }
    } catch (error: any) {
      console.error('❌ Error en webhook:', error);
      // NO retornar error a MP, ya respondimos con 200
    }
  }

  /**
   * GET /api/pagos/estado/:servicioId
   * Verificar estado de pago de un servicio
   */
  static async verificarEstado(req: Request, res: Response) {
    try {
      const userId = (req.user as any)?.userId;
      const { servicioId } = req.params;

      const servicio = await prisma.servicio.findUnique({
        where: { id: servicioId },
        include: {
          cliente: true,
        },
      });

      if (!servicio) {
        return res.status(404).json({
          success: false,
          message: 'Servicio no encontrado',
        });
      }

      // Verificar permiso
      if (servicio.cliente.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para ver este servicio',
        });
      }

      return res.json({
        success: true,
        data: {
          pagado: servicio.pagado,
          mpPaymentId: servicio.mpPaymentId,
          total: servicio.totalCliente,
        },
      });
    } catch (error: any) {
      console.error('❌ Error al verificar estado:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al verificar estado de pago',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/pagos/historial
   * Obtener historial de pagos del cliente autenticado
   */
  static async obtenerHistorial(req: Request, res: Response) {
    try {
      const userId = (req.user as any)?.userId;
      const { desde, hasta } = req.query;

      // Buscar cliente
      const cliente = await prisma.cliente.findUnique({
        where: { userId },
      });

      if (!cliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado',
        });
      }

      // Construir filtros
      const where: any = {
        clienteId: cliente.id,
        pagado: true, // Solo servicios pagados
      };

      // Filtro por fecha
      if (desde || hasta) {
        where.completadoAt = {};
        if (desde) {
          where.completadoAt.gte = new Date(desde as string);
        }
        if (hasta) {
          where.completadoAt.lte = new Date(hasta as string);
        }
      }

      // Obtener servicios pagados
      const serviciosPagados = await prisma.servicio.findMany({
        where,
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
        orderBy: {
          completadoAt: 'desc',
        },
      });

      // Formatear respuesta
      const pagos = serviciosPagados.map((servicio) => ({
        id: servicio.id,
        fecha: servicio.completadoAt,
        monto: servicio.totalCliente,
        mpPaymentId: servicio.mpPaymentId,
        origen: servicio.origenDireccion,
        destino: servicio.destinoDireccion,
        distancia: servicio.distanciaKm,
        gruero: servicio.gruero
          ? `${servicio.gruero.user.nombre} ${servicio.gruero.user.apellido}`
          : 'No disponible',
        patente: servicio.gruero?.patente || 'N/A',
      }));

      return res.json({
        success: true,
        data: {
          pagos,
          total: pagos.length,
          montoTotal: pagos.reduce((sum, p) => sum + p.monto, 0),
        },
      });
    } catch (error: any) {
      console.error('❌ Error al obtener historial:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener historial de pagos',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/pagos/detalle/:servicioId
   * Obtener detalle completo de un pago
   */
  static async obtenerDetalle(req: Request, res: Response) {
    try {
      const userId = (req.user as any)?.userId;
      const { servicioId } = req.params;

      const servicio = await prisma.servicio.findUnique({
        where: { id: servicioId },
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
                  telefono: true,
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

      // Verificar permiso
      if (servicio.cliente.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para ver este pago',
        });
      }

      // Verificar que esté pagado
      if (!servicio.pagado) {
        return res.status(400).json({
          success: false,
          message: 'Este servicio no ha sido pagado',
        });
      }

      return res.json({
        success: true,
        data: {
          id: servicio.id,
          fecha: servicio.completadoAt,
          monto: servicio.totalCliente,
          mpPaymentId: servicio.mpPaymentId,
          mpPreferenceId: servicio.mpPreferenceId,
          origen: {
            direccion: servicio.origenDireccion,
            lat: servicio.origenLat,
            lng: servicio.origenLng,
          },
          destino: {
            direccion: servicio.destinoDireccion,
            lat: servicio.destinoLat,
            lng: servicio.destinoLng,
          },
          distancia: servicio.distanciaKm,
          cliente: {
            nombre: `${servicio.cliente.user.nombre} ${servicio.cliente.user.apellido}`,
            email: servicio.cliente.user.email,
          },
          gruero: servicio.gruero
            ? {
                nombre: `${servicio.gruero.user.nombre} ${servicio.gruero.user.apellido}`,
                telefono: servicio.gruero.user.telefono,
                patente: servicio.gruero.patente,
                marca: servicio.gruero.marca,
                modelo: servicio.gruero.modelo,
              }
            : null,
          calificacion: servicio.calificacion
            ? {
                estrellas: (servicio.calificacion as any).puntuacionGruero,
                comentario: (servicio.calificacion as any).comentarioGruero || null,
              }
            : null,
        },
      });
    } catch (error: any) {
      console.error('❌ Error al obtener detalle:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener detalle del pago',
        error: error.message,
      });
    }
  }
}