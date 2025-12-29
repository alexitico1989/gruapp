import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Reclamo {
  id: string;
  tipo: string;
  descripcion: string;
  estado: string;
  prioridad: string;
  reportadoPor: string;
  resolucion: string | null;
  resueltoAt: string | null;
  createdAt: string;
  servicio: {
    id: string;
    origenDireccion: string;
    destinoDireccion: string;
    tipoVehiculo: string;
    status: string;
    cliente: {
      user: {
        nombre: string;
        apellido: string;
      };
    };
    gruero: {
      user: {
        nombre: string;
        apellido: string;
      };
      patente: string;
    } | null;
  };
}

export default function MisReclamos() {
  const navigate = useNavigate();
  const [reclamos, setReclamos] = useState<Reclamo[]>([]);
  const [loading, setLoading] = useState(true);
  const [reclamoSeleccionado, setReclamoSeleccionado] = useState<Reclamo | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchReclamos();
  }, []);

  const fetchReclamos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/reclamos/mis-reclamos`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setReclamos(response.data.data);
      }
    } catch (error) {
      console.error('Error al cargar reclamos:', error);
      toast.error('Error al cargar reclamos');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const badges = {
      PENDIENTE: 'bg-yellow-100 text-yellow-800',
      EN_REVISION: 'bg-blue-100 text-blue-800',
      RESUELTO: 'bg-green-100 text-green-800',
      RECHAZADO: 'bg-red-100 text-red-800',
    };
    return badges[estado as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getPrioridadBadge = (prioridad: string) => {
    const badges = {
      BAJA: 'bg-gray-100 text-gray-800',
      MEDIA: 'bg-yellow-100 text-yellow-800',
      ALTA: 'bg-red-100 text-red-800',
    };
    return badges[prioridad as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getTipoLabel = (tipo: string) => {
    const tipos = {
      PROBLEMA_SERVICIO: 'Problema de Servicio',
      PROBLEMA_PAGO: 'Problema de Pago',
      MALTRATO: 'Maltrato',
      OTRO: 'Otro',
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM, yyyy 'a las' HH:mm", { locale: es });
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1e3a5f] mb-2">Mis Reclamos</h1>
          <p className="text-gray-600">Gestiona tus reclamos y reportes</p>
        </div>

        {/* Lista de Reclamos */}
        {reclamos.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
            <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No tienes reclamos</h3>
            <p className="text-gray-500 mb-6">Cuando crees un reclamo, aparecerá aquí</p>
            <button
              onClick={() => navigate('/cliente/servicios')}
              className="bg-[#ff7a3d] text-white px-6 py-3 rounded-lg hover:bg-[#ff8c52] transition-all font-semibold"
            >
              Ver Mis Servicios
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reclamos.map((reclamo) => (
              <div
                key={reclamo.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-100 overflow-hidden"
              >
                {/* Header de la Card */}
                <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-bold text-lg">Reclamo</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoBadge(reclamo.estado)}`}>
                      {reclamo.estado.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-white text-sm opacity-90">
                    {format(new Date(reclamo.createdAt), "dd 'de' MMMM, yyyy", { locale: es })}
                  </p>
                </div>

                {/* Contenido */}
                <div className="p-4 space-y-3">
                  {/* Tipo */}
                  <div>
                    <p className="text-xs text-gray-500">Tipo</p>
                    <p className="text-sm font-medium text-gray-900">{getTipoLabel(reclamo.tipo)}</p>
                  </div>

                  {/* Prioridad */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Prioridad</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getPrioridadBadge(reclamo.prioridad)}`}>
                      {reclamo.prioridad}
                    </span>
                  </div>

                  {/* Descripción */}
                  <div>
                    <p className="text-xs text-gray-500">Descripción</p>
                    <p className="text-sm text-gray-700 line-clamp-2">{reclamo.descripcion}</p>
                  </div>

                  {/* Servicio */}
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Servicio</p>
                    <p className="text-xs text-gray-600 truncate">{reclamo.servicio.origenDireccion}</p>
                    <p className="text-xs text-gray-600 truncate">→ {reclamo.servicio.destinoDireccion}</p>
                  </div>

                  {/* Resolución */}
                  {reclamo.resolucion && (
                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-1 mb-1">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <p className="text-xs text-green-700 font-medium">Resolución:</p>
                      </div>
                      <p className="text-xs text-gray-700 line-clamp-2">{reclamo.resolucion}</p>
                    </div>
                  )}

                  {/* Botón Ver Detalles */}
                  <button
                    className="w-full bg-[#1e3a5f] text-white py-2 rounded-lg hover:bg-[#2d4a6f] transition-colors text-sm font-semibold flex items-center justify-center"
                    onClick={() => {
                      setReclamoSeleccionado(reclamo);
                      setShowModal(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalles
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalle */}
      {showModal && reclamoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#1e3a5f]">Detalle del Reclamo</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Estado */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">Estado</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getEstadoBadge(reclamoSeleccionado.estado)}`}>
                    {reclamoSeleccionado.estado.replace('_', ' ')}
                  </span>
                </div>

                {/* Tipo y Prioridad */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Tipo de Reclamo</p>
                    <p className="font-medium text-gray-900">{getTipoLabel(reclamoSeleccionado.tipo)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Prioridad</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getPrioridadBadge(reclamoSeleccionado.prioridad)}`}>
                      {reclamoSeleccionado.prioridad}
                    </span>
                  </div>
                </div>

                {/* Fecha */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">Fecha de Creación</p>
                  <p className="font-medium text-gray-900">{formatDate(reclamoSeleccionado.createdAt)}</p>
                </div>

                {/* Descripción */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">Descripción</p>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-900 whitespace-pre-wrap">{reclamoSeleccionado.descripcion}</p>
                  </div>
                </div>

                {/* Servicio */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">Servicio Relacionado</p>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-200">
                    <p className="text-sm">
                      <span className="font-medium">Origen:</span> {reclamoSeleccionado.servicio.origenDireccion}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Destino:</span> {reclamoSeleccionado.servicio.destinoDireccion}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Tipo de Vehículo:</span> {reclamoSeleccionado.servicio.tipoVehiculo}
                    </p>
                  </div>
                </div>

                {/* Resolución */}
                {reclamoSeleccionado.resolucion && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Resolución</p>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <p className="font-medium text-green-800">Reclamo Resuelto</p>
                      </div>
                      <p className="text-gray-900 whitespace-pre-wrap">{reclamoSeleccionado.resolucion}</p>
                      {reclamoSeleccionado.resueltoAt && (
                        <p className="text-xs text-gray-500 mt-2">
                          Resuelto el {formatDate(reclamoSeleccionado.resueltoAt)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Estado del reclamo */}
                {reclamoSeleccionado.estado === 'PENDIENTE' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <p className="text-sm text-yellow-800 font-medium">
                        Tu reclamo está pendiente de revisión
                      </p>
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">
                      Te notificaremos cuando haya novedades.
                    </p>
                  </div>
                )}

                {reclamoSeleccionado.estado === 'EN_REVISION' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-5 w-5 text-blue-600" />
                      <p className="text-sm text-blue-800 font-medium">
                        Reclamo en revisión
                      </p>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">
                      Nuestro equipo está revisando tu reclamo. Te responderemos pronto.
                    </p>
                  </div>
                )}

                {reclamoSeleccionado.estado === 'RECHAZADO' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <p className="text-sm text-red-800 font-medium">
                        Reclamo rechazado
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Botón Cerrar */}
              <div className="mt-6 pt-4 border-t">
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full bg-[#1e3a5f] text-white py-3 rounded-lg hover:bg-[#2d4a6f] transition-colors font-semibold"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}