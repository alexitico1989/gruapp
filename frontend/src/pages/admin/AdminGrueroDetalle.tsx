import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Gruero {
  id: string;
  userId: string;
  patente: string;
  marca: string;
  modelo: string;
  anio: number;
  tipoGrua: string;
  capacidadToneladas: number;
  tiposVehiculosAtiende: string;
  verificado: boolean;
  cuentaSuspendida: boolean;
  motivoSuspension?: string;
  totalServicios: number;
  calificacionPromedio: number;
  status: string;
  banco: string | null;
  tipoCuenta: string | null;
  numeroCuenta: string | null;
  nombreTitular: string | null;
  rutTitular: string | null;
  emailTransferencia: string | null;
  user: {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    rut?: string;
  };
  servicios: any[];
  calificacionesRecibidas: any[];
}

interface Servicio {
  id: string;
  status: string;
  tipoVehiculo: string;
  origenDireccion: string;
  destinoDireccion: string;
  distanciaKm: number;
  totalCliente: number;
  totalGruero: number;
  solicitadoAt: string;
  completadoAt?: string;
  cliente: {
    user: {
      nombre: string;
      apellido: string;
      telefono: string;
    };
  };
  calificacion?: {
    puntuacionGruero: number;
    comentarioGruero: string;
    createdAt: string;
  };
}

