import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface Estadisticas {
  usuarios: {
    totalClientes: number;
    totalGrueros: number;
    gruerosPendientes: number;
    gruerosActivos: number;
  };
  servicios: {
    total: number;
    hoy: number;
    completados: number;
    enCurso: number;
  };
  ingresos: {
    comisionTotal: number;
    facturacionTotal: number;
  };
}

interface Alertas {
  data: Array<{
    gruero: {
      id: string;
      nombre: string;
      email: string;
      telefono: string;
      patente: string;
      cuentaSuspendida: boolean;
    };
    documentos: Array<{
      tipo: string;
      nombre: string;
      vencimiento: string;
      diasRestantes: number;
      estado: 'vencido' | 'critico' | 'proximo';
    }>;
  }>;
  resumen: {
    total: number;
    vencidos: number;
    criticos: number;
    proximos: number;
  };
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [alertas, setAlertas] = useState<Alertas | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEstadisticas();
  }, []);

  const fetchEstadisticas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');

      // Cargar estadísticas y alertas en paralelo
      const [estadisticasRes, alertasRes] = await Promise.all([
        axios.get(`${API_URL}/admin/estadisticas`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/admin/grueros/documentos-por-vencer`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (estadisticasRes.data.success) {
        setEstadisticas(estadisticasRes.data.data);
      }

      if (alertasRes.data.success) {
        setAlertas(alertasRes.data);
      }
    } catch (error: any) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'vencido':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'critico':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'proximo':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEstadoTexto = (diasRestantes: number) => {
    if (diasRestantes < 0) {
      return `Vencido hace ${Math.abs(diasRestantes)} días`;
    } else if (diasRestantes === 0) {
      return 'Vence hoy';
    } else if (diasRestantes === 1) {
      return 'Vence mañana';
    } else {
      return `Vence en ${diasRestantes} días`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (!estadisticas) return null;

  const stats = [
    {
      title: 'Total Clientes',
      value: estadisticas.usuarios.totalClientes,
      icon: '👥',
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Total Grueros',
      value: estadisticas.usuarios.totalGrueros,
      icon: '🚛',
      color: 'bg-green-500',
      change: '+8%',
    },
    {
      title: 'Grueros Activos',
      value: estadisticas.usuarios.gruerosActivos,
      icon: '✅',
      color: 'bg-emerald-500',
      change: `${estadisticas.usuarios.totalGrueros > 0 ? Math.round((estadisticas.usuarios.gruerosActivos / estadisticas.usuarios.totalGrueros) * 100) : 0}%`,
    },
    {
      title: 'Grueros Pendientes',
      value: estadisticas.usuarios.gruerosPendientes,
      icon: '⏳',
      color: 'bg-yellow-500',
      change: estadisticas.usuarios.gruerosPendientes > 0 ? 'Requiere atención' : 'Al día',
    },
  ];

  const servicioStats = [
    {
      title: 'Total Servicios',
      value: estadisticas.servicios.total,
      icon: '📋',
      color: 'bg-purple-500',
    },
    {
      title: 'Servicios Hoy',
      value: estadisticas.servicios.hoy,
      icon: '🔥',
      color: 'bg-orange-500',
    },
    {
      title: 'Completados',
      value: estadisticas.servicios.completados,
      icon: '✨',
      color: 'bg-green-500',
    },
    {
      title: 'En Curso',
      value: estadisticas.servicios.enCurso,
      icon: '🚀',
      color: 'bg-blue-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Resumen general de la plataforma</p>
      </div>

      {/* Alertas de Vencimientos */}
      {alertas && alertas.resumen.total > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">⚠️ Alertas de Vencimientos</h2>
            <div className="flex items-center space-x-2">
              {alertas.resumen.vencidos > 0 && (
                <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">
                  {alertas.resumen.vencidos} vencidos
                </span>
              )}
              {alertas.resumen.criticos > 0 && (
                <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-3 py-1 rounded-full">
                  {alertas.resumen.criticos} críticos
                </span>
              )}
              {alertas.resumen.proximos > 0 && (
                <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
                  {alertas.resumen.proximos} próximos
                </span>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Gruero
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Documentos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {alertas.data.map((alerta, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {alerta.gruero.nombre}
                          </div>
                          <div className="text-sm text-gray-500">{alerta.gruero.patente}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {alerta.documentos.map((doc, idx) => (
                            <div key={idx} className="text-sm">
                              <span className="font-medium text-gray-700">{doc.nombre}</span>
                              <span className="text-gray-500 ml-2">
                                {getEstadoTexto(doc.diasRestantes)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {alerta.documentos.map((doc, idx) => (
                            <span
                              key={idx}
                              className={`inline-block px-2 py-1 text-xs font-semibold rounded-full border ${getEstadoColor(doc.estado)}`}
                            >
                              {doc.estado === 'vencido' ? '🔴 Vencido' : doc.estado === 'critico' ? '🟠 Crítico' : '🟡 Próximo'}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => navigate(`/admin/grueros/${alerta.gruero.id}`)}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          Ver Detalle →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas de Usuarios */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">👥 Usuarios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-2xl`}>
                  {stat.icon}
                </div>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-600">{stat.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Estadísticas de Servicios */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Servicios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {servicioStats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-2xl`}>
                  {stat.icon}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-600">{stat.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Estadísticas de Ingresos */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">💰 Ingresos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-2xl">
                💵
              </div>
            </div>
            <h3 className="text-3xl font-bold mb-1">
              ${estadisticas.ingresos.comisionTotal.toLocaleString('es-CL')}
            </h3>
            <p className="text-blue-100">Comisión Total Plataforma</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-2xl">
                💸
              </div>
            </div>
            <h3 className="text-3xl font-bold mb-1">
              ${estadisticas.ingresos.facturacionTotal.toLocaleString('es-CL')}
            </h3>
            <p className="text-green-100">Facturación Total</p>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">⚡ Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/admin/grueros')}
            className="bg-white border-2 border-yellow-500 hover:bg-yellow-50 rounded-xl p-6 text-left transition group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition">
                ⏳
              </div>
              {estadisticas.usuarios.gruerosPendientes > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {estadisticas.usuarios.gruerosPendientes}
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Revisar Grueros Pendientes
            </h3>
            <p className="text-sm text-gray-600">
              {estadisticas.usuarios.gruerosPendientes} grueros esperando aprobación
            </p>
          </button>

          <button
            onClick={() => navigate('/admin/servicios')}
            className="bg-white border-2 border-blue-500 hover:bg-blue-50 rounded-xl p-6 text-left transition group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition">
                🚀
              </div>
              {estadisticas.servicios.enCurso > 0 && (
                <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {estadisticas.servicios.enCurso}
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Ver Servicios Activos
            </h3>
            <p className="text-sm text-gray-600">
              {estadisticas.servicios.enCurso} servicios en curso ahora
            </p>
          </button>

          <button
            onClick={() => navigate('/admin/clientes')}
            className="bg-white border-2 border-green-500 hover:bg-green-50 rounded-xl p-6 text-left transition group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition">
                👥
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Gestionar Clientes
            </h3>
            <p className="text-sm text-gray-600">
              {estadisticas.usuarios.totalClientes} clientes registrados
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}