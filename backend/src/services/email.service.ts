import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';

// Configuración de Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Verificar configuración al iniciar
if (!process.env.RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY no configurada en .env');
} else {
  console.log('✅ Resend configurado correctamente');
}

interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  context: any;
  attachments?: Array<{
    filename: string;
    content: Buffer;
  }>;
}

class EmailService {
  /**
   * Cargar y compilar template HTML
   */
  private loadTemplate(templateName: string, context: any): string {
    const templatePath = path.join(__dirname, '../templates', `${templateName}.hbs`);
    
    if (!fs.existsSync(templatePath)) {
      console.error(`❌ Template no encontrado: ${templatePath}`);
      throw new Error(`Template ${templateName} no encontrado`);
    }

    const templateSource = fs.readFileSync(templatePath, 'utf-8');
    const template = handlebars.compile(templateSource);
    
    return template(context);
  }

  /**
   * Enviar email genérico
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const html = this.loadTemplate(options.template, options.context);

      // Preparar attachments para Resend
      const attachments = options.attachments?.map(att => ({
        filename: att.filename,
        content: att.content,
      }));

      console.log(`📧 Enviando email a: ${options.to}`);
      console.log(`📝 Asunto: ${options.subject}`);

      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'GruApp Chile <onboarding@resend.dev>',
        to: options.to,
        subject: options.subject,
        html,
        attachments,
      });

      if (error) {
        console.error('❌ Error al enviar email:', error);
        return false;
      }

      console.log('✅ Email enviado:', data?.id);
      return true;
    } catch (error: any) {
      console.error('❌ Error al enviar email:', error);
      console.error('❌ Detalles del error:', {
        message: error.message,
        name: error.name,
      });
      return false;
    }
  }

  /**
   * Email de bienvenida para GRUERO
   */
  async enviarBienvenidaGruero(gruero: {
    email: string;
    nombre: string;
    apellido: string;
  }): Promise<boolean> {
    return this.sendEmail({
      to: gruero.email,
      subject: '¡Bienvenido a GruApp Chile!',
      template: 'bienvenida-gruero',
      context: {
        nombre: gruero.nombre,
        apellido: gruero.apellido,
        year: new Date().getFullYear(),
      },
    });
  }

  /**
   * Email de bienvenida para CLIENTE
   */
  async enviarBienvenidaCliente(cliente: {
    email: string;
    nombre: string;
    apellido: string;
  }): Promise<boolean> {
    return this.sendEmail({
      to: cliente.email,
      subject: '¡Bienvenido a GruApp Chile!',
      template: 'bienvenida-cliente',
      context: {
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        year: new Date().getFullYear(),
      },
    });
  }

  /**
   * Email de calificación recibida para GRUERO
   */
  async enviarCalificacionRecibida(gruero: {
    email: string;
    nombre: string;
    apellido: string;
    calificacion: number;
    comentario?: string;
    nombreCliente: string;
  }): Promise<boolean> {
    return this.sendEmail({
      to: gruero.email,
      subject: `¡Has recibido una calificación de ${gruero.calificacion}⭐!`,
      template: 'calificacion-recibida',
      context: {
        nombre: gruero.nombre,
        apellido: gruero.apellido,
        calificacion: gruero.calificacion,
        estrellas: '⭐'.repeat(gruero.calificacion),
        comentario: gruero.comentario || null,
        nombreCliente: gruero.nombreCliente,
        year: new Date().getFullYear(),
      },
    });
  }

  /**
   * Email de pago confirmado para CLIENTE (con PDF adjunto)
   */
  async enviarPagoConfirmado(cliente: {
    email: string;
    nombre: string;
    apellido: string;
    monto: number;
    servicioId: string;
    origen: string;
    destino: string;
    gruero: string;
    pdfBuffer?: Buffer;
  }): Promise<boolean> {
    const attachments = [];

    // Si hay PDF, adjuntarlo
    if (cliente.pdfBuffer) {
      attachments.push({
        filename: `Comprobante-${cliente.servicioId.slice(0, 8)}.pdf`,
        content: cliente.pdfBuffer,
      });
    }

    return this.sendEmail({
      to: cliente.email,
      subject: `Comprobante de pago - Servicio #${cliente.servicioId.slice(0, 8)}`,
      template: 'pago-confirmado',
      context: {
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        monto: cliente.monto.toLocaleString('es-CL'),
        servicioId: cliente.servicioId.slice(0, 8),
        origen: cliente.origen,
        destino: cliente.destino,
        gruero: cliente.gruero,
        year: new Date().getFullYear(),
      },
      attachments,
    });
  }

  /**
   * Email de pago recibido para GRUERO
   */
  async enviarPagoRecibido(gruero: {
    email: string;
    nombre: string;
    apellido: string;
    monto: number;
    servicioId: string;
    nombreCliente: string;
  }): Promise<boolean> {
    return this.sendEmail({
      to: gruero.email,
      subject: `¡Has recibido un pago de $${gruero.monto.toLocaleString('es-CL')}!`,
      template: 'pago-recibido',
      context: {
        nombre: gruero.nombre,
        apellido: gruero.apellido,
        monto: gruero.monto.toLocaleString('es-CL'),
        servicioId: gruero.servicioId.slice(0, 8),
        nombreCliente: gruero.nombreCliente,
        year: new Date().getFullYear(),
      },
    });
  }

  /**
   * Email con código de recuperación de contraseña
   */
  async enviarCodigoRecuperacion(usuario: {
    email: string;
    nombre: string;
    apellido: string;
    code: string;
  }): Promise<boolean> {
    return this.sendEmail({
      to: usuario.email,
      subject: '🔐 Código de Recuperación de Contraseña - GruApp Chile',
      template: 'password-reset-code',
      context: {
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        code: usuario.code,
        year: new Date().getFullYear(),
      },
    });
  }

  /**
   * Email de confirmación de cambio de contraseña
   */
  async enviarConfirmacionCambioPassword(usuario: {
    email: string;
    nombre: string;
    apellido: string;
  }): Promise<boolean> {
    const ahora = new Date();
    const fecha = ahora.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    const hora = ahora.toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    return this.sendEmail({
      to: usuario.email,
      subject: '✅ Contraseña Actualizada - GruApp Chile',
      template: 'password-reset-confirmed',
      context: {
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        fecha: fecha,
        hora: hora,
        year: new Date().getFullYear(),
      },
    });
  }
}

export default new EmailService();