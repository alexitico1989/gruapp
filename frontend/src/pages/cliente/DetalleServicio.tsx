import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Clock, User, Phone, Star, CheckCircle } from 'lucide-react';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../lib/api';
import toast from 'react-hot-toast';

interface Servicio {
  id: number;
  origen: string;
  destino: string;
  estado: string;
  precio_total: number;
  distancia_km: number;
  createdAt: string;
  gruero?: {
    nombre: string;
    telefono: string;
    calificacion: number;
  };
}

export default function DetalleServicio() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [servicio, setServicio] = useState<Servicio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarServicio();
  }, [id]);

  const cargarServicio = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/servicios/${id}`);
      if (response.data.success) {
        setServicio(response.data.data);
      }
    } catch (error: any) {
      toast.error('Error al cargar servicio');
      navigate('/cliente/servicios');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async () => {
    if (!servicio || !confirm('¿Cancelar servicio?')) return;
    try {
      await api.patch(`/servicios/${servicio.id}/cancelar`);
      toast.success('Servicio cancelado');
      cargarServicio();
    } catch (error: any) {
      toast.error('Error al cancelar');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (!servicio) {
    return (
      <Layout>
        <div className="p-6">
          <p>Servicio no encontrado</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">
        <button onClick={() => navigate('/cliente/servicios')} className="mb-4 text-[#1e3a5f]">
          ← Volver
        </button>

        <h1 className="text-3xl font-bold text-[#1e3a5f] mb-6">Servicio #{servicio.id}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Información</h2>
              <div className="space-y-3">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-green-500 mr-2 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Origen</p>
                    <p className="font-semibold">{servicio.origen}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Navigation className="h-5 w-5 text-orange-500 mr-2 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Destino</p>
                    <p className="font-semibold">{servicio.destino}</p>
                  </div>
                </div>
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-600">Precio</p>
                  <p className="text-2xl font-bold text-[#ff7a3d]">
                    ${servicio.precio_total.toLocaleString('es-CL')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {servicio.gruero ? (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4">Tu Gruero</h3>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold">{servicio.gruero.nombre}</p>
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 mr-1" />
                      <span className="text-sm">{servicio.gruero.calificacion.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <a
                  href={`tel:${servicio.gruero.telefono}`}
                  className="block w-full bg-[#ff7a3d] text-white rounded-lg text-center py-3 font-semibold hover:bg-[#ff8c52]"
                >
                  <Phone className="inline h-4 w-4 mr-2" />
                  Llamar
                </a>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl shadow-lg p-6 text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Buscando gruero...</p>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4">Acciones</h3>
              {servicio.estado === 'PENDIENTE' ? (
                <button
                  onClick={handleCancelar}
                  className="w-full bg-red-500 text-white rounded-lg py-3 font-semibold hover:bg-red-600"
                >
                  Cancelar Servicio
                </button>
              ) : (
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="font-semibold">{servicio.estado}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}