import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, CreditCard, Calendar, Lock, Trash2, Save } from 'lucide-react';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

interface PerfilData {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  telefono: string;
  rut: string | null;
  createdAt: string;
  clienteProfile: {
    cuentaSuspendida: boolean;
    motivoSuspension: string | null;
  };
  stats: {
    totalServicios: number;
    serviciosCompletados: number;
    serviciosCancelados: number;
    totalGastado: number;
  };
}

export default function Perfil() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  
  // Estados para edición
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [rut, setRut] = useState('');
  
  // Estados para cambio de contraseña
  const [showCambiarPassword, setShowCambiarPassword] = useState(false);
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNuevo, setPasswordNuevo] = useState('');
  const [passwordConfirmar, setPasswordConfirmar] = useState('');
  
  // Estado para eliminar cuenta
  const [showEliminarCuenta, setShowEliminarCuenta] = useState(false);
  const [passwordEliminar, setPasswordEliminar] = useState('');

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cliente/perfil');
      if (response.data.success) {
        const data = response.data.data;
        setPerfil(data);
        setNombre(data.nombre);
        setApellido(data.apellido);
        setTelefono(data.telefono);
        setRut(data.rut || '');
      }
    } catch (error: any) {
      console.error('Error al cargar perfil:', error);
      toast.error(error.response?.data?.message || 'Error al cargar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarPerfil = async () => {
    try {
      setGuardando(true);
      const response = await api.patch('/cliente/perfil', {
        nombre,
        apellido,
        telefono,
        rut: rut || null,
      });
      
      if (response.data.success) {
        toast.success('Perfil actualizado exitosamente');
        setEditando(false);
        cargarPerfil();
      }
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar perfil');
    } finally {
      setGuardando(false);
    }
  };

  const handleCancelarEdicion = () => {
    if (perfil) {
      setNombre(perfil.nombre);
      setApellido(perfil.apellido);
      setTelefono(perfil.telefono);
      setRut(perfil.rut || '');
    }
    setEditando(false);
  };

  const handleCambiarPassword = async () => {
    if (passwordNuevo !== passwordConfirmar) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (passwordNuevo.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      const response = await api.patch('/cliente/password', {
        passwordActual,
        passwordNuevo,
      });

      if (response.data.success) {
        toast.success('Contraseña actualizada exitosamente');
        setShowCambiarPassword(false);
        setPasswordActual('');
        setPasswordNuevo('');
        setPasswordConfirmar('');
      }
    } catch (error: any) {
      console.error('Error al cambiar contraseña:', error);
      toast.error(error.response?.data?.message || 'Error al cambiar contraseña');
    }
  };

  const handleEliminarCuenta = async () => {
    if (!passwordEliminar) {
      toast.error('Debes ingresar tu contraseña');
      return;
    }

    if (!window.confirm('¿Estás seguro? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const response = await api.delete('/cliente/cuenta', {
        data: { password: passwordEliminar },
      });

      if (response.data.success) {
        toast.success('Cuenta eliminada exitosamente');
        logout(); // Limpiar estado de autenticación
        navigate('/'); // Redirigir al inicio
      }
    } catch (error: any) {
      console.error('Error al eliminar cuenta:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar cuenta');
    }
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

  if (!perfil) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error al cargar el perfil</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1e3a5f] mb-2">Mi Perfil</h1>
          <p className="text-gray-600">Gestiona tu información personal y configuración</p>
        </div>

        {/* Alerta si cuenta suspendida */}
        {perfil.clienteProfile.cuentaSuspendida && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-semibold">⚠️ Tu cuenta está suspendida</p>
            {perfil.clienteProfile.motivoSuspension && (
              <p className="text-red-700 text-sm mt-1">
                Motivo: {perfil.clienteProfile.motivoSuspension}
              </p>
            )}
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
            <p className="text-gray-500 text-sm">Total Servicios</p>
            <p className="text-2xl font-bold text-[#1e3a5f]">{perfil.stats.totalServicios}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
            <p className="text-gray-500 text-sm">Completados</p>
            <p className="text-2xl font-bold text-green-600">{perfil.stats.serviciosCompletados}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
            <p className="text-gray-500 text-sm">Cancelados</p>
            <p className="text-2xl font-bold text-red-600">{perfil.stats.serviciosCancelados}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
            <p className="text-gray-500 text-sm">Total Gastado</p>
            <p className="text-2xl font-bold text-[#ff7a3d]">
              ${perfil.stats.totalGastado.toLocaleString('es-CL')}
            </p>
          </div>
        </div>

        {/* Información Personal */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#1e3a5f]">Información Personal</h2>
            {!editando ? (
              <button
                onClick={() => setEditando(true)}
                className="bg-[#1e3a5f] text-white px-4 py-2 rounded-lg hover:bg-[#2d4a6f] transition-colors"
              >
                Editar
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleCancelarEdicion}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  disabled={guardando}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardarPerfil}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  disabled={guardando}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {guardando ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-2" />
                Nombre
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={!editando}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            {/* Apellido */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-2" />
                Apellido
              </label>
              <input
                type="text"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                disabled={!editando}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            {/* Email (no editable) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="h-4 w-4 inline mr-2" />
                Email
              </label>
              <input
                type="email"
                value={perfil.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="h-4 w-4 inline mr-2" />
                Teléfono
              </label>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                disabled={!editando}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            {/* RUT */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CreditCard className="h-4 w-4 inline mr-2" />
                RUT (opcional)
              </label>
              <input
                type="text"
                value={rut}
                onChange={(e) => setRut(e.target.value)}
                disabled={!editando}
                placeholder="12.345.678-9"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            {/* Fecha de registro */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-2" />
                Miembro desde
              </label>
              <input
                type="text"
                value={new Date(perfil.createdAt).toLocaleDateString('es-CL')}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Seguridad */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          <h2 className="text-xl font-bold text-[#1e3a5f] mb-6">Seguridad</h2>
          
          <button
            onClick={() => setShowCambiarPassword(!showCambiarPassword)}
            className="bg-[#1e3a5f] text-white px-4 py-2 rounded-lg hover:bg-[#2d4a6f] transition-colors flex items-center"
          >
            <Lock className="h-4 w-4 mr-2" />
            Cambiar Contraseña
          </button>

          {showCambiarPassword && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña Actual
                  </label>
                  <input
                    type="password"
                    value={passwordActual}
                    onChange={(e) => setPasswordActual(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    value={passwordNuevo}
                    onChange={(e) => setPasswordNuevo(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    value={passwordConfirmar}
                    onChange={(e) => setPasswordConfirmar(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleCambiarPassword}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Actualizar Contraseña
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Zona de Peligro */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-red-200">
          <h2 className="text-xl font-bold text-red-600 mb-4">Zona de Peligro</h2>
          <p className="text-gray-600 mb-4">
            Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, asegúrate de estar completamente seguro.
          </p>
          
          <button
            onClick={() => setShowEliminarCuenta(!showEliminarCuenta)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar Cuenta
          </button>

          {showEliminarCuenta && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg">
              <p className="text-red-800 font-semibold mb-4">
                ⚠️ Esta acción es permanente e irreversible
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirma tu contraseña para continuar
                </label>
                <input
                  type="password"
                  value={passwordEliminar}
                  onChange={(e) => setPasswordEliminar(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
                />
              </div>
              <button
                onClick={handleEliminarCuenta}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Sí, eliminar mi cuenta permanentemente
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}