import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Navigation, Clock, DollarSign, Eye, Filter, AlertTriangle, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import CrearReclamo from '../../components/CrearReclamo';
import api from '../../lib/api';
import toast from 'react-hot-toast';

interface Servicio {
  id: string;
  origen: string;
  destino: string;
  estado: string;
  precio_total: number;
  distancia_km: number;
  createdAt: string;
  pagado: boolean;
  gruero?: {
    nombre: string;
  };
}

export default function MisServicios() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagandoServicio, setPagandoServicio] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');
  const [showCrearReclamo, setShowCrearReclamo] = useState(false);
  const [servicioIdReclamo, setServicioIdReclamo] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState<Servicio | null>(null);

  // Función helper para formatear fechas de forma segura
  const formatearFecha = (fecha: string | null | undefined, formatoCompleto = false) => {
    if (!fecha) return 'Fecha no disponible';
    try {
      const date = new Date(fecha);
      if (isNaN(date.getTime())) return 'Fecha inválida';
      
      if (formatoCompleto) {
        return format(date, "dd 'de' MMMM, yyyy 'a las' HH:mm", { locale: es });
      }
      return format(date, "dd 'de' MMMM, yyyy", { locale: es });
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return 'Fecha inválida';
    }
  };

  useEffect(() => {
    cargarServicios();
    
    // Verificar si volvemos de Mercado Pago
    const payment = searchParams.get('payment');
    const servicioId = searchParams.get('servicioId');
    
    if (payment && servicioId) {
      if (payment === 'success') {
        toast.success('¡Pago confirmado exitosamente!');
      } else if (payment === 'failure') {
        toast.error('El pago fue rechazado. Intenta nuevamente.');
      } else if (payment === 'pending') {
        toast('Pago pendiente de confirmación', { icon: '⏳' });
      }
      
      // Limpiar parámetros de la URL
      navigate('/cliente/servicios', { replace: true });
    }
  }, [searchParams, navigate]);

  const cargarServicios = async () => {
    try {
      setLoading(true);
      const response = await api.get('/servicios/historial');
      if (response.data.success) {
        // Mapear los datos del backend al formato que espera el frontend
        const serviciosMapeados = response.data.data.map((s: any) => ({
          id: s.id,
          origen: s.origenDireccion || 'Origen no disponible',
          destino: s.destinoDireccion || 'Destino no disponible',
          estado: s.status || 'DESCONOCIDO',
          precio_total: s.totalCliente || 0,
          distancia_km: s.distanciaKm || 0,
          createdAt: s.solicitadoAt || s.createdAt || new Date().toISOString(),
          pagado: s.pagado || false,
          gruero: s.gruero ? {
            nombre: `${s.gruero.user.nombre} ${s.gruero.user.apellido}`
          } : undefined
        }));
        
        setServicios(serviciosMapeados);
      }
    } catch (error: any) {
      console.error('Error al cargar servicios:', error);
      toast.error(error.response?.data?.message || 'Error al cargar servicios');
    } finally {
      setLoading(false);
    }
  };

  const handlePagarServicio = async (servicioId: string) => {
    try {
      setPagandoServicio(servicioId);
      
      const response = await api.post('/pagos/crear-preferencia', {
        servicioId
      });
      
      if (response.data.success) {
        const { sandboxInitPoint } = response.data.data;
        
        // Redirigir a Mercado Pago
        window.location.href = sandboxInitPoint;
      }
    } catch (error: any) {
      console.error('Error al crear preferencia:', error);
      toast.error(error.response?.data?.message || 'Error al procesar el pago');
      setPagandoServicio(null);
    }
  };

  const serviciosFiltrados = filtroEstado === 'TODOS'
    ? servicios
    : servicios.filter((s) => s.estado === filtroEstado);

  const estadoConfig = {
    PENDIENTE: { color: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
    SOLICITADO: { color: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Solicitado' },
    ACEPTADO: { color: 'blue', bg: 'bg-blue-100', text: 'text-blue-800', label: 'Aceptado' },
    EN_CAMINO: { color: 'indigo', bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'En Camino' },
    EN_SITIO: { color: 'purple', bg: 'bg-purple-100', text: 'text-purple-800', label: 'En Sitio' },
    EN_PROCESO: { color: 'purple', bg: 'bg-purple-100', text: 'text-purple-800', label: 'En Proceso' },
    COMPLETADO: { color: 'green', bg: 'bg-green-100', text: 'text-green-800', label: 'Completado' },
    CANCELADO: { color: 'red', bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelado' },
  };

  const getEstadoConfig = (estado: string) => {
    return estadoConfig[estado as keyof typeof estadoConfig] || {
      color: 'gray',
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      label: estado || 'Desconocido'
    };
  };

  const handleVerDetalle = (servicio: Servicio) => {
    setServicioSeleccionado(servicio);
    setShowModal(true);
  };

  const handleReportarProblema = (servicioId: string) => {
    setServicioIdReclamo(servicioId);
    setShowModal(false);
    setShowCrearReclamo(true);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#1e3a5f] mb-2">Mis Servicios</h1>
            <p className="text-gray-600">Historial completo de tus servicios de grúa</p>
          </div>
          <button
            onClick={() => navigate('/cliente/reclamos')}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
          >
            <AlertTriangle className="h-5 w-5" />
            <span>Mis Reclamos</span>
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6 border border-gray-100">
          <div className="flex items-center space-x-2 overflow-x-auto">
            <Filter className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <button
              onClick={() => setFiltroEstado('TODOS')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filtroEstado === 'TODOS'
                  ? 'bg-[#1e3a5f] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos ({servicios.length})
            </button>
            {Object.entries(estadoConfig).map(([key, config]) => {
              const count = servicios.filter((s) => s.estado === key).length;
              if (count === 0) return null;
              return (
                <button
                  key={key}
                  onClick={() => setFiltroEstado(key)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    filtroEstado === key
                      ? `${config.bg} ${config.text}`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {config.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Lista de Servicios */}
        {serviciosFiltrados.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
            <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No hay servicios {filtroEstado !== 'TODOS' ? 'con este estado' : ''}
            </h3>
            <p className="text-gray-500 mb-6">
              {filtroEstado === 'TODOS'
                ? 'Solicita tu primera grúa desde el dashboard'
                : 'Intenta con otro filtro'}
            </p>
            {filtroEstado === 'TODOS' && (
              <button
                onClick={() => navigate('/cliente/dashboard')}
                className="bg-[#ff7a3d] text-white px-6 py-3 rounded-lg hover:bg-[#ff8c52] transition-all font-semibold"
              >
                Solicitar Grúa
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviciosFiltrados.map((servicio) => {
              const estado = getEstadoConfig(servicio.estado);
              const puedeReportarProblema = servicio.estado === 'COMPLETADO' || servicio.estado === 'CANCELADO';
              const puedePagar = servicio.estado === 'COMPLETADO' && !servicio.pagado;
              
              return (
                <div
                  key={servicio.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-100 overflow-hidden"
                >
                  {/* Header de la Card */}
                  <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-bold text-lg">Servicio</span>
                      <div className="flex items-center space-x-2">
                        <span className={`${estado.bg} ${estado.text} px-3 py-1 rounded-full text-xs font-semibold`}>
                          {estado.label}
                        </span>
                        {servicio.pagado && (
                          <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            Pagado
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-white text-sm opacity-90">
                      {formatearFecha(servicio.createdAt)}
                    </p>
                  </div>

                  {/* Contenido */}
                  <div className="p-4 space-y-3">
                    {/* Origen */}
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Origen</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{servicio.origen}</p>
                      </div>
                    </div>

                    {/* Destino */}
                    <div className="flex items-start">
                      <Navigation className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Destino</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{servicio.destino}</p>
                      </div>
                    </div>

                    {/* Info adicional */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span className="text-sm font-semibold">
                          ${(servicio.precio_total || 0).toLocaleString('es-CL')}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {(servicio.distancia_km || 0).toFixed(1)} km
                      </div>
                    </div>

                    {/* Gruero */}
                    {servicio.gruero && (
                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500">Gruero</p>
                        <p className="text-sm font-medium text-gray-900">{servicio.gruero.nombre}</p>
                      </div>
                    )}

                    {/* Botones */}
                    <div className="space-y-2">
                      <button
                        className="w-full bg-[#1e3a5f] text-white py-2 rounded-lg hover:bg-[#2d4a6f] transition-colors text-sm font-semibold flex items-center justify-center"
                        onClick={() => handleVerDetalle(servicio)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalles
                      </button>
                      
                      {/* Botón Pagar (solo si está completado y no pagado) */}
                      {puedePagar && (
                        <button
                          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => handlePagarServicio(servicio.id)}
                          disabled={pagandoServicio === servicio.id}
                        >
                          {pagandoServicio === servicio.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Procesando...
                            </>
                          ) : (
                            <>
                              <CreditCard className="h-4 w-4 mr-2" />
                              Pagar Servicio
                            </>
                          )}
                        </button>
                      )}
                      
                      {/* Botón Reportar Problema */}
                      {puedeReportarProblema && (
                        <button
                          className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm font-semibold flex items-center justify-center"
                          onClick={() => handleReportarProblema(servicio.id)}
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Reportar Problema
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Detalle */}
      {showModal && servicioSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Detalle del Servicio</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="text-sm text-gray-600">Estado</p>
                    {(() => {
                      const estadoModal = getEstadoConfig(servicioSeleccionado.estado);
                      return (
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${estadoModal.bg} ${estadoModal.text}`}>
                          {estadoModal.label}
                        </span>
                      );
                    })()}
                  </div>
                  {servicioSeleccionado.pagado && (
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                      ✓ Pagado
                    </span>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-600">Origen</p>
                  <p className="font-medium">{servicioSeleccionado.origen}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Destino</p>
                  <p className="font-medium">{servicioSeleccionado.destino}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Distancia</p>
                    <p className="font-medium">{(servicioSeleccionado.distancia_km || 0).toFixed(1)} km</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Precio Total</p>
                    <p className="font-medium">${(servicioSeleccionado.precio_total || 0).toLocaleString('es-CL')}</p>
                  </div>
                </div>

                {servicioSeleccionado.gruero && (
                  <div>
                    <p className="text-sm text-gray-600">Gruero</p>
                    <p className="font-medium">{servicioSeleccionado.gruero.nombre}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600">Fecha</p>
                  <p className="font-medium">
                    {formatearFecha(servicioSeleccionado.createdAt, true)}
                  </p>
                </div>
              </div>

              {/* Botones del modal */}
              <div className="flex flex-wrap gap-3 items-center mt-6 pt-4 border-t">
                {/* Botón Pagar */}
                {servicioSeleccionado.estado === 'COMPLETADO' && !servicioSeleccionado.pagado && (
                  <button
                    onClick={() => {
                      setShowModal(false);
                      handlePagarServicio(servicioSeleccionado.id);
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                    disabled={pagandoServicio === servicioSeleccionado.id}
                  >
                    <CreditCard className="h-5 w-5" />
                    <span>Pagar Servicio</span>
                  </button>
                )}
                
                {/* Botón Reportar Problema */}
                {(servicioSeleccionado.estado === 'COMPLETADO' || servicioSeleccionado.estado === 'CANCELADO') && (
                  <button
                    onClick={() => handleReportarProblema(servicioSeleccionado.id)}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center space-x-2"
                  >
                    <AlertTriangle className="h-5 w-5" />
                    <span>Reportar Problema</span>
                  </button>
                )}
                
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 ml-auto"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear Reclamo */}
      {showCrearReclamo && servicioIdReclamo && (
        <CrearReclamo
          servicioId={servicioIdReclamo}
          onClose={() => {
            setShowCrearReclamo(false);
            setServicioIdReclamo(null);
          }}
          onSuccess={() => {
            cargarServicios();
          }}
        />
      )}
    </Layout>
  );
}