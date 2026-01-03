import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface Gruero {
  id: string;
  userId: string;
  patente: string;
  marca: string;
  modelo: string;
  anio: number;
  tipoGrua: string;
  capacidadToneladas: number;
  estadoVerificacion: string;
  verificado: boolean;
  cuentaSuspendida: boolean;
  motivoRechazo?: string;
  motivoSuspension?: string;
  totalServicios: number;
  calificacionPromedio: number;
  status: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    telefono: string;
    rut?: string;
  };
}

export default function AdminGrueros() {
  const navigate = useNavigate();
  const [grueros, setGrueros] = useState<Gruero[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'TODOS' | 'PENDIENTE' | 'APROBADO' | 'RECHAZADO'>('PENDIENTE');
  const [selectedGruero, setSelectedGruero] = useState<Gruero | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [motivoSuspension, setMotivoSuspension] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchGrueros();
  }, [filter]);

  const fetchGrueros = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      let url = `${API_URL}/admin/grueros`;
      if (filter !== 'TODOS') {
        url += `?estado=${filter}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setGrueros(response.data.data);
      }
    } catch (error) {
      console.error('Error al cargar grueros:', error);
      toast.error('Error al cargar grueros');
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async (id: string) => {
    if (!confirm('¿Estás seguro de aprobar este gruero?')) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.patch(
        `${API_URL}/admin/grueros/${id}/aprobar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Gruero aprobado exitosamente');
        fetchGrueros();
      }
    } catch (error: any) {
      console.error('Error al aprobar:', error);
      toast.error(error.response?.data?.message || 'Error al aprobar gruero');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRechazar = async (id: string) => {
    if (!motivoRechazo.trim()) {
      toast.error('Debes ingresar un motivo de rechazo');
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.patch(
        `${API_URL}/admin/grueros/${id}/rechazar`,
        { motivo: motivoRechazo },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Gruero rechazado');
        setShowModal(false);
        setMotivoRechazo('');
        setSelectedGruero(null);
        fetchGrueros();
      }
    } catch (error: any) {
      console.error('Error al rechazar:', error);
      toast.error(error.response?.data?.message || 'Error al rechazar gruero');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspender = async (id: string) => {
    if (!motivoSuspension.trim()) {
      toast.error('Debes ingresar un motivo de suspensión');
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.patch(
        `${API_URL}/admin/grueros/${id}/suspender`,
        { motivo: motivoSuspension },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Gruero suspendido');
        setShowModal(false);
        setMotivoSuspension('');
        setSelectedGruero(null);
        fetchGrueros();
      }
    } catch (error: any) {
      console.error('Error al suspender:', error);
      toast.error(error.response?.data?.message || 'Error al suspender gruero');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivar = async (id: string) => {
    if (!confirm('¿Estás seguro de reactivar este gruero?')) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.patch(
        `${API_URL}/admin/grueros/${id}/reactivar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Gruero reactivado');
        fetchGrueros();
      }
    } catch (error: any) {
      console.error('Error al reactivar:', error);
      toast.error(error.response?.data?.message || 'Error al reactivar gruero');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEliminar = async (id: string) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.delete(
        `${API_URL}/admin/grueros/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Cuenta de gruero eliminada permanentemente');
        setShowDeleteModal(false);
        setSelectedGruero(null);
        fetchGrueros();
      }
    } catch (error: any) {
      console.error('Error al eliminar:', error);
      if (error.response?.data?.serviciosActivos) {
        toast.error(`No se puede eliminar: tiene ${error.response.data.serviciosActivos} servicios activos`);
      } else {
        toast.error(error.response?.data?.message || 'Error al eliminar gruero');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const badges = {
      PENDIENTE: 'bg-yellow-100 text-yellow-800',
      APROBADO: 'bg-green-100 text-green-800',
      RECHAZADO: 'bg-red-100 text-red-800',
    };
    return badges[estado as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      DISPONIBLE: 'bg-green-100 text-green-800',
      OCUPADO: 'bg-blue-100 text-blue-800',
      OFFLINE: 'bg-gray-100 text-gray-800',
      SUSPENDIDO: 'bg-red-100 text-red-800',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando grueros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Gestión de Grueros</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">Aprobar, rechazar o suspender grueros</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
        <div className="space-y-2 md:space-y-0 md:flex md:items-center md:space-x-4">
          <span className="text-xs md:text-sm font-medium text-gray-700">Filtrar por estado:</span>
          <div className="flex flex-wrap gap-2">
            {['TODOS', 'PENDIENTE', 'APROBADO', 'RECHAZADO'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
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
                  Gruero
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehículo
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Servicios
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-4 xl:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {grueros.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No hay grueros en esta categoría
                  </td>
                </tr>
              ) : (
                grueros.map((gruero) => (
                  <tr key={gruero.id} className="hover:bg-gray-50">
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-semibold text-sm">
                            {gruero.user.nombre[0]}{gruero.user.apellido[0]}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {gruero.user.nombre} {gruero.user.apellido}
                          </div>
                          <div className="text-xs text-gray-500">{gruero.user.email}</div>
                          <div className="text-xs text-gray-400">{gruero.user.telefono}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {gruero.marca} {gruero.modelo}
                      </div>
                      <div className="text-xs text-gray-500">Patente: {gruero.patente}</div>
                      <div className="text-xs text-gray-400">
                        {gruero.tipoGrua} - {gruero.capacidadToneladas}T
                      </div>
                    </td>
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoBadge(gruero.estadoVerificacion)}`}>
                        {gruero.estadoVerificacion}
                      </span>
                      {gruero.cuentaSuspendida && (
                        <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          SUSPENDIDO
                        </span>
                      )}
                    </td>
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(gruero.status)}`}>
                        {gruero.status}
                      </span>
                    </td>
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {gruero.totalServicios}
                    </td>
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-yellow-500 mr-1">⭐</span>
                        <span className="text-sm font-medium text-gray-900">
                          {gruero.calificacionPromedio.toFixed(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/grueros/${gruero.id}`);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver detalle"
                        >
                          👁️
                        </button>

                        {gruero.estadoVerificacion === 'PENDIENTE' && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAprobar(gruero.id);
                              }}
                              disabled={actionLoading}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                              title="Aprobar"
                            >
                              ✅
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedGruero(gruero);
                                setShowModal(true);
                              }}
                              disabled={actionLoading}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              title="Rechazar"
                            >
                              ❌
                            </button>
                          </>
                        )}
                        {gruero.estadoVerificacion === 'APROBADO' && !gruero.cuentaSuspendida && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedGruero(gruero);
                              setShowModal(true);
                            }}
                            disabled={actionLoading}
                            className="text-orange-600 hover:text-orange-900 disabled:opacity-50"
                            title="Suspender"
                          >
                            🚫
                          </button>
                        )}
                        {gruero.cuentaSuspendida && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReactivar(gruero.id);
                            }}
                            disabled={actionLoading}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                            title="Reactivar"
                          >
                            🔄
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedGruero(gruero);
                            setShowDeleteModal(true);
                          }}
                          disabled={actionLoading}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          title="Eliminar Cuenta"
                        >
                          🗑️
                        </button>
                      </div>
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
        {grueros.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
            No hay grueros en esta categoría
          </div>
        ) : (
          grueros.map((gruero) => (
            <div key={gruero.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              {/* Header Card */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center flex-1">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold">
                      {gruero.user.nombre[0]}{gruero.user.apellido[0]}
                    </span>
                  </div>
                  <div className="ml-3 overflow-hidden">
                    <p className="font-semibold text-gray-900 truncate">
                      {gruero.user.nombre} {gruero.user.apellido}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{gruero.user.email}</p>
                    <p className="text-xs text-gray-400">{gruero.user.telefono}</p>
                  </div>
                </div>
              </div>

              {/* Info Vehículo */}
              <div className="bg-gray-50 rounded-lg p-3 mb-3 text-sm">
                <p className="font-medium text-gray-900">{gruero.marca} {gruero.modelo} ({gruero.anio})</p>
                <p className="text-xs text-gray-600">Patente: {gruero.patente}</p>
                <p className="text-xs text-gray-500">{gruero.tipoGrua} - {gruero.capacidadToneladas}T</p>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getEstadoBadge(gruero.estadoVerificacion)}`}>
                  {gruero.estadoVerificacion}
                </span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(gruero.status)}`}>
                  {gruero.status}
                </span>
                {gruero.cuentaSuspendida && (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    SUSPENDIDO
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm mb-3">
                <div>
                  <span className="text-gray-500">Servicios:</span>
                  <span className="font-medium text-gray-900 ml-1">{gruero.totalServicios}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-yellow-500 mr-1">⭐</span>
                  <span className="font-medium text-gray-900">
                    {gruero.calificacionPromedio.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => navigate(`/admin/grueros/${gruero.id}`)}
                  className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 rounded-lg text-sm font-medium transition"
                >
                  👁️ Ver Detalle
                </button>

                {gruero.estadoVerificacion === 'PENDIENTE' && (
                  <>
                    <button
                      onClick={() => handleAprobar(gruero.id)}
                      disabled={actionLoading}
                      className="bg-green-50 text-green-600 hover:bg-green-100 px-3 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                    >
                      ✅
                    </button>
                    <button
                      onClick={() => {
                        setSelectedGruero(gruero);
                        setShowModal(true);
                      }}
                      disabled={actionLoading}
                      className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                    >
                      ❌
                    </button>
                  </>
                )}
                {gruero.estadoVerificacion === 'APROBADO' && !gruero.cuentaSuspendida && (
                  <button
                    onClick={() => {
                      setSelectedGruero(gruero);
                      setShowModal(true);
                    }}
                    disabled={actionLoading}
                    className="bg-orange-50 text-orange-600 hover:bg-orange-100 px-3 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                  >
                    🚫
                  </button>
                )}
                {gruero.cuentaSuspendida && (
                  <button
                    onClick={() => handleReactivar(gruero.id)}
                    disabled={actionLoading}
                    className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                  >
                    🔄
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedGruero(gruero);
                    setShowDeleteModal(true);
                  }}
                  disabled={actionLoading}
                  className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Rechazar/Suspender */}
      {showModal && selectedGruero && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">
              {selectedGruero.estadoVerificacion === 'PENDIENTE' ? 'Rechazar Gruero' : 'Suspender Gruero'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {selectedGruero.user.nombre} {selectedGruero.user.apellido}
            </p>
            <textarea
              value={selectedGruero.estadoVerificacion === 'PENDIENTE' ? motivoRechazo : motivoSuspension}
              onChange={(e) => 
                selectedGruero.estadoVerificacion === 'PENDIENTE' 
                  ? setMotivoRechazo(e.target.value)
                  : setMotivoSuspension(e.target.value)
              }
              placeholder="Ingresa el motivo..."
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              rows={4}
            />
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setMotivoRechazo('');
                  setMotivoSuspension('');
                  setSelectedGruero(null);
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => 
                  selectedGruero.estadoVerificacion === 'PENDIENTE'
                    ? handleRechazar(selectedGruero.id)
                    : handleSuspender(selectedGruero.id)
                }
                disabled={actionLoading}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
              >
                {actionLoading ? 'Procesando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar Cuenta */}
      {showDeleteModal && selectedGruero && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 md:p-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">⚠️</span>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                ¿Eliminar cuenta permanentemente?
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {selectedGruero.user.nombre} {selectedGruero.user.apellido}
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-left">
                <p className="text-sm text-red-800 font-semibold mb-2">
                  ⚠️ Esta acción NO se puede deshacer
                </p>
                <ul className="text-xs text-red-700 space-y-1">
                  <li>✗ Se eliminará el usuario y toda su información</li>
                  <li>✗ Se eliminarán todos sus servicios históricos</li>
                  <li>✗ Se eliminarán todas sus calificaciones</li>
                  <li>✗ No podrá recuperarse la cuenta</li>
                </ul>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedGruero(null);
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleEliminar(selectedGruero.id)}
                disabled={actionLoading}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
              >
                {actionLoading ? 'Eliminando...' : 'Sí, Eliminar Permanentemente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}