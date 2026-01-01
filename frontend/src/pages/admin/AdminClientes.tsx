import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Cliente {
  id: string;
  userId: string;
  cuentaSuspendida: boolean;
  motivoSuspension?: string;
  user: {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    telefono: string;
    rut?: string;
    createdAt: string;
  };
  servicios: Array<{
    id: string;
    status: string;
    totalCliente: number;
    solicitadoAt: string;
  }>;
  totalServicios: number;
  totalGastado: number;
}

export default function AdminClientes() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/admin/clientes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setClientes(response.data.data);
      }
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      toast.error('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const filteredClientes = clientes.filter(cliente => {
    const searchLower = searchTerm.toLowerCase();
    return (
      cliente.user.nombre.toLowerCase().includes(searchLower) ||
      cliente.user.apellido.toLowerCase().includes(searchLower) ||
      cliente.user.email.toLowerCase().includes(searchLower) ||
      cliente.user.telefono.includes(searchTerm)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">Visualiza todos los clientes de la plataforma</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-600">Total Clientes</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{clientes.length}</p>
            </div>
            <div className="text-2xl md:text-3xl">👥</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-600">Clientes Activos</p>
              <p className="text-xl md:text-2xl font-bold text-green-600">
                {clientes.filter(c => !c.cuentaSuspendida).length}
              </p>
            </div>
            <div className="text-2xl md:text-3xl">✅</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-600">Servicios Totales</p>
              <p className="text-xl md:text-2xl font-bold text-blue-600">
                {clientes.reduce((sum, c) => sum + c.totalServicios, 0)}
              </p>
            </div>
            <div className="text-2xl md:text-3xl">📊</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-600">Ingresos Totales</p>
              <p className="text-lg md:text-2xl font-bold text-purple-600">
                ${clientes.reduce((sum, c) => sum + c.totalGastado, 0).toLocaleString('es-CL')}
              </p>
            </div>
            <div className="text-2xl md:text-3xl">💰</div>
          </div>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, email o teléfono..."
            className="w-full pl-10 pr-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
          />
          <svg
            className="absolute left-3 top-2.5 md:top-3 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Tabla Desktop */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registro
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Servicios
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Gastado
                </th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último Servicio
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClientes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados'}
                  </td>
                </tr>
              ) : (
                filteredClientes.map((cliente) => (
                  <tr 
                    key={cliente.id} 
                    onClick={() => navigate(`/admin/clientes/${cliente.id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition"
                  >
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-semibold text-sm">
                            {cliente.user.nombre[0]}{cliente.user.apellido[0]}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {cliente.user.nombre} {cliente.user.apellido}
                          </div>
                          {cliente.user.rut && (
                            <div className="text-xs text-gray-500">RUT: {cliente.user.rut}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{cliente.user.email}</div>
                      <div className="text-xs text-gray-500">{cliente.user.telefono}</div>
                    </td>
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                      {cliente.cuentaSuspendida ? (
                        <div className="flex flex-col">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 text-center">
                            SUSPENDIDO
                          </span>
                          {cliente.motivoSuspension && (
                            <span className="text-xs text-gray-500 mt-1" title={cliente.motivoSuspension}>
                              {cliente.motivoSuspension.length > 20 
                                ? cliente.motivoSuspension.substring(0, 20) + '...' 
                                : cliente.motivoSuspension}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          ACTIVO
                        </span>
                      )}
                    </td>
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(cliente.user.createdAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.floor(
                          (new Date().getTime() - new Date(cliente.user.createdAt).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{' '}
                        días
                      </div>
                    </td>
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {cliente.totalServicios}
                        </div>
                        {cliente.totalServicios > 0 && (
                          <span className="ml-2 text-xs text-gray-500">
                            ({cliente.servicios.filter(s => s.status === 'COMPLETADO').length}{' '}
                            completados)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${cliente.totalGastado.toLocaleString('es-CL')}
                      </div>
                      {cliente.totalServicios > 0 && (
                        <div className="text-xs text-gray-500">
                          Promedio: $
                          {Math.round(cliente.totalGastado / cliente.totalServicios).toLocaleString(
                            'es-CL'
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                      {cliente.servicios.length > 0 ? (
                        <div className="text-sm text-gray-900">
                          {formatDate(cliente.servicios[0].solicitadoAt)}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Sin servicios</span>
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
        {filteredClientes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
            {searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados'}
          </div>
        ) : (
          filteredClientes.map((cliente) => (
            <div
              key={cliente.id}
              onClick={() => navigate(`/admin/clientes/${cliente.id}`)}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 active:bg-gray-50 transition"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center flex-1">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold">
                      {cliente.user.nombre[0]}{cliente.user.apellido[0]}
                    </span>
                  </div>
                  <div className="ml-3 overflow-hidden">
                    <p className="font-semibold text-gray-900 truncate">
                      {cliente.user.nombre} {cliente.user.apellido}
                    </p>
                    {cliente.user.rut && (
                      <p className="text-xs text-gray-500">RUT: {cliente.user.rut}</p>
                    )}
                  </div>
                </div>
                {cliente.cuentaSuspendida ? (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 flex-shrink-0">
                    SUSPENDIDO
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex-shrink-0">
                    ACTIVO
                  </span>
                )}
              </div>

              {/* Contacto */}
              <div className="bg-gray-50 rounded-lg p-3 mb-3 text-sm">
                <p className="text-gray-900 truncate">{cliente.user.email}</p>
                <p className="text-gray-600 mt-1">{cliente.user.telefono}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-3 pb-3 border-b border-gray-100">
                <div>
                  <p className="text-xs text-gray-500">Servicios</p>
                  <p className="text-base font-semibold text-gray-900">{cliente.totalServicios}</p>
                  {cliente.totalServicios > 0 && (
                    <p className="text-xs text-gray-400">
                      {cliente.servicios.filter(s => s.status === 'COMPLETADO').length} OK
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Gastado</p>
                  <p className="text-base font-semibold text-purple-600">
                    ${(cliente.totalGastado / 1000).toFixed(0)}k
                  </p>
                  {cliente.totalServicios > 0 && (
                    <p className="text-xs text-gray-400">
                      ~${Math.round(cliente.totalGastado / cliente.totalServicios / 1000)}k/serv
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Registro</p>
                  <p className="text-xs font-medium text-gray-900">
                    {formatDate(cliente.user.createdAt)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {Math.floor(
                      (new Date().getTime() - new Date(cliente.user.createdAt).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )} días
                  </p>
                </div>
              </div>

              {/* Último Servicio */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Último servicio:</span>
                {cliente.servicios.length > 0 ? (
                  <span className="font-medium text-gray-900">
                    {formatDate(cliente.servicios[0].solicitadoAt)}
                  </span>
                ) : (
                  <span className="text-gray-400">Sin servicios</span>
                )}
              </div>

              {/* Ver Detalle Indicator */}
              <div className="mt-3 pt-3 border-t border-gray-100 text-center">
                <span className="text-xs text-blue-600 font-medium">
                  Toca para ver detalle completo →
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}