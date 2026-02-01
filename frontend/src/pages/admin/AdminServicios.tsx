import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface Servicio {
  id: string;
  origenDireccion: string;
  destinoDireccion: string;
  tipoVehiculo: string;
  distanciaKm: number;
  totalCliente: number;
  totalGruero: number;
  comisionPlataforma: number;
  status: string;
  pagado: boolean;
  solicitadoAt: string;
  completadoAt?: string;
  cliente: {
    user: {
      nombre: string;
      apellido: string;
      email: string;
      telefono: string;
    };
  };
  gruero?: {
    user: {
      nombre: string;
      apellido: string;
      email: string;
      telefono: string;
    };
    patente: string;
  };
  calificacion?: {
    puntuacionGruero: number;
    puntuacionCliente: number;
  };
}

export default function AdminServicios() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('TODOS');

  useEffect(() => {
    fetchServicios();
  }, [filter]);

  const fetchServicios = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      let url = `${API_URL}/admin/servicios`;
      if (filter !== 'TODOS') {
        url += `?status=${filter}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setServicios(response.data.data);
      }
    } catch (error) {
      console.error('Error al cargar servicios:', error);
      toast.error('Error al cargar servicios');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      SOLICITADO: 'bg-yellow-100 text-yellow-800',
      ACEPTADO: 'bg-blue-100 text-blue-800',
      EN_CAMINO: 'bg-indigo-100 text-indigo-800',
      EN_SITIO: 'bg-purple-100 text-purple-800',
      COMPLETADO: 'bg-green-100 text-green-800',
      CANCELADO: 'bg-red-100 text-red-800',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando servicios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Gestión de Servicios</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">Visualiza todos los servicios de la plataforma</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <span className="text-xs md:text-sm font-medium text-gray-700">Filtrar por estado:</span>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 -mx-1 px-1 scrollbar-hide">
            {['TODOS', 'SOLICITADO', 'ACEPTADO', 'EN_CAMINO', 'EN_SITIO', 'COMPLETADO', 'CANCELADO'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition whitespace-nowrap flex-shrink-0 ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-600">Total Servicios</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{servicios.length}</p>
            </div>
            <div className="text-2xl md:text-3xl">📊</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-600">Completados</p>
              <p className="text-xl md:text-2xl font-bold text-green-600">
                {servicios.filter(s => s.status === 'COMPLETADO').length}
              </p>
            </div>
            <div className="text-2xl md:text-3xl">✅</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-600">En Curso</p>
              <p className="text-xl md:text-2xl font-bold text-blue-600">
                {servicios.filter(s => ['ACEPTADO', 'EN_CAMINO', 'EN_SITIO'].includes(s.status)).length}
              </p>
            </div>
            <div className="text-2xl md:text-3xl">🚀</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-600">Comisión Total</p>
              <p className="text-lg md:text-2xl font-bold text-purple-600">
                ${servicios.filter(s => s.status === 'COMPLETADO').reduce((sum, s) => sum + s.comisionPlataforma, 0).toLocaleString('es-CL')}
              </p>
            </div>
            <div className="text-2xl md:text-3xl">💰</div>
          </div>
        </div>
      </div>

      {/* Tabla Desktop */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID / Fecha
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gruero
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ruta
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montos
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {servicios.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No hay servicios en esta categoría
                  </td>
                </tr>
              ) : (
                servicios.map((servicio) => (
                  <tr key={servicio.id} className="hover:bg-gray-50">
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900 truncate max-w-[120px]" title={servicio.id}>
                        #{servicio.id.slice(0, 8)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(servicio.solicitadoAt)}
                      </div>
                    </td>
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {servicio.cliente.user.nombre} {servicio.cliente.user.apellido}
                      </div>
                      <div className="text-xs text-gray-500">{servicio.cliente.user.telefono}</div>
                    </td>
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                      {servicio.gruero ? (
                        <>
                          <div className="text-sm font-medium text-gray-900">
                            {servicio.gruero.user.nombre} {servicio.gruero.user.apellido}
                          </div>
                          <div className="text-xs text-gray-500">{servicio.gruero.patente}</div>
                        </>
                      ) : (
                        <span className="text-sm text-gray-400">Sin asignar</span>
                      )}
                    </td>
                    <td className="px-4 xl:px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        <div className="flex items-start space-x-2">
                          <span className="text-green-600 flex-shrink-0">📍</span>
                          <span className="truncate">{servicio.origenDireccion}</span>
                        </div>
                        <div className="flex items-start space-x-2 mt-1">
                          <span className="text-red-600 flex-shrink-0">📍</span>
                          <span className="truncate">{servicio.destinoDireccion}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {servicio.distanciaKm.toFixed(1)} km • {servicio.tipoVehiculo}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(servicio.status)}`}>
                        {servicio.status.replace('_', ' ')}
                      </span>
                      {servicio.status === 'COMPLETADO' && (
                        <div className="mt-1">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${servicio.pagado ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {servicio.pagado ? '💰 Pagado' : '⏳ Sin pagar'}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Cliente: ${servicio.totalCliente.toLocaleString('es-CL')}
                      </div>
                      {servicio.gruero && (
                        <div className="text-sm text-gray-900">
                          Gruero: ${servicio.totalGruero.toLocaleString('es-CL')}
                        </div>
                      )}
                      <div className="text-xs text-purple-600 font-medium">
                        Comisión: ${servicio.comisionPlataforma.toLocaleString('es-CL')}
                      </div>
                    </td>
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                      {servicio.calificacion ? (
                        <div className="text-sm">
                          <div className="flex items-center">
                            <span className="text-yellow-500 mr-1">⭐</span>
                            <span>{servicio.calificacion.puntuacionGruero}/5</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Sin calificar</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards Móvil */}
      <div className="lg:hidden space-y-3">
        {servicios.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
            No hay servicios en esta categoría
          </div>
        ) : (
          servicios.map((servicio) => (
            <div key={servicio.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-mono text-gray-500" title={servicio.id}>#{servicio.id.slice(0, 8)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(servicio.solicitadoAt)}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(servicio.status)}`}>
                    {servicio.status.replace('_', ' ')}
                  </span>
                  {servicio.status === 'COMPLETADO' && (
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${servicio.pagado ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {servicio.pagado ? '💰 Pagado' : '⏳ Sin pagar'}
                    </span>
                  )}
                </div>
              </div>

              {/* Cliente y Gruero */}
              <div className="grid grid-cols-2 gap-3 mb-3 pb-3 border-b border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Cliente</p>
                  <p className="text-sm font-medium text-gray-900">
                    {servicio.cliente.user.nombre} {servicio.cliente.user.apellido}
                  </p>
                  <p className="text-xs text-gray-400">{servicio.cliente.user.telefono}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Gruero</p>
                  {servicio.gruero ? (
                    <>
                      <p className="text-sm font-medium text-gray-900">
                        {servicio.gruero.user.nombre} {servicio.gruero.user.apellido}
                      </p>
                      <p className="text-xs text-gray-400">{servicio.gruero.patente}</p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-400">Sin asignar</p>
                  )}
                </div>
              </div>

              {/* Ruta */}
              <div className="mb-3 pb-3 border-b border-gray-100">
                <p className="text-xs text-gray-500 mb-2">Ruta</p>
                <div className="space-y-1.5">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 text-sm flex-shrink-0">📍</span>
                    <p className="text-sm text-gray-900 line-clamp-1">{servicio.origenDireccion}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-600 text-sm flex-shrink-0">📍</span>
                    <p className="text-sm text-gray-900 line-clamp-1">{servicio.destinoDireccion}</p>
                  </div>
                  <p className="text-xs text-gray-500 ml-6">
                    {servicio.distanciaKm.toFixed(1)} km • {servicio.tipoVehiculo}
                  </p>
                </div>
              </div>

              {/* Montos */}
              <div className="mb-3 pb-3 border-b border-gray-100">
                <p className="text-xs text-gray-500 mb-2">Montos</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Cliente</p>
                    <p className="font-medium text-gray-900">${servicio.totalCliente.toLocaleString('es-CL')}</p>
                  </div>
                  {servicio.gruero && (
                    <div>
                      <p className="text-xs text-gray-500">Gruero</p>
                      <p className="font-medium text-gray-900">${servicio.totalGruero.toLocaleString('es-CL')}</p>
                    </div>
                  )}
                </div>
                <div className="mt-2">
                  <p className="text-xs text-purple-600 font-medium">
                    Comisión: ${servicio.comisionPlataforma.toLocaleString('es-CL')}
                  </p>
                </div>
              </div>

              {/* Calificación */}
              <div>
                <p className="text-xs text-gray-500 mb-1">Calificación</p>
                {servicio.calificacion ? (
                  <div className="flex items-center">
                    <span className="text-yellow-500 mr-1">⭐</span>
                    <span className="text-sm font-medium">{servicio.calificacion.puntuacionGruero}/5</span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">Sin calificar</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}