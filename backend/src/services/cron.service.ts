import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CronService {
  /**
   * Iniciar todos los cron jobs
   */
  static init() {
    console.log('🕐 Iniciando Cron Jobs...');

    // Verificar vencimientos de documentos todos los días a las 8:00 AM
    this.verificarVencimientosDaily();

    // Enviar alertas de vencimientos próximos todos los días a las 9:00 AM
    this.enviarAlertasVencimientos();

    console.log('✅ Cron Jobs iniciados');
  }

  /**
   * Verificar y suspender cuentas con documentos vencidos
   * Se ejecuta todos los días a las 8:00 AM
   */
  private static verificarVencimientosDaily() {
    cron.schedule('0 8 * * *', async () => {
      console.log('🔍 Ejecutando verificación de vencimientos...');
      
      try {
        const ahora = new Date();

        // Buscar grueros con documentos vencidos
        const gruerosVencidos = await prisma.gruero.findMany({
          where: {
            verificado: true,
            cuentaSuspendida: false,
            OR: [
              { licenciaVencimiento: { lt: ahora } },
              { seguroVencimiento: { lt: ahora } },
              { revisionVencimiento: { lt: ahora } },
              { permisoVencimiento: { lt: ahora } },
            ],
          },
          include: {
            user: true,
          },
        });

        console.log(`📋 Encontrados ${gruerosVencidos.length} grueros con documentos vencidos`);

        // Suspender cada gruero con documentos vencidos
        for (const gruero of gruerosVencidos) {
          const documentosVencidos = [];

          if (gruero.licenciaVencimiento && gruero.licenciaVencimiento < ahora) {
            documentosVencidos.push('Licencia de Conducir');
          }
          if (gruero.seguroVencimiento && gruero.seguroVencimiento < ahora) {
            documentosVencidos.push('Seguro');
          }
          if (gruero.revisionVencimiento && gruero.revisionVencimiento < ahora) {
            documentosVencidos.push('Revisión Técnica');
          }
          if (gruero.permisoVencimiento && gruero.permisoVencimiento < ahora) {
            documentosVencidos.push('Permiso de Circulación');
          }

          await prisma.gruero.update({
            where: { id: gruero.id },
            data: {
              cuentaSuspendida: true,
              motivoSuspension: `DOCUMENTOS_VENCIDOS: ${documentosVencidos.join(', ')}`,
              status: 'SUSPENDIDO',
            },
          });

          // Notificar al gruero
          await prisma.notificacion.create({
            data: {
              userId: gruero.userId,
              tipo: 'SUSPENSION_AUTOMATICA',
              titulo: '⚠️ Cuenta Suspendida por Documentos Vencidos',
              mensaje: `Tu cuenta ha sido suspendida automáticamente. Documentos vencidos: ${documentosVencidos.join(', ')}. Por favor, actualiza tus documentos para reactivar tu cuenta.`,
            },
          });

          console.log(`🚫 Cuenta suspendida: ${gruero.user.nombre} ${gruero.user.apellido} - Documentos: ${documentosVencidos.join(', ')}`);
        }

        console.log(`✅ Verificación completada. ${gruerosVencidos.length} cuentas suspendidas.`);
      } catch (error) {
        console.error('❌ Error en verificación de vencimientos:', error);
      }
    });

    console.log('✅ Cron Job: Verificación de vencimientos (8:00 AM diario)');
  }

  /**
   * Enviar alertas a grueros con documentos próximos a vencer (15 días)
   * Se ejecuta todos los días a las 9:00 AM
   */
  private static enviarAlertasVencimientos() {
    cron.schedule('0 9 * * *', async () => {
      console.log('📢 Enviando alertas de vencimientos próximos...');
      
      try {
        const ahora = new Date();
        const en15Dias = new Date();
        en15Dias.setDate(en15Dias.getDate() + 15);

        // Buscar grueros con documentos próximos a vencer
        const grueros = await prisma.gruero.findMany({
          where: {
            verificado: true,
            cuentaSuspendida: false,
            OR: [
              {
                licenciaVencimiento: {
                  gte: ahora,
                  lte: en15Dias,
                },
              },
              {
                seguroVencimiento: {
                  gte: ahora,
                  lte: en15Dias,
                },
              },
              {
                revisionVencimiento: {
                  gte: ahora,
                  lte: en15Dias,
                },
              },
              {
                permisoVencimiento: {
                  gte: ahora,
                  lte: en15Dias,
                },
              },
            ],
          },
          include: {
            user: true,
          },
        });

        console.log(`📋 Encontrados ${grueros.length} grueros con documentos próximos a vencer`);

        for (const gruero of grueros) {
          const documentosProximos = [];

          if (gruero.licenciaVencimiento && gruero.licenciaVencimiento >= ahora && gruero.licenciaVencimiento <= en15Dias) {
            const dias = Math.ceil((gruero.licenciaVencimiento.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24));
            documentosProximos.push(`Licencia de Conducir (${dias} días)`);
          }
          if (gruero.seguroVencimiento && gruero.seguroVencimiento >= ahora && gruero.seguroVencimiento <= en15Dias) {
            const dias = Math.ceil((gruero.seguroVencimiento.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24));
            documentosProximos.push(`Seguro (${dias} días)`);
          }
          if (gruero.revisionVencimiento && gruero.revisionVencimiento >= ahora && gruero.revisionVencimiento <= en15Dias) {
            const dias = Math.ceil((gruero.revisionVencimiento.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24));
            documentosProximos.push(`Revisión Técnica (${dias} días)`);
          }
          if (gruero.permisoVencimiento && gruero.permisoVencimiento >= ahora && gruero.permisoVencimiento <= en15Dias) {
            const dias = Math.ceil((gruero.permisoVencimiento.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24));
            documentosProximos.push(`Permiso de Circulación (${dias} días)`);
          }

          if (documentosProximos.length > 0) {
            // Verificar si ya se envió una notificación en las últimas 24 horas
            const ultimaNotificacion = await prisma.notificacion.findFirst({
              where: {
                userId: gruero.userId,
                tipo: 'ALERTA_VENCIMIENTO',
                createdAt: {
                  gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                },
              },
            });

            if (!ultimaNotificacion) {
              await prisma.notificacion.create({
                data: {
                  userId: gruero.userId,
                  tipo: 'ALERTA_VENCIMIENTO',
                  titulo: '⚠️ Documentos Próximos a Vencer',
                  mensaje: `Los siguientes documentos están próximos a vencer: ${documentosProximos.join(', ')}. Por favor, actualízalos lo antes posible para evitar la suspensión de tu cuenta.`,
                },
              });

              console.log(`📧 Alerta enviada: ${gruero.user.nombre} ${gruero.user.apellido} - ${documentosProximos.join(', ')}`);
            }
          }
        }

        console.log('✅ Alertas de vencimientos enviadas');
      } catch (error) {
        console.error('❌ Error enviando alertas de vencimientos:', error);
      }
    });

    console.log('✅ Cron Job: Alertas de vencimientos (9:00 AM diario)');
  }
}