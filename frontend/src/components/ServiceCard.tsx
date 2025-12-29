import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MapPin, Calendar, DollarSign, Clock, Star } from 'lucide-react';
import { Servicio } from '../types';

interface ServiceCardProps {
  servicio: Servicio;
  userRole: 'CLIENTE' | 'GRUERO';
}

export default function ServiceCard({ servicio, userRole }: ServiceCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SOLICITADO':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACEPTADO':
        return 'bg-blue-100 text-blue-800';
      case 'EN_CAMINO':
        return 'bg-purple-100 text-purple-800';
      case 'EN_SITIO':
        return 'bg-indigo-100 text-indigo-800';
      case 'COMPLETADO':
        return 'bg-green-100 text-green-800';
      case 'CANCELADO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      SOLICITADO: 'Solicitado',
      ACEPTADO: 'Aceptado',
      EN_CAMINO: 'En camino',
      EN_SITIO: 'En sitio',
      COMPLETADO: 'Completado',
      CANCELADO: 'Cancelado',
    };
    return statusMap[status] || status;
  };

  return (
    <Link to={`/servicio/${servicio.id}`}>
      <div className="card hover:shadow-lg transition-shadow cursor-pointer">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  servicio.status
                )}`}
              >
                {getStatusText(servicio.status)}
              </span>
              {servicio.calificacion && (
                <div className="flex items-center space-x-1 text-yellow-500">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm font-medium">
                    {userRole === 'CLIENTE'
                      ? servicio.calificacion.puntuacionGruero
                      : servicio.calificacion.puntuacionCliente}
                  </span>
                </div>
              )}
            </div>
            
            {/* Información del otro usuario */}
            {userRole === 'CLIENTE' && servicio.gruero && (
              <p className="text-sm text-gray-600">
                Gruero: {servicio.gruero.user.nombre} {servicio.gruero.user.apellido}
              </p>
            )}
            {userRole === 'GRUERO' && servicio.cliente && (
              <p className="text-sm text-gray-600">
                Cliente: {servicio.cliente.user.nombre} {servicio.cliente.user.apellido}
              </p>
            )}
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold text-primary-600">
              ${servicio.totalCliente.toLocaleString('es-CL')}
            </p>
            {userRole === 'GRUERO' && (
              <p className="text-xs text-gray-500">
                Recibes: ${servicio.totalGruero.toLocaleString('es-CL')}
              </p>
            )}
          </div>
        </div>

        {/* Ubicaciones */}
        <div className="space-y-2 mb-4">
          <div className="flex items-start space-x-2">
            <MapPin className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">Origen</p>
              <p className="text-sm text-gray-900 truncate">
                {servicio.origenDireccion}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <MapPin className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">Destino</p>
              <p className="text-sm text-gray-900 truncate">
                {servicio.destinoDireccion}
              </p>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>
              {format(new Date(servicio.solicitadoAt), 'dd MMM yyyy', {
                locale: es,
              })}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>
              {format(new Date(servicio.solicitadoAt), 'HH:mm', {
                locale: es,
              })}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <DollarSign className="h-4 w-4" />
            <span>{servicio.distanciaKm} km</span>
          </div>
        </div>
      </div>
    </Link>
  );
}