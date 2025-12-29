import { useEffect, useState } from 'react';
import { Download, CreditCard, TrendingUp, Calendar, MapPin, Navigation } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import ComprobantePago from '../../components/ComprobantePago';
import api from '../../lib/api';
import toast from 'react-hot-toast';

interface Pago {
  id: string;
  totalCliente: number;
  completadoAt: string;
  mpPaymentId: string | null;
  origenDireccion: string;
  destinoDireccion: string;
  gruero: {
    user: {
      nombre: string;
      apellido: string;
    };
  } | null;
}

interface PagosStats {
  totalGastado: number;
  totalPagos: number;
  promedioGasto: number;
}

export default function Pagos() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [stats, setStats] = useState<PagosStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showComprobante, setShowComprobante] = useState(false);
  const [servicioIdComprobante, setServicioIdComprobante] = useState<string | null>(null);

  useEffect(() => {
    cargarPagos();
  }, [page]);

  const cargarPagos = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/cliente/pagos?page=${page}&limit=10`);
      if (response.data.success) {
        setPagos(response.data.data);
        setStats(response.data.stats);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error: any) {
      console.error('Error al cargar pagos:', error);
      toast.error(error.response?.data?.message || 'Error al cargar pagos');
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarComprobante = (pago: Pago) => {
    setServicioIdComprobante(pago.id);
    setShowComprobante(true);
  };

  if (loading && page === 1) {
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
          <h1 className="text-3xl font-bold text-[#1e3a5f] mb-2">Historial de Pagos</h1>
          <p className="text-gray-600">Revisa todos tus pagos y transacciones</p>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <CreditCard className="h-8 w-8 opacity-80" />
                <TrendingUp className="h-5 w-5 opacity-60" />
              </div>
              <p className="text-sm opacity-90 mb-1">Total Gastado</p>
              <p className="text-3xl font-bold">${stats.totalGastado.toLocaleString('es-CL')}</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <Calendar className="h-8 w-8 opacity-80" />
              </div>
              <p className="text-sm opacity-90 mb-1">Total de Pagos</p>
              <p className="text-3xl font-bold">{stats.totalPagos}</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="h-8 w-8 opacity-80" />
              </div>
              <p className="text-sm opacity-90 mb-1">Gasto Promedio</p>
              <p className="text-3xl font-bold">${stats.promedioGasto.toLocaleString('es-CL', { maximumFractionDigits: 0 })}</p>
            </div>
          </div>
        )}

        {/* Lista de Pagos */}
        {pagos.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
            <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay pagos registrados</h3>
            <p className="text-gray-500 mb-6">Tus pagos completados aparecerán aquí</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pagos.map((pago) => (
              <div
                key={pago.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-100 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold text-[#1e3a5f]">
                          Servicio #{pago.id.slice(0, 8)}
                        </h3>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                          Pagado
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {format(new Date(pago.completadoAt), "dd 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#1e3a5f]">
                        ${pago.totalCliente.toLocaleString('es-CL')}
                      </p>
                      {pago.mpPaymentId && (
                        <p className="text-xs text-gray-500 mt-1">
                          ID: {pago.mpPaymentId}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Origen */}
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Origen</p>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {pago.origenDireccion}
                        </p>
                      </div>
                    </div>

                    {/* Destino */}
                    <div className="flex items-start">
                      <Navigation className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Destino</p>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {pago.destinoDireccion}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Gruero */}
                  {pago.gruero && (
                    <div className="mb-4 pb-4 border-b border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Gruero</p>
                      <p className="text-sm font-medium text-gray-900">
                        {pago.gruero.user.nombre} {pago.gruero.user.apellido}
                      </p>
                    </div>
                  )}

                  {/* Botón Descargar */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleDescargarComprobante(pago)}
                      className="bg-[#1e3a5f] text-white px-4 py-2 rounded-lg hover:bg-[#2d4a6f] transition-colors text-sm font-semibold flex items-center"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Descargar Comprobante
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d4a6f] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <span className="text-gray-600">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d4a6f] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* Modal de Comprobante */}
      {servicioIdComprobante && (
        <ComprobantePago
          servicioId={servicioIdComprobante}
          isOpen={showComprobante}
          onClose={() => {
            setShowComprobante(false);
            setServicioIdComprobante(null);
          }}
        />
      )}
    </Layout>
  );
}