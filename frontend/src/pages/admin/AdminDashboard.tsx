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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEstadisticas();
  }, []);

  const fetchEstadisticas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');

      const estadisticasRes = await axios.get(`${API_URL}/admin/estadisticas`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (estadisticasRes.data.success) {
        setEstadisticas(estadisticasRes.data.data);
      }
    } catch (error: any) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar datos del dashboard');
    } finally {
      setLoading(false);
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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">Resumen general de la plataforma</p>
      </div>

      {/* Estadísticas de Usuarios */}
      <div>
        <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">👥 Usuarios</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className={`w-10 h-10 md:w-12 md:h-12 ${stat.color} rounded-lg flex items-center justify-center text-xl md:text-2xl`}>
                  {stat.icon}
                </div>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded hidden sm:block">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                {stat.value.toLocaleString()}
              </h3>
              <p className="text-xs md:text-sm text-gray-600">{stat.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Estadísticas de Servicios */}
      <div>
        <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">📊 Servicios</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {servicioStats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className={`w-10 h-10 md:w-12 md:h-12 ${stat.color} rounded-lg flex items-center justify-center text-xl md:text-2xl`}>
                  {stat.icon}
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                {stat.value.toLocaleString()}
              </h3>
              <p className="text-xs md:text-sm text-gray-600">{stat.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Estadísticas de Ingresos */}
      <div>
        <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">💰 Ingresos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-5 md:p-6 text-white">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-lg flex items-center justify-center text-xl md:text-2xl">
                💵
              </div>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-1">
              ${estadisticas.ingresos.comisionTotal.toLocaleString('es-CL')}
            </h3>
            <p className="text-sm md:text-base text-blue-100">Comisión Total Plataforma</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-5 md:p-6 text-white">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-lg flex items-center justify-center text-xl md:text-2xl">
                💸
              </div>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-1">
              ${estadisticas.ingresos.facturacionTotal.toLocaleString('es-CL')}
            </h3>
            <p className="text-sm md:text-base text-green-100">Facturación Total</p>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div>
        <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">⚡ Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <button
            onClick={() => navigate('/admin/grueros')}
            className="bg-white border-2 border-yellow-500 hover:bg-yellow-50 rounded-xl p-5 md:p-6 text-left transition group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-100 rounded-lg flex items-center justify-center text-xl md:text-2xl group-hover:scale-110 transition">
                ⏳
              </div>
              {estadisticas.usuarios.gruerosPendientes > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {estadisticas.usuarios.gruerosPendientes}
                </span>
              )}
            </div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1">
              Revisar Grueros Pendientes
            </h3>
            <p className="text-xs md:text-sm text-gray-600">
              {estadisticas.usuarios.gruerosPendientes} grueros esperando aprobación
            </p>
          </button>

          <button
            onClick={() => navigate('/admin/servicios')}
            className="bg-white border-2 border-blue-500 hover:bg-blue-50 rounded-xl p-5 md:p-6 text-left transition group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center text-xl md:text-2xl group-hover:scale-110 transition">
                🚀
              </div>
              {estadisticas.servicios.enCurso > 0 && (
                <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {estadisticas.servicios.enCurso}
                </span>
              )}
            </div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1">
              Ver Servicios Activos
            </h3>
            <p className="text-xs md:text-sm text-gray-600">
              {estadisticas.servicios.enCurso} servicios en curso ahora
            </p>
          </button>

          <button
            onClick={() => navigate('/admin/clientes')}
            className="bg-white border-2 border-green-500 hover:bg-green-50 rounded-xl p-5 md:p-6 text-left transition group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center text-xl md:text-2xl group-hover:scale-110 transition">
                👥
              </div>
            </div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1">
              Gestionar Clientes
            </h3>
            <p className="text-xs md:text-sm text-gray-600">
              {estadisticas.usuarios.totalClientes} clientes registrados
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}