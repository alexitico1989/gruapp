import { X, Phone, Truck, Star, MapPin, Navigation } from 'lucide-react';
import { GiTowTruck } from 'react-icons/gi';

interface ServiceNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  gruero: {
    nombre: string;
    apellido: string;
    telefono: string;
    patente: string;
    marca: string;
    modelo: string;
    capacidad: number;
    calificacion: number;
  };
  servicio: {
    status: string;
    origenDireccion: string;
    destinoDireccion: string;
    distanciaKm: number;
    totalCliente: number;
  };
}

export default function ServiceNotification({ 
  isOpen, 
  onClose, 
  gruero, 
  servicio 
}: ServiceNotificationProps) {
  if (!isOpen) return null;

  const getStatusMessage = () => {
    switch (servicio.status) {
      case 'ACEPTADO':
        return {
          title: 'Servicio Aceptado',
          subtitle: 'Preparándose para recogerte',
          icon: '✅',
          color: 'bg-green-500'
        };
      case 'EN_CAMINO':
        return {
          title: 'En Camino',
          subtitle: 'Llegando a tu ubicación',
          icon: '🚗',
          color: 'bg-blue-500'
        };
      case 'EN_SITIO':
        return {
          title: 'En el Sitio',
          subtitle: 'Ha llegado',
          icon: '📍',
          color: 'bg-purple-500'
        };
      default:
        return {
          title: 'Actualización',
          subtitle: servicio.status,
          icon: 'ℹ️',
          color: 'bg-gray-500'
        };
    }
  };

  const statusInfo = getStatusMessage();

  const handleCall = () => {
    window.location.href = `tel:${gruero.telefono}`;
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn"
        onClick={onClose}
      >
        {/* Modal Compacto */}
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-scaleIn"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Compacto */}
          <div className={`${statusInfo.color} text-white p-4 relative`}>
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1.5 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="text-3xl">{statusInfo.icon}</div>
              <div>
                <h2 className="text-lg font-bold">{statusInfo.title}</h2>
                <p className="text-sm text-white text-opacity-90">{statusInfo.subtitle}</p>
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
                <div className="flex items-center text-yellow-500">
                  <Star className="h-3.5 w-3.5 fill-yellow-500 mr-1" />
                  <span className="text-sm font-semibold">{gruero.calificacion.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Vehículo - Compacto */}
            <div className="bg-gray-50 rounded-lg p-3 space-y-1.5 text-sm mb-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Vehículo</span>
                <span className="font-semibold text-gray-900">
                  {gruero.marca} {gruero.modelo}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Patente</span>
                <span className="font-semibold text-gray-900">{gruero.patente}</span>
              </div>
            </div>

            {/* Ruta - Ultra Compacto */}
            <div className="space-y-2 mb-4">
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Origen</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{servicio.origenDireccion}</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Navigation className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Destino</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{servicio.destinoDireccion}</p>
                </div>
              </div>
            </div>

            {/* Total - Destacado */}
            <div className="bg-orange-50 rounded-lg p-3 flex items-center justify-between mb-3">
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

            {/* Botón Llamar - Destacado */}
            <button
              onClick={handleCall}
              className="w-full bg-[#ff7a3d] hover:bg-[#e66a2d] text-white font-semibold py-3 rounded-xl flex items-center justify-center space-x-2 transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span>Llamar a {gruero.nombre}</span>
            </button>
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