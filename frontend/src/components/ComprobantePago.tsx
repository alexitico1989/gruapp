import { X, Download, MapPin, Navigation, User, Truck, Star } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useEffect, useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface ComprobantePagoProps {
  servicioId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface DetallePago {
  id: string;
  fecha: string;
  monto: number;
  mpPaymentId: string;
  mpPreferenceId: string;
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

export default function ComprobantePago({ servicioId, isOpen, onClose }: ComprobantePagoProps) {
  const [detalle, setDetalle] = useState<DetallePago | null>(null);
  const [loading, setLoading] = useState(true);
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const comprobanteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && servicioId) {
      cargarDetalle();
    }
  }, [isOpen, servicioId]);

  const cargarDetalle = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/pagos/detalle/${servicioId}`);
      if (response.data.success) {
        setDetalle(response.data.data);
      }
    } catch (error: any) {
      console.error('Error al cargar detalle:', error);
      toast.error('Error al cargar el comprobante');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarPDF = async () => {
    if (!comprobanteRef.current || !detalle) return;

    try {
      setGenerandoPDF(true);
      toast.loading('Generando PDF...');

      // Capturar el elemento como canvas
      const canvas = await html2canvas(comprobanteRef.current as HTMLElement, {
        scale: 2,
        backgroundColor: '#ffffff',
      } as any);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`Comprobante-${detalle.id.slice(0, 8)}.pdf`);

      toast.dismiss();
      toast.success('PDF descargado exitosamente');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      toast.dismiss();
      toast.error('Error al generar el PDF');
    } finally {
      setGenerandoPDF(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del Modal */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-[#1e3a5f]">Comprobante de Pago</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDescargarPDF}
              disabled={generandoPDF || loading}
              className="bg-[#1e3a5f] text-white px-4 py-2 rounded-lg hover:bg-[#2d4a6f] transition-colors flex items-center disabled:opacity-50"
            >
              <Download className="h-4 w-4 mr-2" />
              {generandoPDF ? 'Generando...' : 'Descargar PDF'}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Contenido del Comprobante */}
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a5f] mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando comprobante...</p>
          </div>
        ) : detalle ? (
          <div ref={comprobanteRef} className="p-8 bg-white">
            {/* Header del Comprobante */}
            <div className="text-center mb-8 pb-6 border-b-2 border-[#1e3a5f]">
              <h1 className="text-4xl font-bold text-[#1e3a5f] mb-2">GruApp</h1>
              <p className="text-lg text-gray-600">Comprobante de Pago</p>
              <p className="text-sm text-gray-500 mt-2">
                Servicio #{detalle.id.slice(0, 8).toUpperCase()}
              </p>
            </div>

            {/* Información del Pago */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Fecha de Pago</p>
                <p className="font-semibold text-gray-900">
                  {format(new Date(detalle.fecha), "dd 'de' MMMM, yyyy", { locale: es })}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {format(new Date(detalle.fecha), 'HH:mm', { locale: es })} hrs
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Monto Pagado</p>
                <p className="text-3xl font-bold text-green-600">
                  ${detalle.monto.toLocaleString('es-CL')}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">ID de Pago (MP)</p>
                <p className="font-mono text-sm text-gray-900 break-all">
                  {detalle.mpPaymentId}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">ID de Preferencia (MP)</p>
                <p className="font-mono text-sm text-gray-900 break-all">
                  {detalle.mpPreferenceId}
                </p>
              </div>
            </div>

            {/* Información del Cliente */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-[#1e3a5f] mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Información del Cliente
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Nombre</p>
                    <p className="font-semibold text-gray-900">{detalle.cliente.nombre}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold text-gray-900">{detalle.cliente.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detalles del Servicio */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-[#1e3a5f] mb-4 flex items-center">
                <Truck className="h-5 w-5 mr-2" />
                Detalles del Servicio
              </h3>
              
              <div className="space-y-4">
                {/* Origen */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Origen</p>
                      <p className="text-gray-900">{detalle.origen.direccion}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Coords: {detalle.origen.lat.toFixed(6)}, {detalle.origen.lng.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Destino */}
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <Navigation className="h-5 w-5 text-orange-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Destino</p>
                      <p className="text-gray-900">{detalle.destino.direccion}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Coords: {detalle.destino.lat.toFixed(6)}, {detalle.destino.lng.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Distancia */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Distancia Recorrida</p>
                  <p className="text-2xl font-bold text-blue-600">{detalle.distancia.toFixed(1)} km</p>
                </div>
              </div>
            </div>

            {/* Información del Gruero */}
            {detalle.gruero && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-[#1e3a5f] mb-4">Información del Gruero</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Nombre</p>
                      <p className="font-semibold text-gray-900">{detalle.gruero.nombre}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Teléfono</p>
                      <p className="font-semibold text-gray-900">{detalle.gruero.telefono}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Vehículo</p>
                      <p className="font-semibold text-gray-900">
                        {detalle.gruero.marca} {detalle.gruero.modelo}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Patente</p>
                      <p className="font-semibold text-gray-900">{detalle.gruero.patente}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Calificación */}
            {detalle.calificacion && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-[#1e3a5f] mb-4 flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Calificación del Servicio
                </h3>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-6 w-6 ${
                          star <= detalle.calificacion!.estrellas
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 font-semibold text-gray-900">
                      {detalle.calificacion.estrellas} de 5
                    </span>
                  </div>
                  {detalle.calificacion.comentario && (
                    <p className="text-gray-700 italic mt-2">
                      "{detalle.calificacion.comentario}"
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-12 pt-6 border-t-2 border-gray-200 text-center text-sm text-gray-600">
              <p className="mb-2">
                Este comprobante es válido como constancia de pago del servicio de grúa.
              </p>
              <p className="mb-2">
                <strong>GruApp</strong> - Sistema de Gestión de Servicios de Grúa
              </p>
              <p className="text-xs text-gray-500">
                Generado el {format(new Date(), "dd 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-red-600">Error al cargar el comprobante</p>
          </div>
        )}
      </div>
    </div>
  );
}