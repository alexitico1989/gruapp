import { X, Star, CreditCard } from 'lucide-react';
import { useState } from 'react';
import { GiTowTruck } from 'react-icons/gi';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  servicio: {
    id: string;
    origenDireccion: string;
    destinoDireccion: string;
    distanciaKm: number;
    totalCliente: number;
    pagado?: boolean;
  };
  gruero: {
    nombre: string;
    apellido: string;
    patente: string;
    marca: string;
    modelo: string;
  };
}

export default function RatingModal({ 
  isOpen, 
  onClose, 
  servicio, 
  gruero 
}: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [pagando, setPagando] = useState(false);
  const [calificado, setCalificado] = useState(false); // ← NUEVO: track si ya calificó

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Por favor selecciona una calificación');
      return;
    }

    // ← NUEVO: Prevenir si ya calificó
    if (calificado) {
      toast.error('Ya has calificado este servicio');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(`/servicios/${servicio.id}/calificar`, {
        calificacion: rating,
        comentario: comentario || undefined,
      });

      if (response.data.success) {
        setCalificado(true); // ← NUEVO: Marcar como calificado
        toast.success('¡Gracias por tu calificación!');
        
        if (!servicio.pagado) {
          toast('Ahora procede con el pago', { icon: '💳' });
        } else {
          // Esperar un momento antes de cerrar para que vea el mensaje de éxito
          setTimeout(() => {
            onClose();
          }, 1500);
        }
      }
    } catch (error: any) {
      console.error('Error al calificar:', error);
      toast.error(error.response?.data?.message || 'Error al enviar calificación');
    } finally {
      setLoading(false);
    }
  };

  const handlePagar = async () => {
    try {
      setPagando(true);

      const response = await api.post('/pagos/crear-preferencia', {
        servicioId: servicio.id
      });

      if (response.data.success) {
        const { initPoint } = response.data.data;

        // ✅ Abrir checkout fuera del SPA (CRÍTICO)
        window.open(initPoint, '_blank', 'noopener,noreferrer');
      }
    } catch (error: any) {
      console.error('Error al crear preferencia:', error);
      toast.error(error.response?.data?.message || 'Error al procesar el pago');
      setPagando(false);
    }
  };


  const puedeCalificar = rating > 0 && !calificado; // ← MODIFICADO: también verificar calificado

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn"
        onClick={(e) => {
          // Solo permitir cerrar si ya está pagado
          if (servicio.pagado) {
            onClose();
          } else {
            toast.error('Debes calificar y pagar antes de cerrar');
          }
        }}
      >
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-scaleIn max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Compacto */}
          <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8f] text-white p-4 relative">
            {/* Solo mostrar X si ya está pagado */}
            {servicio.pagado && (
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1.5 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🎉</div>
              <div>
                <h2 className="text-lg font-bold">Servicio Completado</h2>
                <p className="text-sm text-white text-opacity-90">
                  {!servicio.pagado ? 'Califica y paga' : 'Califica tu experiencia'}
                </p>
              </div>
            </div>
          </div>

          {/* Información del Gruero - Compacta */}
          <div className="p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-[#1e3a5f] text-white rounded-full p-2.5">
                <GiTowTruck className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-[#1e3a5f] truncate">
                  {gruero.nombre} {gruero.apellido}
                </h3>
                <p className="text-gray-600 text-xs truncate">
                  {gruero.marca} {gruero.modelo} • {gruero.patente}
                </p>
              </div>
            </div>

            {/* Resumen Ultra Compacto */}
            <div className="bg-orange-50 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs text-gray-600">Total a pagar</p>
                  <p className="text-2xl font-bold text-[#ff7a3d]">
                    ${servicio.totalCliente.toLocaleString('es-CL')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">Distancia</p>
                  <p className="text-sm font-semibold text-gray-900">{servicio.distanciaKm} km</p>
                </div>
              </div>
              {servicio.pagado && (
                <div className="text-center">
                  <span className="inline-block text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                    ✓ Pagado
                  </span>
                </div>
              )}
            </div>

            {/* Calificación */}
            <div className="mb-3">
              <h4 className="font-semibold text-gray-700 mb-3 text-center text-sm">
                ¿Cómo fue tu experiencia?
              </h4>
              
              {/* Estrellas */}
              <div className="flex justify-center space-x-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => !calificado && setRating(star)} // ← MODIFICADO: deshabilitar si ya calificó
                    onMouseEnter={() => !calificado && setHoveredRating(star)} // ← MODIFICADO
                    onMouseLeave={() => setHoveredRating(0)}
                    disabled={calificado} // ← NUEVO
                    className={`transition-transform ${!calificado ? 'hover:scale-110 cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                  >
                    <Star
                      className={`h-10 w-10 ${
                        star <= (hoveredRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Texto de calificación */}
              {rating > 0 && (
                <p className="text-center text-gray-600 mb-3 text-sm font-medium">
                  {rating === 5 && '⭐ ¡Excelente!'}
                  {rating === 4 && '⭐ Muy bueno'}
                  {rating === 3 && '⭐ Bueno'}
                  {rating === 2 && '⭐ Regular'}
                  {rating === 1 && '⭐ Necesita mejorar'}
                  {calificado && ' - ✓ Calificado'}
                </p>
              )}

              {/* Comentario - Más compacto */}
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                disabled={calificado} // ← NUEVO: deshabilitar textarea si ya calificó
                placeholder="Comentario opcional..."
                rows={2}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#ff7a3d] focus:border-transparent resize-none mb-3 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Botones - Compactos */}
            <div className="space-y-2">
              {!servicio.pagado ? (
                <>
                  {/* Botón Calificar */}
                  <button
                    onClick={handleSubmit}
                    disabled={loading || rating === 0 || calificado} // ← MODIFICADO: agregar calificado
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    {loading ? 'Enviando...' : calificado ? '✓ Calificado' : 'Calificar Servicio'}
                  </button>

                  {/* Botón Pagar (obligatorio) */}
                  <button
                    onClick={handlePagar}
                    disabled={pagando || !calificado} // ← MODIFICADO: solo habilitar si ya calificó
                    className="w-full bg-[#ff7a3d] hover:bg-[#e66a2d] text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
                  >
                    {pagando ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pagar ${servicio.totalCliente.toLocaleString('es-CL')}
                      </>
                    )}
                  </button>

                  {/* Mensaje obligatorio */}
                  <p className="text-xs text-center mt-2 text-gray-600">
                    {!calificado ? (
                      rating === 0 ? '💡 Selecciona las estrellas para continuar' : '👆 Haz clic en "Calificar Servicio"'
                    ) : (
                      '💳 Ahora procede con el pago'
                    )}
                  </p>
                </>
              ) : (
                <>
                  {/* Si ya está pagado, solo calificar y cerrar */}
                  <button
                    onClick={handleSubmit}
                    disabled={loading || rating === 0 || calificado} // ← MODIFICADO
                    className="w-full bg-[#ff7a3d] hover:bg-[#e66a2d] text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    {loading ? 'Enviando...' : calificado ? '✓ Calificado' : 'Enviar Calificación'}
                  </button>
                  
                  <button
                    onClick={onClose}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2.5 rounded-xl transition-colors text-sm"
                  >
                    Cerrar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.25s ease-out;
        }
      `}</style>
    </>
  );
}