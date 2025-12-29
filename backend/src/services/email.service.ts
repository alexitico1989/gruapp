import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';

// Configuración del transportador de email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true', // false para puerto 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // Para desarrollo
  },
  connectionTimeout: 5000,   // 5 segundos
  greetingTimeout: 5000,     // 5 segundos
  socketTimeout: 10000,      // 10 segundos
});

// Verificar conexión al iniciar
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Error en configuración de email:', error);
    console.error('❌ Verifica las credenciales SMTP en .env');
  } else {
    console.log('✅ Servidor de email listo para enviar mensajes');
  }
});

interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  context: any;
  attachments?: any[];
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

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        html,
        attachments: options.attachments || [],
      };

      console.log(`📧 Enviando email a: ${options.to}`);
      console.log(`📝 Asunto: ${options.subject}`);

      const info = await transporter.sendMail(mailOptions);

      console.log('✅ Email enviado:', info.messageId);
      return true;
    } catch (error: any) {
      console.error('❌ Error al enviar email:', error);
      console.error('❌ Detalles del error:', {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
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
      subject: '¡Bienvenido a GruApp Chile! 🚛',
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
      subject: '¡Bienvenido a GruApp Chile! 🎉',
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
        contentType: 'application/pdf',
      });
    }

    return this.sendEmail({
      to: cliente.email,
      subject: `Comprobante de pago - Servicio #${cliente.servicioId.slice(0, 8)} 💳`,
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
      subject: `¡Has recibido un pago de $${gruero.monto.toLocaleString('es-CL')}! 💰`,
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
}

export default new EmailService();