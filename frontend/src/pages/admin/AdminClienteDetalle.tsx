import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Cliente {
  id: string;
  userId: string;
  cuentaSuspendida: boolean;
  motivoSuspension?: string;
  user: {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    rut?: string;
    createdAt: string;
  };
  servicios: any[];
  calificacionesDadas: any[];
  estadisticas: {
    totalServicios: number;
    serviciosCompletados: number;
    serviciosCancelados: number;
    totalGastado: number;
    tasaCancelacion: number;
  };
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
  canceladoAt?: string;
  motivoCancelacion?: string;
  gruero?: {
    user: {
      nombre: string;
      apellido: string;
      telefono: string;
    };
    patente: string;
    marca: string;
    modelo: string;
  };
  calificacion?: {
    puntuacionGruero: number;
    comentarioGruero: string;
    puntuacionCliente: number;
    comentarioCliente: string;
    createdAt: string;
  };
}

export default function AdminClienteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('informacion');
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [estadisticasServicios, setEstadisticasServicios] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingServicios, setLoadingServicios] = useState(false);
  const [selectedServicio, setSelectedServicio] = useState<Servicio | null>(null);
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  const [filtroPeriodo, setFiltroPeriodo] = useState('');

  useEffect(() => {
    fetchClienteDetalle();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'servicios') {
      fetchServicios();
    }
  }, [activeTab, filtroStatus, filtroPeriodo]);

  const fetchClienteDetalle = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/admin/clientes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setCliente(response.data.data);
      }
    } catch (error) {
      console.error('Error al cargar cliente:', error);
      toast.error('Error al cargar información del cliente');
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

      const response = await axios.get(`${API_URL}/admin/clientes/${id}/servicios?${params}`, {
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

  const handleSuspender = async () => {
    const motivo = prompt('Ingresa el motivo de suspensión:');
    if (!motivo) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.patch(
        `${API_URL}/admin/clientes/${id}/suspender`,
        { motivo },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Cliente suspendido exitosamente');
        fetchClienteDetalle();
      }
    } catch (error: any) {
      console.error('Error al suspender cliente:', error);
      toast.error(error.response?.data?.message || 'Error al suspender cliente');
    }
  };

  const handleReactivar = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.patch(
        `${API_URL}/admin/clientes/${id}/reactivar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Cliente reactivado exitosamente');
        fetchClienteDetalle();
      }
    } catch (error: any) {
      console.error('Error al reactivar cliente:', error);
      toast.error(error.response?.data?.message || 'Error al reactivar cliente');
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
      SOLICITADO: 'bg-gray-100 text-gray-800',
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
        day: 'numeric',
      }),
      hora: date.toLocaleTimeString('es-CL', {
        hour: '2-digit',
        minute: '2-digit',
      }),
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

  if (!cliente) return null;

  const tabs = [
    { id: 'informacion', nombre: 'Información General', icon: '📋' },
    { id: 'servicios', nombre: 'Historial de Servicios', icon: '🚀' },
    { id: 'calificaciones', nombre: 'Calificaciones Dadas', icon: '⭐' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/clientes')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Volver
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {cliente.user.nombre} {cliente.user.apellido}
            </h1>
            <p className="text-gray-600">Detalle del Cliente</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* Badge de estado */}
          {cliente.cuentaSuspendida ? (
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
              SUSPENDIDO
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
              ACTIVO
            </span>
          )}
          
          {/* Botones de acción */}
          {cliente.cuentaSuspendida ? (
            <button
              onClick={handleReactivar}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Reactivar
            </button>
          ) : (
            <button
              onClick={handleSuspender}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Suspender
            </button>
          )}
        </div>
      </div>

      {/* Alerta de Suspensión */}
      {cliente.cuentaSuspendida && cliente.motivoSuspension && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Cuenta Suspendida</h3>
              <p className="mt-2 text-sm text-red-700">
                <strong>Motivo:</strong> {cliente.motivoSuspension}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.nombre}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Información General */}
          {activeTab === 'informacion' && (
            <div className="space-y-6">
              {/* Información Personal */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{cliente.user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Teléfono</p>
                    <p className="font-medium">{cliente.user.telefono}</p>
                  </div>
                  {cliente.user.rut && (
                    <div>
                      <p className="text-sm text-gray-600">RUT</p>
                      <p className="font-medium">{cliente.user.rut}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Miembro desde</p>
                    <p className="font-medium">
                      {new Date(cliente.user.createdAt).toLocaleDateString('es-CL')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Estadísticas del Cliente */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600 font-medium">Total Servicios</p>
                    <p className="text-3xl font-bold text-blue-900">
                      {cliente.estadisticas.totalServicios}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-600 font-medium">Completados</p>
                    <p className="text-3xl font-bold text-green-900">
                      {cliente.estadisticas.serviciosCompletados}
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <p className="text-sm text-red-600 font-medium">Cancelados</p>
                    <p className="text-3xl font-bold text-red-900">
                      {cliente.estadisticas.serviciosCancelados}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-purple-600 font-medium">Total Gastado</p>
                    <p className="text-3xl font-bold text-purple-900">
                      ${cliente.estadisticas.totalGastado.toLocaleString('es-CL')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Alerta de Comportamiento */}
              {cliente.estadisticas.tasaCancelacion > 30 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">⚠️</span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Tasa de Cancelación Alta
                      </h3>
                      <p className="mt-2 text-sm text-yellow-700">
                        Este cliente tiene una tasa de cancelación del{' '}
                        {cliente.estadisticas.tasaCancelacion.toFixed(1)}%. 
                        Considera revisar su comportamiento.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Historial de Servicios */}
          {activeTab === 'servicios' && (
            <div className="space-y-4">
              {/* Filtros y Estadísticas */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <select
                    value={filtroStatus}
                    onChange={(e) => setFiltroStatus(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="TODOS">Todos los estados</option>
                    <option value="COMPLETADO">Completados</option>
                    <option value="CANCELADO">Cancelados</option>
                    <option value="EN_SITIO">En sitio</option>
                    <option value="EN_CAMINO">En camino</option>
                    <option value="SOLICITADO">Solicitados</option>
                  </select>

                  <select
                    value={filtroPeriodo}
                    onChange={(e) => setFiltroPeriodo(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todo el tiempo</option>
                    <option value="hoy">Hoy</option>
                    <option value="semana">Esta semana</option>
                    <option value="mes">Este mes</option>
                    <option value="año">Este año</option>
                  </select>
                </div>

                {estadisticasServicios && (
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="text-center">
                      <p className="text-gray-600">Total</p>
                      <p className="text-xl font-bold text-gray-900">{estadisticasServicios.total}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600">Completados</p>
                      <p className="text-xl font-bold text-green-600">{estadisticasServicios.completados}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600">Gastado</p>
                      <p className="text-xl font-bold text-blue-600">
                        ${estadisticasServicios.totalGastado?.toLocaleString('es-CL')}
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
                <div className="space-y-4">
                  {servicios.map((servicio) => (
                    <div
                      key={servicio.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer hover:border-blue-300"
                      onClick={() => setSelectedServicio(servicio)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(servicio.status)}`}>
                            {servicio.status}
                          </span>
                          <span className="ml-2 text-sm text-gray-600">{servicio.tipoVehiculo}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            ${servicio.totalCliente.toLocaleString('es-CL')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(servicio.solicitadoAt).toLocaleDateString('es-CL')}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {servicio.gruero && (
                          <div>
                            <p className="text-gray-600">Gruero</p>
                            <p className="font-medium">
                              {servicio.gruero.user.nombre} {servicio.gruero.user.apellido}
                            </p>
                            <p className="text-xs text-gray-500">
                              {servicio.gruero.marca} {servicio.gruero.modelo} - {servicio.gruero.patente}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-gray-600">Distancia</p>
                          <p className="font-medium">{servicio.distanciaKm.toFixed(1)} km</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-600">Ruta</p>
                          <p
                            className="text-xs text-gray-700"
                            title={`${servicio.origenDireccion || 'No especificado'} → ${servicio.destinoDireccion || 'No especificado'}`}
                          >
                            {truncateAddress(servicio.origenDireccion, 40)} → {truncateAddress(servicio.destinoDireccion, 40)}
                          </p>
                        </div>
                      </div>

                      {servicio.status === 'CANCELADO' && servicio.motivoCancelacion && (
                        <div className="mt-3 pt-3 border-t border-red-200 bg-red-50 -m-4 p-4 rounded-b-lg">
                          <p className="text-xs text-red-700 font-medium">Motivo de cancelación:</p>
                          <p className="text-sm text-red-900 italic">"{servicio.motivoCancelacion}"</p>
                        </div>
                      )}

                      <p className="text-xs text-blue-600 mt-2">Click para ver detalles completos →</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Calificaciones Dadas */}
          {activeTab === 'calificaciones' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Calificaciones que ha dado</h3>

              {cliente.calificacionesDadas.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No ha dado calificaciones aún</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cliente.calificacionesDadas.map((cal: any) => (
                    <div key={cal.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < cal.puntuacionGruero ? 'text-yellow-500' : 'text-gray-300'}>
                              ⭐
                            </span>
                          ))}
                          <span className="font-medium">al Gruero</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(cal.createdAt).toLocaleDateString('es-CL')}
                        </span>
                      </div>
                      {cal.comentarioGruero && (
                        <p className="text-sm text-gray-700 italic">"{cal.comentarioGruero}"</p>
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
          <div className="bg-white rounded-lg max-w-3xl w-full p-6 my-8">
            {/* Header del Modal */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Detalles del Servicio</h2>
              <button
                onClick={() => setSelectedServicio(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Estado del Servicio */}
            <div className="mb-6">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(selectedServicio.status)}`}>
                {selectedServicio.status}
              </span>
              <span className="ml-3 text-gray-600">{selectedServicio.tipoVehiculo}</span>
            </div>

            {/* Grid de Información */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Gruero */}
              {selectedServicio.gruero && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">🚛 Gruero</h3>
                  <p className="font-medium text-gray-900">
                    {selectedServicio.gruero.user.nombre} {selectedServicio.gruero.user.apellido}
                  </p>
                  <p className="text-sm text-gray-600">{selectedServicio.gruero.user.telefono}</p>
                  <p className="text-sm text-gray-600">
                    {selectedServicio.gruero.marca} {selectedServicio.gruero.modelo} - {selectedServicio.gruero.patente}
                  </p>
                </div>
              )}

              {/* Distancia */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">📏 Distancia</h3>
                <p className="text-2xl font-bold text-blue-600">{selectedServicio.distanciaKm.toFixed(1)} km</p>
              </div>
            </div>

            {/* Ruta Completa */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">🗺️ Ruta del Servicio</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-blue-700 font-medium">Origen:</p>
                  <p className="text-sm text-blue-900">{selectedServicio.origenDireccion}</p>
                </div>
                <div className="flex items-center justify-center text-blue-600">
                  <span className="text-2xl">↓</span>
                </div>
                <div>
                  <p className="text-xs text-blue-700 font-medium">Destino:</p>
                  <p className="text-sm text-blue-900">{selectedServicio.destinoDireccion}</p>
                </div>
              </div>
            </div>

            {/* Fechas y Horas */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">🕐 Línea de Tiempo</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-600">Solicitado:</p>
                  <p className="text-sm font-medium">{formatDateTime(selectedServicio.solicitadoAt).fecha}</p>
                  <p className="text-sm text-gray-600">{formatDateTime(selectedServicio.solicitadoAt).hora}</p>
                </div>
                {selectedServicio.completadoAt && (
                  <div>
                    <p className="text-xs text-gray-600">Completado:</p>
                    <p className="text-sm font-medium">{formatDateTime(selectedServicio.completadoAt).fecha}</p>
                    <p className="text-sm text-gray-600">{formatDateTime(selectedServicio.completadoAt).hora}</p>
                  </div>
                )}
                {selectedServicio.canceladoAt && (
                  <div>
                    <p className="text-xs text-red-600">Cancelado:</p>
                    <p className="text-sm font-medium">{formatDateTime(selectedServicio.canceladoAt).fecha}</p>
                    <p className="text-sm text-gray-600">{formatDateTime(selectedServicio.canceladoAt).hora}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Información Financiera */}
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-green-900 mb-3">💰 Información Financiera</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-green-700">Total Pagado:</p>
                  <p className="text-xl font-bold text-green-900">
                    ${selectedServicio.totalCliente.toLocaleString('es-CL')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-green-700">Pago al Gruero:</p>
                  <p className="text-xl font-bold text-green-900">
                    ${selectedServicio.totalGruero.toLocaleString('es-CL')}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-green-700">Comisión Plataforma:</p>
                  <p className="text-lg font-bold text-green-600">
                    ${(selectedServicio.totalCliente - selectedServicio.totalGruero).toLocaleString('es-CL')}
                  </p>
                </div>
              </div>
            </div>

            {/* Motivo de Cancelación */}
            {selectedServicio.motivoCancelacion && (
              <div className="bg-red-50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-red-900 mb-2">❌ Motivo de Cancelación</h3>
                <p className="text-sm text-red-800 italic">"{selectedServicio.motivoCancelacion}"</p>
              </div>
            )}

            {/* Calificación */}
            {selectedServicio.calificacion && (
              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-yellow-900 mb-3">⭐ Calificación</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-yellow-700 mb-1">Al Gruero:</p>
                    <div className="flex items-center space-x-2">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-xl ${i < selectedServicio.calificacion!.puntuacionGruero ? 'text-yellow-500' : 'text-gray-300'}`}
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                    {selectedServicio.calificacion.comentarioGruero && (
                      <p className="text-sm text-yellow-900 italic mt-2">
                        "{selectedServicio.calificacion.comentarioGruero}"
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-yellow-700 mb-1">Al Cliente:</p>
                    <div className="flex items-center space-x-2">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-xl ${i < selectedServicio.calificacion!.puntuacionCliente ? 'text-yellow-500' : 'text-gray-300'}`}
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                    {selectedServicio.calificacion.comentarioCliente && (
                      <p className="text-sm text-yellow-900 italic mt-2">
                        "{selectedServicio.calificacion.comentarioCliente}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Botón Cerrar */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedServicio(null)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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