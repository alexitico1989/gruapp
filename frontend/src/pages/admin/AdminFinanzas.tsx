import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  exportTransaccionesCSV,
  exportMetricasCSV,
  exportGruerosCSV,
  exportVehiculosCSV,
  exportIngresosDiariosCSV,
  exportReporteCompleto,
} from '../../utils/exportUtils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Metricas {
  ingresosTotal: number;
  facturacionTotal: number;
  pagoGruerosTotal: number;
  ingresosMesActual: number;
  facturacionMesActual: number;
  pagoGruerosMesActual: number;
  ingresosMesAnterior: number;
  cambioMensual: number;
  serviciosCompletadosMes: number;
  serviciosTotalesMes: number;
  tasaConversion: number;
  comisionPromedio: number;
  proyeccionMensual: number;
}

interface IngresoDiario {
  fecha: string;
  comisionPlataforma: number;
  facturacion: number;
  pagoGrueros: number;
  servicios: number;
}

interface FinanzasGruero {
  grueroId: string;
  nombre: string;
  patente: string;
  marca: string;
  modelo: string;
  serviciosCompletados: number;
  totalGanado: number;
  comisionGenerada: number;
  facturacionTotal: number;
  promedioServicio: number;
}

interface FinanzasVehiculo {
  tipoVehiculo: string;
  servicios: number;
  comisionTotal: number;
  facturacionTotal: number;
  pagoGruerosTotal: number;
  comisionPromedio: number;
  facturacionPromedio: number;
}

interface Transaccion {
  id: string;
  tipoVehiculo: string;
  distanciaKm: number;
  totalCliente: number;
  totalGruero: number;
  comisionPlataforma: number;
  comisionMP: number;
  completadoAt: string;
  mpPaymentId: string | null;
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
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function AdminFinanzas() {
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [ingresosDiarios, setIngresosDiarios] = useState<IngresoDiario[]>([]);
  const [finanzasGrueros, setFinanzasGrueros] = useState<FinanzasGruero[]>([]);
  const [finanzasVehiculos, setFinanzasVehiculos] = useState<FinanzasVehiculo[]>([]);
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [diasGrafico, setDiasGrafico] = useState(30);
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, [diasGrafico]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };

      const [metricasRes, ingresosRes, gruerosRes, vehiculosRes, transaccionesRes] =
        await Promise.all([
          axios.get(`${API_URL}/admin/finanzas/metricas`, { headers }),
          axios.get(`${API_URL}/admin/finanzas/ingresos-diarios?dias=${diasGrafico}`, { headers }),
          axios.get(`${API_URL}/admin/finanzas/por-gruero?limit=10`, { headers }),
          axios.get(`${API_URL}/admin/finanzas/por-vehiculo`, { headers }),
          axios.get(`${API_URL}/admin/finanzas/transacciones?limit=20`, { headers }),
        ]);