export default function AdminGrueroDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('informacion');
  const [gruero, setGruero] = useState<Gruero | null>(null);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [estadisticasServicios, setEstadisticasServicios] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingServicios, setLoadingServicios] = useState(false);
  const [selectedServicio, setSelectedServicio] = useState<Servicio | null>(null);
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  const [filtroPeriodo, setFiltroPeriodo] = useState('');

  useEffect(() => {
    fetchGrueroDetalle();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'servicios') {
      fetchServicios();
    }
  }, [activeTab, filtroStatus, filtroPeriodo]);

  const fetchGrueroDetalle = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/admin/grueros/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setGruero(response.data.data);
      }
    } catch (error) {
      console.error('Error al cargar gruero:', error);
      toast.error('Error al cargar información del gruero');
    } finally {
      setLoading(false);
    }
  };

  const fetchServicios = async () => {
    try {
      setLoadingServicios(true);
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        limit: '20',
        ...(filtroStatus !== 'TODOS' && { status: filtroStatus }),
        ...(filtroPeriodo && { periodo: filtroPeriodo }),
      });

      const response = await axios.get(`${API_URL}/admin/grueros/${id}/servicios?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setServicios(response.data.data);
        setEstadisticasServicios(response.data.estadisticas);
      }
    } catch (error) {
      console.error('Error al cargar servicios:', error);
      toast.error('Error al cargar servicios');
    } finally {
      setLoadingServicios(false);
    }
  };

  const truncateAddress = (address: string, maxLength: number = 50) => {
    if (!address || address.length <= maxLength) return address || 'No especificado';
    return address.substring(0, maxLength) + '...';
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      COMPLETADO: 'bg-green-100 text-green-800',
      CANCELADO: 'bg-red-100 text-red-800',
      EN_SITIO: 'bg-blue-100 text-blue-800',
      EN_CAMINO: 'bg-yellow-100 text-yellow-800',
      ACEPTADO: 'bg-purple-100 text-purple-800',
      PENDIENTE: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      fecha: date.toLocaleDateString('es-CL', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      hora: date.toLocaleTimeString('es-CL', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información...</p>
        </div>
      </div>
    );
  }

  if (!gruero) return null;

  const tabs = [
    { id: 'informacion', nombre: 'Información General', icon: '📋' },
    { id: 'servicios', nombre: 'Historial de Servicios', icon: '🚀' },
    { id: 'calificaciones', nombre: 'Calificaciones', icon: '⭐' },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-3 md:space-x-4">
          <button
            onClick={() => navigate('/admin/grueros')}
            className="text-gray-600 hover:text-gray-900 flex-shrink-0"
          >
            ← Volver
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {gruero.user.nombre} {gruero.user.apellido}
            </h1>
            <p className="text-sm md:text-base text-gray-600">Detalle del Gruero</p>
          </div>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs md:text-sm font-semibold ${
              gruero.verificado
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {gruero.verificado ? 'VERIFICADO' : 'PENDIENTE'}
          </span>

          {gruero.cuentaSuspendida && (
            <span className="px-3 py-1 rounded-full text-xs md:text-sm font-semibold bg-red-100 text-red-800">
              SUSPENDIDO
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 overflow-x-auto scrollbar-hide">
          <nav className="flex space-x-4 md:space-x-8 px-4 md:px-6 min-w-max" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 md:py-4 px-1 border-b-2 font-medium text-xs md:text-sm transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.nombre}</span>
                <span className="sm:hidden">{tab.nombre.split(' ')[0]}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-4 md:p-6">
          {/* Información General */}
          {activeTab === 'informacion' && (
            <div className="space-y-6">
              {/* Información Personal */}
              <div>
                <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Información Personal</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  <div>
                    <p className="text-xs md:text-sm text-gray-600">Email</p>
                    <p className="font-medium text-sm md:text-base truncate">{gruero.user.email}</p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-600">Teléfono</p>
                    <p className="font-medium text-sm md:text-base">{gruero.user.telefono}</p>
                  </div>
                  {gruero.user.rut && (
                    <div>
                      <p className="text-xs md:text-sm text-gray-600">RUT</p>
                      <p className="font-medium text-sm md:text-base">{gruero.user.rut}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs md:text-sm text-gray-600">Servicios Realizados</p>
                    <p className="font-medium text-sm md:text-base">{gruero.totalServicios}</p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-600">Calificación</p>
                    <p className="font-medium text-sm md:text-base flex items-center">
                      <span className="text-yellow-500 mr-1">⭐</span>
                      {gruero.calificacionPromedio.toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-600">Estado</p>
                    <p className="font-medium text-sm md:text-base">{gruero.status}</p>
                  </div>
                </div>
              </div>

              {/* Información del Vehículo */}
              <div>
                <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Información del Vehículo</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  <div>
                    <p className="text-xs md:text-sm text-gray-600">Patente</p>
                    <p className="font-medium text-sm md:text-base">{gruero.patente}</p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-600">Marca y Modelo</p>
                    <p className="font-medium text-sm md:text-base">
                      {gruero.marca} {gruero.modelo} ({gruero.anio})
                    </p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-600">Tipo de Grúa</p>
                    <p className="font-medium text-sm md:text-base">{gruero.tipoGrua}</p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-600">Capacidad</p>
                    <p className="font-medium text-sm md:text-base">{gruero.capacidadToneladas} Toneladas</p>
                  </div>
                </div>

                {/* Tipos de Vehículos que Atiende */}
                <div className="mt-6">
                  <p className="text-xs md:text-sm text-gray-600 mb-2">Tipos de Vehículos que Atiende</p>
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      try {
                        const tipos = JSON.parse(gruero.tiposVehiculosAtiende || '[]');
                        return tipos.length > 0 ? tipos.map((tipo: string, index: number) => (
                          <span 
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                          >
                            {tipo}
                          </span>
                        )) : (
                          <span className="text-sm text-gray-500">No especificado</span>
                        );
                      } catch (error) {
                        return <span className="text-sm text-gray-500">No especificado</span>;
                      }
                    })()}
                  </div>
                </div>
              </div>

              {/* Cuenta Bancaria */}
              <div>
                <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Cuenta Bancaria</h2>
                {gruero.banco ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 bg-green-50 p-4 rounded-lg border border-green-200">
                    <div>
                      <p className="text-xs md:text-sm text-gray-600">Banco</p>
                      <p className="font-medium text-sm md:text-base">{gruero.banco}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-gray-600">Tipo de Cuenta</p>
                      <p className="font-medium text-sm md:text-base">
                        {gruero.tipoCuenta === 'CUENTA_RUT' ? 'Cuenta RUT' :
                         gruero.tipoCuenta === 'VISTA' ? 'Cuenta Vista' :
                         gruero.tipoCuenta === 'CORRIENTE' ? 'Cuenta Corriente' :
                         gruero.tipoCuenta}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-gray-600">Número de Cuenta</p>
                      <p className="font-medium text-sm md:text-base">{gruero.numeroCuenta}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-gray-600">Titular</p>
                      <p className="font-medium text-sm md:text-base">{gruero.nombreTitular}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-gray-600">RUT Titular</p>
                      <p className="font-medium text-sm md:text-base">{gruero.rutTitular}</p>
                    </div>
                    {gruero.emailTransferencia && (
                      <div>
                        <p className="text-xs md:text-sm text-gray-600">Email Transferencias</p>
                        <p className="font-medium text-sm md:text-base">{gruero.emailTransferencia}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                    <p className="text-sm text-gray-500">No ha configurado su cuenta bancaria</p>
                  </div>
                )}
              </div>

              {/* Estadísticas */}
              <div>
                <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Estadísticas</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-3xl mb-2">✅</div>
                    <div className="text-2xl font-bold text-gray-900">{gruero.totalServicios}</div>
                    <div className="text-sm text-gray-600">Servicios Completados</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-3xl mb-2">⭐</div>
                    <div className="text-2xl font-bold text-yellow-500">{gruero.calificacionPromedio.toFixed(1)}</div>
                    <div className="text-sm text-gray-600">Calificación Promedio</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-3xl mb-2">{gruero.verificado ? '🛡️' : '⏳'}</div>
                    <div className="text-2xl font-bold text-gray-900">{gruero.verificado ? 'Verificado' : 'Pendiente'}</div>
                    <div className="text-sm text-gray-600">Estado de Verificación</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Historial de Servicios */}
          {activeTab === 'servicios' && (
            <div className="space-y-4">
              {/* Filtros y Estadísticas */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={filtroStatus}
                    onChange={(e) => setFiltroStatus(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 md:px-4 py-2 text-xs md:text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="TODOS">Todos los estados</option>
                    <option value="COMPLETADO">Completados</option>
                    <option value="CANCELADO">Cancelados</option>
                    <option value="EN_SITIO">En sitio</option>
                    <option value="EN_CAMINO">En camino</option>
                  </select>

                  <select
                    value={filtroPeriodo}
                    onChange={(e) => setFiltroPeriodo(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 md:px-4 py-2 text-xs md:text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todo el tiempo</option>
                    <option value="hoy">Hoy</option>
                    <option value="semana">Esta semana</option>
                    <option value="mes">Este mes</option>
                    <option value="año">Este año</option>
                  </select>
                </div>

                {estadisticasServicios && (
                  <div className="grid grid-cols-3 gap-2 md:gap-4 text-xs md:text-sm">
                    <div className="text-center">
                      <p className="text-gray-600">Total</p>
                      <p className="text-lg md:text-xl font-bold text-gray-900">{estadisticasServicios.total}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600">Completados</p>
                      <p className="text-lg md:text-xl font-bold text-green-600">{estadisticasServicios.completados}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600">Ganado</p>
                      <p className="text-base md:text-xl font-bold text-blue-600">
                        ${(estadisticasServicios.totalGanado / 1000)?.toFixed(0)}k
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Lista de Servicios */}
              {loadingServicios ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : servicios.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No hay servicios para mostrar</p>
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  {servicios.map((servicio) => (
                    <div 
                      key={servicio.id} 
                      className="border border-gray-200 rounded-lg p-3 md:p-4 hover:shadow-md transition cursor-pointer hover:border-blue-300"
                      onClick={() => setSelectedServicio(servicio)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(servicio.status)}`}>
                            {servicio.status}
                          </span>
                          <span className="text-xs md:text-sm text-gray-600">{servicio.tipoVehiculo}</span>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm md:text-base font-semibold text-gray-900">
                            ${servicio.totalGruero.toLocaleString('es-CL')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(servicio.solicitadoAt).toLocaleDateString('es-CL')}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
                        <div>
                          <p className="text-gray-600">Cliente</p>
                          <p className="font-medium truncate">
                            {servicio.cliente.user.nombre} {servicio.cliente.user.apellido}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Distancia</p>
                          <p className="font-medium">{servicio.distanciaKm.toFixed(1)} km</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-600">Ruta</p>
                          <p 
                            className="text-xs text-gray-700 truncate" 
                            title={`${servicio.origenDireccion || 'No especificado'} → ${servicio.destinoDireccion || 'No especificado'}`}
                          >
                            {truncateAddress(servicio.origenDireccion, 30)} → {truncateAddress(servicio.destinoDireccion, 30)}
                          </p>
                        </div>
                      </div>

                      {servicio.calificacion && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-yellow-500">⭐</span>
                              <span className="font-semibold text-sm">{servicio.calificacion.puntuacionGruero}/5</span>
                            </div>
                          </div>
                          {servicio.calificacion.comentarioGruero && (
                            <p className="text-xs md:text-sm text-gray-600 mt-2 italic line-clamp-2">
                              "{servicio.calificacion.comentarioGruero}"
                            </p>
                          )}
                        </div>
                      )}
                      
                      <p className="text-xs text-blue-600 mt-2">Click para ver detalles →</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Calificaciones */}
          {activeTab === 'calificaciones' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base md:text-lg font-semibold text-gray-900">Calificaciones Recibidas</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl md:text-3xl">⭐</span>
                  <div>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">{gruero.calificacionPromedio.toFixed(1)}</p>
                    <p className="text-xs md:text-sm text-gray-600">{gruero.calificacionesRecibidas.length} calificaciones</p>
                  </div>
                </div>
              </div>

              {gruero.calificacionesRecibidas.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No hay calificaciones aún</p>
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  {gruero.calificacionesRecibidas.map((cal: any) => (
                    <div key={cal.id} className="border border-gray-200 rounded-lg p-3 md:p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`text-base md:text-lg ${i < cal.puntuacionGruero ? 'text-yellow-500' : 'text-gray-300'}`}>
                              ⭐
                            </span>
                          ))}
                        </div>
                        <span className="text-xs md:text-sm text-gray-500">
                          {new Date(cal.createdAt).toLocaleDateString('es-CL')}
                        </span>
                      </div>
                      {cal.comentarioGruero && (
                        <p className="text-xs md:text-sm text-gray-700 italic">"{cal.comentarioGruero}"</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalle de Servicio */}
      {selectedServicio && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-full md:max-w-3xl w-full p-4 md:p-6 my-8 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-4 md:mb-6 sticky top-0 bg-white pb-3 border-b border-gray-100">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Detalles del Servicio</h2>
              <button
                onClick={() => setSelectedServicio(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl md:text-3xl"
              >
                ×
              </button>
            </div>

            <div className="mb-4 md:mb-6">
              <span className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold ${getStatusColor(selectedServicio.status)}`}>
                {selectedServicio.status}
              </span>
              <span className="ml-3 text-sm md:text-base text-gray-600">{selectedServicio.tipoVehiculo}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
              <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                <h3 className="text-xs md:text-sm font-semibold text-gray-700 mb-2">👤 Cliente</h3>
                <p className="font-medium text-sm md:text-base text-gray-900">
                  {selectedServicio.cliente.user.nombre} {selectedServicio.cliente.user.apellido}
                </p>
                <p className="text-xs md:text-sm text-gray-600">{selectedServicio.cliente.user.telefono}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                <h3 className="text-xs md:text-sm font-semibold text-gray-700 mb-2">📏 Distancia</h3>
                <p className="text-xl md:text-2xl font-bold text-blue-600">{selectedServicio.distanciaKm.toFixed(1)} km</p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-3 md:p-4 mb-4 md:mb-6">
              <h3 className="text-xs md:text-sm font-semibold text-blue-900 mb-3">🗺️ Ruta del Servicio</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-blue-700 font-medium">Origen:</p>
                  <p className="text-xs md:text-sm text-blue-900">{selectedServicio.origenDireccion}</p>
                </div>
                <div className="flex items-center justify-center text-blue-600">
                  <span className="text-xl md:text-2xl">↓</span>
                </div>
                <div>
                  <p className="text-xs text-blue-700 font-medium">Destino:</p>
                  <p className="text-xs md:text-sm text-blue-900">{selectedServicio.destinoDireccion}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 md:p-4 mb-4 md:mb-6">
              <h3 className="text-xs md:text-sm font-semibold text-gray-700 mb-3">🕐 Línea de Tiempo</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-600">Solicitado:</p>
                  <p className="text-xs md:text-sm font-medium">
                    {formatDateTime(selectedServicio.solicitadoAt).fecha}
                  </p>
                  <p className="text-xs md:text-sm text-gray-600">
                    {formatDateTime(selectedServicio.solicitadoAt).hora}
                  </p>
                </div>
                {selectedServicio.completadoAt && (
                  <div>
                    <p className="text-xs text-gray-600">Completado:</p>
                    <p className="text-xs md:text-sm font-medium">
                      {formatDateTime(selectedServicio.completadoAt).fecha}
                    </p>
                    <p className="text-xs md:text-sm text-gray-600">
                      {formatDateTime(selectedServicio.completadoAt).hora}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-3 md:p-4 mb-4 md:mb-6">
              <h3 className="text-xs md:text-sm font-semibold text-green-900 mb-3">💰 Información Financiera</h3>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <p className="text-xs text-green-700">Total Cliente:</p>
                  <p className="text-lg md:text-xl font-bold text-green-900">
                    ${selectedServicio.totalCliente.toLocaleString('es-CL')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-green-700">Ganancia Gruero:</p>
                  <p className="text-lg md:text-xl font-bold text-green-900">
                    ${selectedServicio.totalGruero.toLocaleString('es-CL')}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-green-700">Comisión Plataforma:</p>
                  <p className="text-base md:text-lg font-bold text-green-600">
                    ${(selectedServicio.totalCliente - selectedServicio.totalGruero).toLocaleString('es-CL')}
                  </p>
                </div>
              </div>
            </div>

            {selectedServicio.calificacion && (
              <div className="bg-yellow-50 rounded-lg p-3 md:p-4">
                <h3 className="text-xs md:text-sm font-semibold text-yellow-900 mb-3">⭐ Calificación del Cliente</h3>
                <div className="flex items-center space-x-2 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span 
                      key={i} 
                      className={`text-xl md:text-2xl ${i < selectedServicio.calificacion!.puntuacionGruero ? 'text-yellow-500' : 'text-gray-300'}`}
                    >
                      ⭐
                    </span>
                  ))}
                  <span className="text-base md:text-lg font-bold text-yellow-900">
                    {selectedServicio.calificacion.puntuacionGruero}/5
                  </span>
                </div>
                {selectedServicio.calificacion.comentarioGruero && (
                  <div className="mt-3">
                    <p className="text-xs text-yellow-700 mb-1">Comentario:</p>
                    <p className="text-xs md:text-sm text-yellow-900 italic">
                      "{selectedServicio.calificacion.comentarioGruero}"
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 md:mt-6 flex justify-end sticky bottom-0 bg-white pt-3 border-t border-gray-100">
              <button
                onClick={() => setSelectedServicio(null)}
                className="px-4 md:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm md:text-base"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}