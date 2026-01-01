import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Reclamo {
  id: string;
  tipo: string;
  descripcion: string;
  estado: string;
  prioridad: string;
  reportadoPor: string;
  reportadorId: string;
  resolucion: string | null;
  resueltoAt: string | null;
  resueltoBy: string | null;
  notasInternas: string | null;
  createdAt: string;
  updatedAt: string;
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
        email: string;
      };
    };
    gruero: {
      user: {
        nombre: string;
        apellido: string;
        email: string;
      };
      patente: string;
    } | null;
  };
}

interface Estadisticas {
  total: number;
  pendientes: number;
  enRevision: number;
  resueltos: number;
  rechazados: number;
}

export default function AdminReclamos() {
  const navigate = useNavigate();
  const [reclamos, setReclamos] = useState<Reclamo[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [filtroPrioridad, setFiltroPrioridad] = useState('TODOS');
  const [reclamoSeleccionado, setReclamoSeleccionado] = useState<Reclamo | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showResolverModal, setShowResolverModal] = useState(false);
  const [showRechazarModal, setShowRechazarModal] = useState(false);
  const [resolucion, setResolucion] = useState('');
  const [motivoRechazo, setMotivoRechazo] = useState('');

  useEffect(() => {
    fetchReclamos();
  }, [filtroEstado, filtroTipo, filtroPrioridad]);

  const fetchReclamos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams();

      if (filtroEstado !== 'TODOS') params.append('estado', filtroEstado);
      if (filtroTipo !== 'TODOS') params.append('tipo', filtroTipo);
      if (filtroPrioridad !== 'TODOS') params.append('prioridad', filtroPrioridad);

      const response = await axios.get(`${API_URL}/admin/reclamos?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setReclamos(response.data.data);
        setEstadisticas(response.data.estadisticas);
      }
    } catch (error) {
      console.error('Error al cargar reclamos:', error);
      toast.error('Error al cargar reclamos');
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstado = async (id: string, nuevoEstado: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.patch(
        `${API_URL}/admin/reclamos/${id}/estado`,
        { estado: nuevoEstado },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Estado actualizado');
        fetchReclamos();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      toast.error('Error al cambiar estado');
    }
  };

  const handleResolver = async () => {
    if (!reclamoSeleccionado || !resolucion.trim()) {
      toast.error('La resolución es requerida');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.patch(
        `${API_URL}/admin/reclamos/${reclamoSeleccionado.id}/resolver`,
        { resolucion },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Reclamo resuelto');
        setShowResolverModal(false);
        setResolucion('');
        fetchReclamos();
      }
    } catch (error) {
      console.error('Error al resolver:', error);
      toast.error('Error al resolver reclamo');
    }
  };

  const handleRechazar = async () => {
    if (!reclamoSeleccionado || !motivoRechazo.trim()) {
      toast.error('El motivo es requerido');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.patch(
        `${API_URL}/admin/reclamos/${reclamoSeleccionado.id}/rechazar`,
        { motivo: motivoRechazo },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Reclamo rechazado');
        setShowRechazarModal(false);
        setMotivoRechazo('');
        fetchReclamos();
      }
    } catch (error) {
      console.error('Error al rechazar:', error);
      toast.error('Error al rechazar reclamo');
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
    return new Date(dateString).toLocaleDateString('es-CL', {
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
          <p className="text-gray-600">Cargando reclamos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reclamos</h1>
          <p className="text-gray-600 mt-1">Gestión de reclamos de la plataforma</p>
        </div>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col items-center">
            <p className="text-sm text-gray-600 font-medium">Total</p>
            <p className="text-2xl font-bold text-gray-900">{estadisticas.total}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow-sm border border-yellow-200 p-4 flex flex-col items-center">
            <p className="text-sm text-yellow-800 font-medium">Pendientes</p>
            <p className="text-2xl font-bold text-yellow-900">{estadisticas.pendientes}</p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-200 p-4 flex flex-col items-center">
            <p className="text-sm text-blue-800 font-medium">En Revisión</p>
            <p className="text-2xl font-bold text-blue-900">{estadisticas.enRevision}</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow-sm border border-green-200 p-4 flex flex-col items-center">
            <p className="text-sm text-green-800 font-medium">Resueltos</p>
            <p className="text-2xl font-bold text-green-900">{estadisticas.resueltos}</p>
          </div>
          <div className="bg-red-50 rounded-lg shadow-sm border border-red-200 p-4 flex flex-col items-center">
            <p className="text-sm text-red-800 font-medium">Rechazados</p>
            <p className="text-2xl font-bold text-red-900">{estadisticas.rechazados}</p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="TODOS">Todos</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="EN_REVISION">En Revisión</option>
              <option value="RESUELTO">Resuelto</option>
              <option value="RECHAZADO">Rechazado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="TODOS">Todos</option>
              <option value="PROBLEMA_SERVICIO">Problema de Servicio</option>
              <option value="PROBLEMA_PAGO">Problema de Pago</option>
              <option value="MALTRATO">Maltrato</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
            <select
              value={filtroPrioridad}
              onChange={(e) => setFiltroPrioridad(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="TODOS">Todas</option>
              <option value="BAJA">Baja</option>
              <option value="MEDIA">Media</option>
              <option value="ALTA">Alta</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Reclamos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reportado Por</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Servicio</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prioridad</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reclamos.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-500 text-sm sm:text-base">
                  No hay reclamos {filtroEstado !== 'TODOS' && `en estado ${filtroEstado.toLowerCase()}`}
                </td>
              </tr>
            ) : (
              reclamos.map((reclamo) => (
                <tr key={reclamo.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatDate(reclamo.createdAt)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{getTipoLabel(reclamo.tipo)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <div>
                      <span className="font-medium text-gray-900">
                        {reclamo.reportadoPor === 'CLIENTE'
                          ? `${reclamo.servicio.cliente.user.nombre} ${reclamo.servicio.cliente.user.apellido}`
                          : reclamo.servicio.gruero
                          ? `${reclamo.servicio.gruero.user.nombre} ${reclamo.servicio.gruero.user.apellido}`
                          : 'N/A'}
                      </span>
                      <p className="text-xs text-gray-500">
                        {reclamo.reportadoPor === 'CLIENTE' ? '👤 Cliente' : '🚛 Gruero'}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 max-w-[150px] truncate">
                    <p className="font-medium truncate">{reclamo.servicio.origenDireccion}</p>
                    <p className="text-xs text-gray-500 truncate">→ {reclamo.servicio.destinoDireccion}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPrioridadBadge(reclamo.prioridad)}`}>
                      {reclamo.prioridad}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getEstadoBadge(reclamo.estado)}`}>
                      {reclamo.estado.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <button
                      onClick={() => {
                        setReclamoSeleccionado(reclamo);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      Ver Detalle
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Aquí se pueden añadir los modales para ver detalle, resolver y rechazar */}
      {/* Modales responsive: tamaño máximo 90vh, scroll si excede pantalla */}
    </div>
  );
}
