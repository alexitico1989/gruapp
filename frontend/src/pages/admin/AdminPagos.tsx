import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import api from '../../lib/api';
import toast from 'react-hot-toast';

interface Servicio {
  id: string;
  fecha: string;
  cliente: string;
  origen: string;
  destino: string;
  monto: number;
}

interface GrueroPendiente {
  grueroId: string;
  nombre: string;
  email: string;
  telefono: string;
  patente: string;
  banco: string | null;
  tipoCuenta: string | null;
  numeroCuenta: string | null;
  nombreTitular: string | null;
  rutTitular: string | null;
  totalServicios: number;
  montoTotal: number;
  servicios: Servicio[];
}

interface DatosPendientes {
  periodo: string;
  inicioSemana: string;
  finSemana: string;
  grueros: GrueroPendiente[];
  totalGrueros: number;
  montoTotalGeneral: number;
}

export default function AdminPagos() {
  const [datos, setDatos] = useState<DatosPendientes | null>(null);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState<string | null>(null);
  const [grueroExpandido, setGrueroExpandido] = useState<string | null>(null);
  
  // Datos del formulario de pago
  const [formPago, setFormPago] = useState({
    grueroId: '',
    metodoPago: 'TRANSFERENCIA',
    numeroComprobante: '',
    notasAdmin: '',
  });
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    cargarPendientes();
  }, []);

 const cargarPendientes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/pagos/pendientes');
      if (response.data.success) {
        setDatos(response.data.data);
      }
    } catch (error: any) {
      console.error('Error cargando pendientes:', error);

      if (error.response) {
        // Error que viene del servidor
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      } else {
        // Error de otro tipo (red, timeout, etc)
        console.error('Error sin respuesta:', error.message);
      }

      toast.error('Error al cargar pagos pendientes');
    } finally {
      setLoading(false);
    }
  };



  const abrirModalPago = (gruero: GrueroPendiente) => {
    setFormPago({
      grueroId: gruero.grueroId,
      metodoPago: 'TRANSFERENCIA',
      numeroComprobante: '',
      notasAdmin: '',
    });
    setMostrarModal(true);
  };

  const marcarComoPagado = async () => {
    if (!formPago.numeroComprobante.trim()) {
      toast.error('Ingresa el número de comprobante');
      return;
    }

    try {
      setProcesando(formPago.grueroId);
      
      const response = await api.post('/admin/pagos/marcar-pagado', formPago);
      
      if (response.data.success) {
        toast.success('✅ Pago registrado exitosamente');
        setMostrarModal(false);
        setFormPago({
          grueroId: '',
          metodoPago: 'TRANSFERENCIA',
          numeroComprobante: '',
          notasAdmin: '',
        });
        cargarPendientes();
      }
    } catch (error: any) {
      console.error('Error marcando pago:', error);
      toast.error(error.response?.data?.message || 'Error al registrar el pago');
    } finally {
      setProcesando(null);
    }
  };

  const toggleGrueroExpandido = (grueroId: string) => {
    setGrueroExpandido(grueroExpandido === grueroId ? null : grueroId);
  };

  if (loading) {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

  return (
    <div>
      {/* Header */}
      <div className="mb-6 bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Pagos Pendientes</h2>
            <p className="text-gray-600 mt-1">Período: {datos?.periodo}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total a Transferir</p>
            <p className="text-3xl font-bold text-blue-600">
              ${datos?.montoTotalGeneral.toLocaleString('es-CL')}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {datos?.totalGrueros} gruero{datos?.totalGrueros !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Grueros */}
      {datos && datos.grueros.length > 0 ? (
        <div className="space-y-4">
          {datos.grueros.map((gruero) => (
            <div key={gruero.grueroId} className="bg-white rounded-lg shadow">
              {/* Header del Gruero */}
              <div className="p-6 border-b">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-gray-800">{gruero.nombre}</h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {gruero.patente}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">{gruero.email}</p>
                    <p className="text-gray-600">{gruero.telefono}</p>
                    
                    {/* Datos Bancarios */}
                    {gruero.banco && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-semibold text-gray-700">Datos Bancarios:</p>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                          <div>
                            <span className="text-gray-600">Banco:</span>
                            <span className="ml-2 font-medium">{gruero.banco}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Tipo:</span>
                            <span className="ml-2 font-medium">{gruero.tipoCuenta}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Cuenta:</span>
                            <span className="ml-2 font-medium">{gruero.numeroCuenta}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Titular:</span>
                            <span className="ml-2 font-medium">{gruero.nombreTitular}</span>
                          </div>
                          {gruero.rutTitular && (
                            <div>
                              <span className="text-gray-600">RUT:</span>
                              <span className="ml-2 font-medium">{gruero.rutTitular}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-right ml-6">
                    <p className="text-sm text-gray-600">Monto a Transferir</p>
                    <p className="text-3xl font-bold text-green-600">
                      ${gruero.montoTotal.toLocaleString('es-CL')}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {gruero.totalServicios} servicio{gruero.totalServicios !== 1 ? 's' : ''}
                    </p>
                    
                    <button
                      onClick={() => abrirModalPago(gruero)}
                      disabled={procesando === gruero.grueroId}
                      className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {procesando === gruero.grueroId ? 'Procesando...' : '💰 Marcar como Pagado'}
                    </button>
                    
                    <button
                      onClick={() => toggleGrueroExpandido(gruero.grueroId)}
                      className="mt-2 w-full px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm"
                    >
                      {grueroExpandido === gruero.grueroId ? '▲ Ocultar' : '▼ Ver'} Detalles
                    </button>
                  </div>
                </div>
              </div>

              {/* Detalles Expandibles */}
              {grueroExpandido === gruero.grueroId && (
                <div className="p-6 bg-gray-50">
                  <h4 className="font-bold text-gray-800 mb-3">
                    Servicios Incluidos ({gruero.servicios.length})
                  </h4>
                  <div className="space-y-2">
                    {gruero.servicios.map((servicio) => (
                      <div
                        key={servicio.id}
                        className="p-3 bg-white rounded-lg border flex justify-between items-center"
                      >
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">
                            {new Date(servicio.fecha).toLocaleDateString('es-CL')}
                          </p>
                          <p className="font-medium text-gray-800">{servicio.cliente}</p>
                          <p className="text-sm text-gray-600 truncate">{servicio.origen}</p>
                        </div>
                        <p className="text-lg font-bold text-green-600">
                          ${servicio.monto.toLocaleString('es-CL')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">
            Sin pagos pendientes
          </h3>
          <p className="text-gray-600">
            No hay grueros con pagos pendientes esta semana
          </p>
        </div>
      )}

      {/* Modal de Pago */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Registrar Pago</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Pago
                </label>
                <select
                  value={formPago.metodoPago}
                  onChange={(e) => setFormPago({ ...formPago, metodoPago: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                  <option value="EFECTIVO">Efectivo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Comprobante *
                </label>
                <input
                  type="text"
                  value={formPago.numeroComprobante}
                  onChange={(e) => setFormPago({ ...formPago, numeroComprobante: e.target.value })}
                  placeholder="Ej: 123456789"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas (opcional)
                </label>
                <textarea
                  value={formPago.notasAdmin}
                  onChange={(e) => setFormPago({ ...formPago, notasAdmin: e.target.value })}
                  placeholder="Observaciones adicionales..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setMostrarModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={marcarComoPagado}
                disabled={!!procesando}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {procesando ? 'Procesando...' : 'Confirmar Pago'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}