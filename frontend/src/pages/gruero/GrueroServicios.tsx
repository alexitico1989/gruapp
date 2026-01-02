import { useEffect, useState } from 'react';
import { MapPin, Navigation, DollarSign, Filter, Star, Calendar, Truck } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import toast from 'react-hot-toast';

interface Servicio {
  id: string;
  origenDireccion: string;
  destinoDireccion: string;
  origenLat: number;
  origenLng: number;
  destinoLat: number;
  destinoLng: number;
  distanciaKm: number;
  totalCliente: number;
  totalGruero: number;
  status: string;
  solicitadoAt: string;
  completadoAt: string | null;
  cliente: {
    user: {
      nombre: string;
      apellido: string;
      telefono: string;
    };
  };
  calificacion?: {
    puntuacionGruero: number;
    comentarioGruero: string | null;
    createdAt: string;
  } | null;
}

interface Resumen {
  totalServicios: number;
  completados: number;
  cancelados: number;
  gananciasTotal: number;
}

export default function GrueroServicios() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');
  const [filtroPeriodo, setFiltroPeriodo] = useState<string>('todo');

  useEffect(() => {
    cargarServicios();
  }, [filtroEstado, filtroPeriodo]);

  const cargarServicios = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (filtroEstado !== 'TODOS') {
        params.status = filtroEstado;
      }
      
      if (filtroPeriodo !== 'todo') {
        params.periodo = filtroPeriodo;
      }

      const response = await api.get('/gruero/historial', { params });
      
      if (response.data.success) {
        setServicios(response.data.data);
        setResumen(response.data.resumen);
      }
    } catch (error: any) {
      console.error('Error al cargar servicios:', error);
      toast.error(error.response?.data?.message || 'Error al cargar servicios');
    } finally {
      setLoading(false);
    }
  };

  const estadoConfig: Record<string, { color: string; bg: string; text: string; label: string }> = {
    SOLICITADO: { color: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Solicitado' },
    ACEPTADO: { color: 'blue', bg: 'bg-blue-100', text: 'text-blue-800', label: 'Aceptado' },
    EN_CAMINO: { color: 'indigo', bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'En Camino' },
    EN_SITIO: { color: 'purple', bg: 'bg-purple-100', text: 'text-purple-800', label: 'En Sitio' },
    COMPLETADO: { color: 'green', bg: 'bg-green-100', text: 'text-green-800', label: 'Completado' },
    CANCELADO: { color: 'red', bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelado' },
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff7a3d] mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando servicios...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#1e3a5f] mb-2">Mis Servicios</h1>
          <p className="text-sm md:text-base text-gray-600">Historial completo de servicios realizados</p>
        </div>

        {/* Resumen Stats */}
        {resumen && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border-l-4 border-blue-500">
              <p className="text-xs md:text-sm text-gray-600 mb-1">Total Servicios</p>
              <p className="text-2xl md:text-3xl font-bold text-blue-600">{resumen.totalServicios}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border-l-4 border-green-500">
              <p className="text-xs md:text-sm text-gray-600 mb-1">Completados</p>
              <p className="text-2xl md:text-3xl font-bold text-green-600">{resumen.completados}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border-l-4 border-red-500">
              <p className="text-xs md:text-sm text-gray-600 mb-1">Cancelados</p>
              <p className="text-2xl md:text-3xl font-bold text-red-600">{resumen.cancelados}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border-l-4 border-orange-500 col-span-2 lg:col-span-1">
              <p className="text-xs md:text-sm text-gray-600 mb-1">Ganancias</p>
              <p className="text-xl md:text-2xl font-bold text-orange-600">
                ${resumen.gananciasTotal.toLocaleString('es-CL')}
              </p>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-lg p-3 md:p-4 mb-6 border border-gray-100">
          {/* Filtro Estado */}
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Filter className="h-4 w-4 md:h-5 md:w-5 text-gray-400 flex-shrink-0" />
              <span className="font-semibold text-gray-700 text-sm md:text-base">Estado</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFiltroEstado('TODOS')}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium whitespace-nowrap transition-colors text-xs md:text-sm ${
                  filtroEstado === 'TODOS'
                    ? 'bg-[#1e3a5f] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              {Object.entries(estadoConfig).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setFiltroEstado(key)}
                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium whitespace-nowrap transition-colors text-xs md:text-sm ${
                    filtroEstado === key
                      ? `${config.bg} ${config.text}`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filtro Período */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="h-4 w-4 md:h-5 md:w-5 text-gray-400 flex-shrink-0" />
              <span className="font-semibold text-gray-700 text-sm md:text-base">Período</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'hoy', label: 'Hoy' },
                { value: 'semana', label: 'Esta Semana' },
                { value: 'mes', label: 'Este Mes' },
                { value: 'todo', label: 'Todo' },
              ].map((periodo) => (
                <button
                  key={periodo.value}
                  onClick={() => setFiltroPeriodo(periodo.value)}
                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium whitespace-nowrap transition-colors text-xs md:text-sm ${
                    filtroPeriodo === periodo.value
                      ? 'bg-[#ff7a3d] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {periodo.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de Servicios */}
        {servicios.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 text-center border border-gray-100">
            <Truck className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">No hay servicios</h3>
            <p className="text-sm md:text-base text-gray-500">
              {filtroEstado !== 'TODOS' || filtroPeriodo !== 'todo'
                ? 'Intenta con otros filtros'
                : 'Los servicios que aceptes aparecerán aquí'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {servicios.map((servicio) => {
              const estado = estadoConfig[servicio.status as keyof typeof estadoConfig];

              return (
                <div
                  key={servicio.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-100 overflow-hidden"
                >
                  {/* Header de Card */}
                  <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] p-3 md:p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-bold text-xs md:text-sm">
                        {format(new Date(servicio.solicitadoAt), "dd 'de' MMM, yyyy", { locale: es })}
                      </span>
                      <span className={`${estado.bg} ${estado.text} px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs font-semibold`}>
                        {estado.label}
                      </span>
                    </div>
                    <p className="text-white text-xs opacity-90">
                      {format(new Date(servicio.solicitadoAt), 'HH:mm', { locale: es })} hrs
                    </p>
                  </div>

                  {/* Contenido de Card */}
                  <div className="p-3 md:p-4 space-y-3">
                    {/* Cliente */}
                    <div>
                      <p className="text-xs text-gray-500">Cliente</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {servicio.cliente.user.nombre} {servicio.cliente.user.apellido}
                      </p>
                    </div>

                    {/* Origen */}
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 md:h-5 md:w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Origen</p>
                        <p className="text-xs md:text-sm font-medium text-gray-900 line-clamp-1">
                          {servicio.origenDireccion}
                        </p>
                      </div>
                    </div>

                    {/* Destino */}
                    <div className="flex items-start">
                      <Navigation className="h-4 w-4 md:h-5 md:w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Destino</p>
                        <p className="text-xs md:text-sm font-medium text-gray-900 line-clamp-1">
                          {servicio.destinoDireccion}
                        </p>
                      </div>
                    </div>

                    {/* Footer: Precio y Distancia */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span className="text-sm md:text-base font-semibold text-green-600">
                          ${servicio.totalGruero.toLocaleString('es-CL')}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">{servicio.distanciaKm} km</div>
                    </div>

                    {/* Calificación */}
                    {servicio.calificacion && (
                      <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 md:h-4 md:w-4 ${
                                star <= servicio.calificacion!.puntuacionGruero
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-xs md:text-sm font-semibold text-gray-700">
                            {servicio.calificacion.puntuacionGruero}.0
                          </span>
                        </div>
                        {servicio.calificacion.comentarioGruero && (
                          <p className="text-xs text-gray-600 mt-1 italic line-clamp-2">
                            "{servicio.calificacion.comentarioGruero}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}