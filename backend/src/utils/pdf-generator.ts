import PDFDocument from 'pdfkit';

interface ComprobanteData {
  servicioId: string;
  fecha: Date;
  monto: number;
  mpPaymentId: string | null;
  origen: {
    direccion: string;
    lat: number;
    lng: number;
  };
  destino: {
    direccion: string;
    lat: number;
    lng: number;
  };
  distancia: number;
  cliente: {
    nombre: string;
    email: string;
  };
  gruero: {
    nombre: string;
    telefono: string;
    patente: string;
    marca: string;
    modelo: string;
  } | null;
  calificacion: {
    estrellas: number;
    comentario: string | null;
  } | null;
}

class PDFGenerator {
  /**
   * Generar comprobante de pago en PDF
   */
  async generarComprobantePago(data: ComprobanteData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header - Logo y título
        doc
          .fontSize(28)
          .fillColor('#1e3a5f')
          .text('GruApp Chile', { align: 'center' });

        doc
          .fontSize(12)
          .fillColor('#666')
          .text('Comprobante de Pago', { align: 'center' });

        doc.moveDown(1);

        // Línea separadora
        doc
          .moveTo(50, doc.y)
          .lineTo(550, doc.y)
          .strokeColor('#ff7a3d')
          .lineWidth(2)
          .stroke();

        doc.moveDown(1);

        // ID de servicio destacado
        doc
          .fontSize(10)
          .fillColor('#666')
          .text('ID de Servicio:');

        doc
          .fontSize(14)
          .fillColor('#1e3a5f')
          .font('Helvetica-Bold')
          .text(data.servicioId.slice(0, 8).toUpperCase());

        doc.moveDown(0.5);

        // Información del pago
        doc.font('Helvetica-Bold').fontSize(14).fillColor('#1e3a5f').text('Información del Pago');
        doc.moveDown(0.3);

        const pagoY = doc.y;
        doc
          .font('Helvetica')
          .fontSize(10)
          .fillColor('#666')
          .text('Fecha:', 50, pagoY)
          .font('Helvetica-Bold')
          .fillColor('#333')
          .text(data.fecha.toLocaleString('es-CL'), 150, pagoY);

        doc
          .font('Helvetica')
          .fillColor('#666')
          .text('Monto:', 50, pagoY + 20)
          .font('Helvetica-Bold')
          .fillColor('#ff7a3d')
          .fontSize(16)
          .text(`$${data.monto.toLocaleString('es-CL')}`, 150, pagoY + 18);

        if (data.mpPaymentId) {
          doc
            .font('Helvetica')
            .fontSize(10)
            .fillColor('#666')
            .text('ID Mercado Pago:', 50, pagoY + 45)
            .font('Helvetica')
            .fillColor('#333')
            .text(data.mpPaymentId, 150, pagoY + 45);
        }

        doc.moveDown(3);

        // Información del cliente
        doc.font('Helvetica-Bold').fontSize(14).fillColor('#1e3a5f').text('Información del Cliente');
        doc.moveDown(0.3);

        const clienteY = doc.y;
        doc
          .font('Helvetica')
          .fontSize(10)
          .fillColor('#666')
          .text('Nombre:', 50, clienteY)
          .font('Helvetica-Bold')
          .fillColor('#333')
          .text(data.cliente.nombre, 150, clienteY);

        doc
          .font('Helvetica')
          .fillColor('#666')
          .text('Email:', 50, clienteY + 20)
          .font('Helvetica')
          .fillColor('#333')
          .text(data.cliente.email, 150, clienteY + 20);

        doc.moveDown(2);

        // Detalles del servicio
        doc.font('Helvetica-Bold').fontSize(14).fillColor('#1e3a5f').text('Detalles del Servicio');
        doc.moveDown(0.3);

        doc
          .font('Helvetica')
          .fontSize(10)
          .fillColor('#666')
          .text('Origen:', 50);

        doc
          .font('Helvetica')
          .fillColor('#333')
          .text(data.origen.direccion, 50, doc.y, { width: 500 });

        doc.moveDown(0.5);

        doc
          .font('Helvetica')
          .fillColor('#666')
          .text('Destino:', 50);

        doc
          .font('Helvetica')
          .fillColor('#333')
          .text(data.destino.direccion, 50, doc.y, { width: 500 });

        doc.moveDown(0.5);

        doc
          .font('Helvetica')
          .fillColor('#666')
          .text('Distancia:', 50)
          .font('Helvetica-Bold')
          .fillColor('#333')
          .text(`${data.distancia} km`, 150);

        doc.moveDown(1.5);

        // Información del gruero
        if (data.gruero) {
          doc.font('Helvetica-Bold').fontSize(14).fillColor('#1e3a5f').text('Información del Gruero');
          doc.moveDown(0.3);

          const grueroY = doc.y;
          doc
            .font('Helvetica')
            .fontSize(10)
            .fillColor('#666')
            .text('Nombre:', 50, grueroY)
            .font('Helvetica-Bold')
            .fillColor('#333')
            .text(data.gruero.nombre, 150, grueroY);

          doc
            .font('Helvetica')
            .fillColor('#666')
            .text('Teléfono:', 50, grueroY + 20)
            .font('Helvetica')
            .fillColor('#333')
            .text(data.gruero.telefono, 150, grueroY + 20);

          doc
            .font('Helvetica')
            .fillColor('#666')
            .text('Vehículo:', 50, grueroY + 40)
            .font('Helvetica')
            .fillColor('#333')
            .text(`${data.gruero.marca} ${data.gruero.modelo}`, 150, grueroY + 40);

          doc
            .font('Helvetica')
            .fillColor('#666')
            .text('Patente:', 50, grueroY + 60)
            .font('Helvetica-Bold')
            .fillColor('#333')
            .text(data.gruero.patente, 150, grueroY + 60);

          doc.moveDown(4);
        }

        // Calificación
        if (data.calificacion) {
          doc.font('Helvetica-Bold').fontSize(14).fillColor('#1e3a5f').text('Calificación del Servicio');
          doc.moveDown(0.3);

          const stars = '⭐'.repeat(data.calificacion.estrellas);
          doc
            .font('Helvetica')
            .fontSize(16)
            .fillColor('#fbbf24')
            .text(stars, 50);

          if (data.calificacion.comentario) {
            doc.moveDown(0.5);
            doc
              .font('Helvetica-Oblique')
              .fontSize(10)
              .fillColor('#666')
              .text(`"${data.calificacion.comentario}"`, 50, doc.y, { width: 500 });
          }

          doc.moveDown(1);
        }

        // Footer
        const footerY = 750;
        doc
          .moveTo(50, footerY)
          .lineTo(550, footerY)
          .strokeColor('#e0e0e0')
          .lineWidth(1)
          .stroke();

        doc
          .font('Helvetica')
          .fontSize(9)
          .fillColor('#999')
          .text('GruApp Chile', 50, footerY + 10, { align: 'center' });

        doc
          .fontSize(8)
          .text('contacto@gruappchile.cl', { align: 'center' });

        doc
          .fontSize(8)
          .text(`Generado el ${new Date().toLocaleString('es-CL')}`, { align: 'center' });

        doc.end();
      } catch (error) {
        console.error('❌ Error generando PDF:', error);
        reject(error);
      }
    });
  }
}

export default new PDFGenerator();