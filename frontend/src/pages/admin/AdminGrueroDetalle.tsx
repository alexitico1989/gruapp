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
  fotoGruero?: string;
  fotoGrua?: string;
  licenciaConducir?: string;
  licenciaVencimiento?: string;
  seguroVigente?: string;
  seguroVencimiento?: string;
  revisionTecnica?: string;
  revisionVencimiento?: string;
  permisoCirculacion?: string;
  permisoVencimiento?: string;
  estadoVerificacion: string;
  verificado: boolean;
  cuentaSuspendida: boolean;
  motivoRechazo?: string;
  motivoSuspension?: string;
  totalServicios: number;
  calificacionPromedio: number;
  status: string;
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
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedServicio, setSelectedServicio] = useState<Servicio | null>(null);
  const [documentosAprobados, setDocumentosAprobados] = useState<string[]>([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [documentoRechazar, setDocumentoRechazar] = useState('');
  const [motivoRechazo, setMotivoRechazo] = useState('');
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

  const handleToggleDocumento = (documento: string) => {
    setDocumentosAprobados((prev) =>
      prev.includes(documento)
        ? prev.filter((d) => d !== documento)
        : [...prev, documento]
    );
  };

  const handleAprobarDocumentos = async () => {
    if (documentosAprobados.length === 0) {
      toast.error('Selecciona al menos un documento para aprobar');
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.patch(
        `${API_URL}/admin/grueros/${id}/documentos/aprobar`,
        { documentos: documentosAprobados },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        fetchGrueroDetalle();
        setDocumentosAprobados([]);
      }
    } catch (error: any) {
      console.error('Error al aprobar documentos:', error);
      toast.error(error.response?.data?.message || 'Error al aprobar documentos');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRechazarDocumento = async () => {
    if (!motivoRechazo.trim()) {
      toast.error('Debes ingresar un motivo de rechazo');
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.patch(
        `${API_URL}/admin/grueros/${id}/documentos/rechazar`,
        { documento: documentoRechazar, motivo: motivoRechazo },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Documento rechazado');
        setShowRejectModal(false);
        setDocumentoRechazar('');
        setMotivoRechazo('');
        fetchGrueroDetalle();
      }
    } catch (error: any) {
      console.error('Error al rechazar documento:', error);
      toast.error(error.response?.data?.message || 'Error al rechazar documento');
    } finally {
      setActionLoading(false);
    }
  };

  const getImageUrl = (path?: string) => {
    if (!path) return undefined;
    if (path.startsWith('http')) return path;
    const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${API_BASE}${path}`;
  };

  const truncateAddress = (address: string, maxLength: number = 50) => {
    if (!address || address.length <= maxLength) return address || 'No especificado';
    return address.substring(0, maxLength) + '...';
  };

  const calcularDiasHastaVencimiento = (fechaVencimiento?: string) => {
    if (!fechaVencimiento) return null;
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diferencia = vencimiento.getTime() - hoy.getTime();
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  };

  const getColorVencimiento = (dias: number | null) => {
    if (dias === null) return 'text-gray-400';
    if (dias < 0) return 'text-red-600 font-bold';
    if (dias <= 15) return 'text-orange-600 font-bold';
    if (dias <= 30) return 'text-yellow-600';
    return 'text-green-600';
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

  const documentos = [
    {
      nombre: 'Licencia de Conducir',
      key: 'licenciaConducir',
      url: getImageUrl(gruero.licenciaConducir),
      vencimiento: gruero.licenciaVencimiento,
    },
    {
      nombre: 'Seguro Vigente',
      key: 'seguroVigente',
      url: getImageUrl(gruero.seguroVigente),
      vencimiento: gruero.seguroVencimiento,
    },
    {
      nombre: 'Revisión Técnica',
      key: 'revisionTecnica',
      url: getImageUrl(gruero.revisionTecnica),
      vencimiento: gruero.revisionVencimiento,
    },
    {
      nombre: 'Permiso de Circulación',
      key: 'permisoCirculacion',
      url: getImageUrl(gruero.permisoCirculacion),
      vencimiento: gruero.permisoVencimiento,
    },
  ];

  const tabs = [
    { id: 'informacion', nombre: 'Información General', icon: '📋' },
    { id: 'servicios', nombre: 'Historial de Servicios', icon: '🚀' },
    { id: 'calificaciones', nombre: 'Calificaciones', icon: '⭐' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/grueros')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Volver
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {gruero.user.nombre} {gruero.user.apellido}
            </h1>
            <p className="text-gray-600">Detalle del Gruero</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              gruero.estadoVerificacion === 'APROBADO'
                ? 'bg-green-100 text-green-800'
                : gruero.estadoVerificacion === 'RECHAZADO'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {gruero.estadoVerificacion}
          </span>
          {gruero.cuentaSuspendida && (
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
              SUSPENDIDO
            </span>
          )}
        </div>
      </div>

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
                    <p className="font-medium">{gruero.user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Teléfono</p>
                    <p className="font-medium">{gruero.user.telefono}</p>
                  </div>
                  {gruero.user.rut && (
                    <div>
                      <p className="text-sm text-gray-600">RUT</p>
                      <p className="font-medium">{gruero.user.rut}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Servicios Realizados</p>
                    <p className="font-medium">{gruero.totalServicios}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Calificación</p>
                    <p className="font-medium flex items-center">
                      <span className="text-yellow-500 mr-1">⭐</span>
                      {gruero.calificacionPromedio.toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estado</p>
                    <p className="font-medium">{gruero.status}</p>
                  </div>
                </div>
              </div>

              {/* Información del Vehículo */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Vehículo</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Patente</p>
                    <p className="font-medium">{gruero.patente}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Marca y Modelo</p>
                    <p className="font-medium">
                      {gruero.marca} {gruero.modelo} ({gruero.anio})
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tipo de Grúa</p>
                    <p className="font-medium">{gruero.tipoGrua}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Capacidad</p>
                    <p className="font-medium">{gruero.capacidadToneladas} Toneladas</p>
                  </div>
                </div>

                {/* Fotos del Gruero y Grúa */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gruero.fotoGruero && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Foto del Gruero</p>
                      <img
                        src={getImageUrl(gruero.fotoGruero)}
                        alt="Gruero"
                        className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-80"
                        onClick={() => setSelectedImage(getImageUrl(gruero.fotoGruero)!)}
                      />
                    </div>
                  )}
                  {gruero.fotoGrua && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Foto de la Grúa</p>
                      <img
                        src={getImageUrl(gruero.fotoGrua)}
                        alt="Grúa"
                        className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-80"
                        onClick={() => setSelectedImage(getImageUrl(gruero.fotoGrua)!)}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Documentos */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Documentos</h2>
                  {gruero.estadoVerificacion === 'PENDIENTE' && documentosAprobados.length > 0 && (
                    <button
                      onClick={handleAprobarDocumentos}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {actionLoading ? 'Procesando...' : `Aprobar ${documentosAprobados.length} documento(s)`}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {documentos.map((doc) => {
                    const dias = calcularDiasHastaVencimiento(doc.vencimiento);
                    return (
                      <div key={doc.key} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            {gruero.estadoVerificacion === 'PENDIENTE' && (
                              <input
                                type="checkbox"
                                checked={documentosAprobados.includes(doc.key)}
                                onChange={() => handleToggleDocumento(doc.key)}
                                className="w-5 h-5 text-blue-600"
                              />
                            )}
                            <h3 className="font-medium text-gray-900">{doc.nombre}</h3>
                          </div>
                          {doc.vencimiento && (
                            <span className={`text-xs ${getColorVencimiento(dias)}`}>
                              {dias !== null && dias < 0
                                ? `Vencido hace ${Math.abs(dias)} días`
                                : dias !== null && dias <= 15
                                ? `Vence en ${dias} días`
                                : `Vence en ${dias} días`}
                            </span>
                          )}
                        </div>

                        {doc.url ? (
                          <>
                            <img
                              src={doc.url}
                              alt={doc.nombre}
                              className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-80 mb-3"
                              onClick={() => setSelectedImage(doc.url!)}
                            />
                            {doc.vencimiento && (
                              <p className="text-sm text-gray-600">
                                Vencimiento: {new Date(doc.vencimiento).toLocaleDateString('es-CL')}
                              </p>
                            )}
                            {gruero.estadoVerificacion === 'PENDIENTE' && (
                              <button
                                onClick={() => {
                                  setDocumentoRechazar(doc.nombre);
                                  setShowRejectModal(true);
                                }}
                                className="mt-2 text-sm text-red-600 hover:text-red-800"
                              >
                                Rechazar documento
                              </button>
                            )}
                          </>
                        ) : (
                          <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                            <p className="text-gray-400">No cargado</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
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
                      <p className="text-gray-600">Ganado</p>
                      <p className="text-xl font-bold text-blue-600">
                        ${estadisticasServicios.totalGanado?.toLocaleString('es-CL')}
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
                            ${servicio.totalGruero.toLocaleString('es-CL')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(servicio.solicitadoAt).toLocaleDateString('es-CL')}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Cliente</p>
                          <p className="font-medium">
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
                            className="text-xs text-gray-700" 
                            title={`${servicio.origenDireccion || 'No especificado'} → ${servicio.destinoDireccion || 'No especificado'}`}
                          >
                            {truncateAddress(servicio.origenDireccion, 40)} → {truncateAddress(servicio.destinoDireccion, 40)}
                          </p>
                        </div>
                      </div>

                      {servicio.calificacion && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-yellow-500">⭐</span>
                              <span className="font-semibold">{servicio.calificacion.puntuacionGruero}/5</span>
                            </div>
                          </div>
                          {servicio.calificacion.comentarioGruero && (
                            <p className="text-sm text-gray-600 mt-2 italic">
                              "{servicio.calificacion.comentarioGruero}"
                            </p>
                          )}
                        </div>
                      )}
                      
                      <p className="text-xs text-blue-600 mt-2">Click para ver detalles completos →</p>
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
                <h3 className="text-lg font-semibold text-gray-900">Calificaciones Recibidas</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-3xl">⭐</span>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{gruero.calificacionPromedio.toFixed(1)}</p>
                    <p className="text-sm text-gray-600">{gruero.calificacionesRecibidas.length} calificaciones</p>
                  </div>
                </div>
              </div>

              {gruero.calificacionesRecibidas.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No hay calificaciones aún</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {gruero.calificacionesRecibidas.map((cal: any) => (
                    <div key={cal.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < cal.puntuacionGruero ? 'text-yellow-500' : 'text-gray-300'}>
                              ⭐
                            </span>
                          ))}
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
              {/* Cliente */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">👤 Cliente</h3>
                <p className="font-medium text-gray-900">
                  {selectedServicio.cliente.user.nombre} {selectedServicio.cliente.user.apellido}
                </p>
                <p className="text-sm text-gray-600">{selectedServicio.cliente.user.telefono}</p>
              </div>

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
                  <p className="text-sm font-medium">
                    {formatDateTime(selectedServicio.solicitadoAt).fecha}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatDateTime(selectedServicio.solicitadoAt).hora}
                  </p>
                </div>
                {selectedServicio.completadoAt && (
                  <div>
                    <p className="text-xs text-gray-600">Completado:</p>
                    <p className="text-sm font-medium">
                      {formatDateTime(selectedServicio.completadoAt).fecha}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDateTime(selectedServicio.completadoAt).hora}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Información Financiera */}
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-green-900 mb-3">💰 Información Financiera</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-green-700">Total Cliente:</p>
                  <p className="text-xl font-bold text-green-900">
                    ${selectedServicio.totalCliente.toLocaleString('es-CL')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-green-700">Ganancia Gruero:</p>
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

            {/* Calificación */}
            {selectedServicio.calificacion && (
              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-yellow-900 mb-3">⭐ Calificación del Cliente</h3>
                <div className="flex items-center space-x-2 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span 
                      key={i} 
                      className={`text-2xl ${i < selectedServicio.calificacion!.puntuacionGruero ? 'text-yellow-500' : 'text-gray-300'}`}
                    >
                      ⭐
                    </span>
                  ))}
                  <span className="text-lg font-bold text-yellow-900">
                    {selectedServicio.calificacion.puntuacionGruero}/5
                  </span>
                </div>
                {selectedServicio.calificacion.comentarioGruero && (
                  <div className="mt-3">
                    <p className="text-xs text-yellow-700 mb-1">Comentario:</p>
                    <p className="text-sm text-yellow-900 italic">
                      "{selectedServicio.calificacion.comentarioGruero}"
                    </p>
                  </div>
                )}
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

      {/* Modal de Imagen */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img src={selectedImage} alt="Documento" className="max-w-full max-h-full rounded-lg" />
        </div>
      )}

      {/* Modal de Rechazo */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rechazar Documento</h3>
            <p className="text-sm text-gray-600 mb-4">{documentoRechazar}</p>
            <textarea
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
              placeholder="Ingresa el motivo del rechazo..."
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setDocumentoRechazar('');
                  setMotivoRechazo('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleRechazarDocumento}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? 'Procesando...' : 'Rechazar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}