      if (metricasRes.data.success) setMetricas(metricasRes.data.data);
      if (ingresosRes.data.success) setIngresosDiarios(ingresosRes.data.data);
      if (gruerosRes.data.success) setFinanzasGrueros(gruerosRes.data.data);
      if (vehiculosRes.data.success) setFinanzasVehiculos(vehiculosRes.data.data);
      if (transaccionesRes.data.success) setTransacciones(transaccionesRes.data.data);
    } catch (error) {
      console.error('Error al cargar datos financieros:', error);
      toast.error('Error al cargar datos financieros');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos financieros...</p>
        </div>
      </div>
    );
  }

  if (!metricas) return null;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard Financiero</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Métricas e ingresos de la plataforma</p>
        </div>
        
        {/* Botones de Exportación */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (!metricas) {
                toast.error('No hay datos para exportar');
                return;
              }
              exportReporteCompleto({
                metricas,
                transacciones,
                grueros: finanzasGrueros,
                vehiculos: finanzasVehiculos,
                ingresosDiarios,
              });
              toast.success('Exportando reporte completo...');
            }}
            className="px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center space-x-2 text-sm md:text-base"
          >
            <span>📊</span>
            <span className="hidden sm:inline">Exportar Todo</span>
            <span className="sm:hidden">Exportar</span>
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-3 md:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm md:text-base"
            >
              ⋮ Más
            </button>
            {showExportMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowExportMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                  <button
                    onClick={() => {
                      if (!metricas) return;
                      exportMetricasCSV(metricas);
                      toast.success('Métricas exportadas');
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 rounded-t-lg"
                  >
                    📈 Exportar Métricas
                  </button>
                  <button
                    onClick={() => {
                      if (transacciones.length === 0) {
                        toast.error('No hay transacciones');
                        return;
                      }
                      exportTransaccionesCSV(transacciones);
                      toast.success('Transacciones exportadas');
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                  >
                    💳 Exportar Transacciones
                  </button>
                  <button
                    onClick={() => {
                      if (finanzasGrueros.length === 0) {
                        toast.error('No hay datos de grueros');
                        return;
                      }
                      exportGruerosCSV(finanzasGrueros);
                      toast.success('Top Grueros exportado');
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                  >
                    👥 Exportar Top Grueros
                  </button>
                  <button
                    onClick={() => {
                      if (finanzasVehiculos.length === 0) {
                        toast.error('No hay datos de vehículos');
                        return;
                      }
                      exportVehiculosCSV(finanzasVehiculos);
                      toast.success('Ingresos por Vehículo exportados');
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                  >
                    🚗 Exportar por Vehículo
                  </button>
                  <button
                    onClick={() => {
                      if (ingresosDiarios.length === 0) {
                        toast.error('No hay datos de ingresos diarios');
                        return;
                      }
                      exportIngresosDiariosCSV(ingresosDiarios);
                      toast.success('Ingresos Diarios exportados');
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 rounded-b-lg"
                  >
                    📅 Exportar Ingresos Diarios
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs md:text-sm text-gray-600 font-medium">Ingresos Totales</p>
            <span className="text-xl md:text-2xl">💰</span>
          </div>
          <p className="text-xl md:text-3xl font-bold text-gray-900">
            ${(metricas.ingresosTotal / 1000000).toFixed(1)}M
          </p>
          <p className="text-xs text-gray-500 mt-1">Comisión acumulada</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs md:text-sm text-gray-600 font-medium">Este Mes</p>
            <span className="text-xl md:text-2xl">📈</span>
          </div>
          <p className="text-xl md:text-3xl font-bold text-green-600">
            ${(metricas.ingresosMesActual / 1000).toFixed(0)}k
          </p>
          <div className="flex items-center mt-1">
            <span
              className={`text-xs font-medium ${
                metricas.cambioMensual >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {metricas.cambioMensual >= 0 ? '↑' : '↓'} {Math.abs(metricas.cambioMensual)}%
            </span>
            <span className="text-xs text-gray-500 ml-2 hidden sm:inline">vs mes anterior</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs md:text-sm text-gray-600 font-medium">Servicios</p>
            <span className="text-xl md:text-2xl">✅</span>
          </div>
          <p className="text-xl md:text-3xl font-bold text-blue-600">{metricas.serviciosCompletadosMes}</p>
          <p className="text-xs text-gray-500 mt-1">
            Conversión: {metricas.tasaConversion}%
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs md:text-sm text-gray-600 font-medium">Comisión Prom.</p>
            <span className="text-xl md:text-2xl">💵</span>
          </div>
          <p className="text-xl md:text-3xl font-bold text-purple-600">
            ${(metricas.comisionPromedio / 1000).toFixed(1)}k
          </p>
          <p className="text-xs text-gray-500 mt-1">Por servicio</p>
        </div>
      </div>

      {/* Proyección Mensual */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm text-blue-800 font-medium">Proyección Fin de Mes</p>
            <p className="text-2xl md:text-4xl font-bold text-blue-900 mt-2">
              ${(metricas.proyeccionMensual / 1000).toFixed(0)}k
            </p>
            <p className="text-xs md:text-sm text-blue-700 mt-1">
              Basado en rendimiento actual
            </p>
          </div>
          <span className="text-4xl md:text-6xl">🎯</span>
        </div>
      </div>

      {/* Gráfico de Ingresos Diarios */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900">Ingresos por Día</h2>
          <select
            value={diasGrafico}
            onChange={(e) => setDiasGrafico(parseInt(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 md:px-4 py-2 text-xs md:text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Últimos 7 días</option>
            <option value="30">Últimos 30 días</option>
            <option value="60">Últimos 60 días</option>
            <option value="90">Últimos 90 días</option>
          </select>
        </div>
        <div className="h-[250px] md:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ingresosDiarios}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="fecha"
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
              />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(label) => formatDate(label)}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line
                type="monotone"
                dataKey="comisionPlataforma"
                stroke="#3B82F6"
                name="Comisión"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="facturacion"
                stroke="#10B981"
                name="Facturación"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráficos en Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Top 10 Grueros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Top 10 Grueros</h2>
          <div className="h-[250px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={finanzasGrueros.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="nombre" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  tick={{ fontSize: 9 }}
                />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="comisionGenerada" fill="#3B82F6" name="Comisión Generada" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ingresos por Tipo de Vehículo */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">
            Ingresos por Tipo de Vehículo
          </h2>
          <div className="h-[250px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={finanzasVehiculos.map(f => ({
                    name: f.tipoVehiculo,
                    value: f.comisionTotal,
                  }))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={{ strokeWidth: 1 }}
                  style={{ fontSize: '11px' }}
                >
                  {finanzasVehiculos.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabla de Transacciones Recientes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Transacciones Recientes</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm md:text-base">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="px-2 md:px-4 py-2">Cliente</th>
                <th className="px-2 md:px-4 py-2">Gruero</th>
                <th className="px-2 md:px-4 py-2">Vehículo</th>
                <th className="px-2 md:px-4 py-2">Tipo Vehículo</th>
                <th className="px-2 md:px-4 py-2">Distancia (km)</th>
                <th className="px-2 md:px-4 py-2">Total Cliente</th>
                <th className="px-2 md:px-4 py-2">Total Gruero</th>
                <th className="px-2 md:px-4 py-2">Comisión Plataforma</th>
                <th className="px-2 md:px-4 py-2">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {transacciones.map((t) => (
                <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-2 md:px-4 py-1 md:py-2">
                    {t.cliente.user.nombre} {t.cliente.user.apellido}
                  </td>
                  <td className="px-2 md:px-4 py-1 md:py-2">
                    {t.gruero
                      ? `${t.gruero.user.nombre} ${t.gruero.user.apellido}`
                      : 'N/A'}
                  </td>
                  <td className="px-2 md:px-4 py-1 md:py-2">{t.gruero?.patente || 'N/A'}</td>
                  <td className="px-2 md:px-4 py-1 md:py-2">{t.tipoVehiculo}</td>
                  <td className="px-2 md:px-4 py-1 md:py-2">{t.distanciaKm.toFixed(1)}</td>
                  <td className="px-2 md:px-4 py-1 md:py-2">{formatCurrency(t.totalCliente)}</td>
                  <td className="px-2 md:px-4 py-1 md:py-2">{formatCurrency(t.totalGruero)}</td>
                  <td className="px-2 md:px-4 py-1 md:py-2">{formatCurrency(t.comisionPlataforma)}</td>
                  <td className="px-2 md:px-4 py-1 md:py-2">{formatDate(t.completadoAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
