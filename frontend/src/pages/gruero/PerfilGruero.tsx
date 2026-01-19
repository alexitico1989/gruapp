import { useState, useEffect } from 'react';
import { User, Truck, Edit2, Save, X, Star, DollarSign, Calendar, Phone, Mail, CreditCard, CheckCircle, Trash2 } from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { TIPOS_VEHICULO } from '../../utils/grueroConstants';

interface GrueroData {
  id: string;
  patente: string;
  marca: string;
  modelo: string;
  anio: number;
  capacidadToneladas: number;
  tipoGrua: string;
  tiposVehiculosAtiende: string;
  status: string;
  verificado: boolean;
  totalServicios: number;
  calificacionPromedio: number;
  cuentaSuspendida: boolean;
  motivoSuspension: string | null;
  user: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    rut: string;
    createdAt: string;
  };
}

interface Estadisticas {
  serviciosCompletados: number;
  serviciosActivos: number;
  gananciasHoy: number;
  gananciasSemana: number;
  gananciasMes: number;
  gananciasTotales: number;
  calificacionPromedio: number;
}

export default function PerfilGruero() {
  const { user } = useAuthStore();
  const [grueroData, setGrueroData] = useState<GrueroData | null>(null);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [editandoVehiculo, setEditandoVehiculo] = useState(false);
  
  const [formPerfil, setFormPerfil] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
  });

  const [formVehiculo, setFormVehiculo] = useState({
    patente: '',
    marca: '',
    modelo: '',
    anio: '',
    capacidadToneladas: '',
    tipoGrua: '',
  });

  const [tiposVehiculosSeleccionados, setTiposVehiculosSeleccionados] = useState<string[]>([]);

  const [showEliminarCuenta, setShowEliminarCuenta] = useState(false);
  const [passwordEliminar, setPasswordEliminar] = useState('');

  const tiposVehiculosDisponibles = Object.entries(TIPOS_VEHICULO).map(([value, label]) => ({
    value,
    label,
  }));

  const tiposGruaDisponibles = [
    { value: 'CAMA_BAJA', label: 'Cama Baja' },
    { value: 'HORQUILLA', label: 'Horquilla' },
    { value: 'PLUMA', label: 'Pluma' },
  ];

  const toggleTipoVehiculo = (tipo: string) => {
    setTiposVehiculosSeleccionados(prev => {
      if (prev.includes(tipo)) {
        return prev.filter(t => t !== tipo);
      } else {
        return [...prev, tipo];
      }
    });
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [perfilRes, statsRes] = await Promise.all([
        api.get('/gruero/perfil'),
        api.get('/gruero/estadisticas'),
      ]);

      if (perfilRes.data.success) {
        const data = perfilRes.data.data;
        setGrueroData(data);
        
        setFormPerfil({
          nombre: data.user.nombre,
          apellido: data.user.apellido,
          telefono: data.user.telefono,
          email: data.user.email,
        });

        setFormVehiculo({
          patente: data.patente,
          marca: data.marca,
          modelo: data.modelo,
          anio: data.anio?.toString() || '',
          capacidadToneladas: data.capacidadToneladas?.toString() || '',
          tipoGrua: data.tipoGrua || '',
        });

        try {
          const tipos = JSON.parse(data.tiposVehiculosAtiende || '[]');
          setTiposVehiculosSeleccionados(Array.isArray(tipos) ? tipos : []);
        } catch (error) {
          console.error('Error parseando tipos de vehículos:', error);
          setTiposVehiculosSeleccionados([]);
        }
      }

      if (statsRes.data.success) {
        setEstadisticas(statsRes.data.data);
      }
    } catch (error: any) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar datos del perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePerfil = async () => {
    try {
      const response = await api.patch('/gruero/perfil', formPerfil);
      
      if (response.data.success) {
        toast.success('Perfil actualizado exitosamente');
        setEditandoPerfil(false);
        cargarDatos();
      }
    } catch (error: any) {
      console.error('Error actualizando perfil:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar perfil');
    }
  };

  const handleUpdateVehiculo = async () => {
    if (tiposVehiculosSeleccionados.length === 0) {
      toast.error('Debes seleccionar al menos un tipo de vehículo');
      return;
    }

    try {
      const response = await api.patch('/gruero/vehiculo', {
        ...formVehiculo,
        anio: parseInt(formVehiculo.anio),
        capacidadToneladas: parseFloat(formVehiculo.capacidadToneladas),
        tiposVehiculosAtiende: JSON.stringify(tiposVehiculosSeleccionados),
      });
      
      if (response.data.success) {
        toast.success('Información del vehículo actualizada');
        setEditandoVehiculo(false);
        cargarDatos();
      }
    } catch (error: any) {
      console.error('Error actualizando vehículo:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar vehículo');
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
      const response = await api.delete('/gruero/cuenta', {
        data: { password: passwordEliminar },
      });

      if (response.data.success) {
        toast.success('Cuenta eliminada exitosamente');
        localStorage.clear();
        sessionStorage.clear();
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
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
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff7a3d] mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando perfil...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!grueroData) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <p className="text-gray-600">No se pudo cargar el perfil</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#1e3a5f]">Mi Perfil</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Administra tu información y configuración</p>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Columna Principal */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            
            {/* Información Personal */}
            <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-bold text-[#1e3a5f] flex items-center">
                  <User className="h-5 w-5 md:h-6 md:w-6 mr-2" />
                  <span className="hidden sm:inline">Información Personal</span>
                  <span className="sm:hidden">Info Personal</span>
                </h2>
                {!editandoPerfil ? (
                  <button
                    onClick={() => setEditandoPerfil(true)}
                    className="flex items-center text-[#ff7a3d] hover:text-orange-600 font-semibold text-sm md:text-base"
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Editar
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdatePerfil}
                      className="flex items-center bg-green-500 text-white px-2 md:px-3 py-1 rounded-lg hover:bg-green-600 text-sm"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Guardar</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditandoPerfil(false);
                        setFormPerfil({
                          nombre: grueroData.user.nombre,
                          apellido: grueroData.user.apellido,
                          telefono: grueroData.user.telefono,
                          email: grueroData.user.email,
                        });
                      }}
                      className="flex items-center bg-gray-500 text-white px-2 md:px-3 py-1 rounded-lg hover:bg-gray-600 text-sm"
                    >
                      <X className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Cancelar</span>
                    </button>
                  </div>
                )}
              </div>

              {editandoPerfil ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">Nombre</label>
                    <input
                      type="text"
                      value={formPerfil.nombre}
                      onChange={(e) => setFormPerfil({ ...formPerfil, nombre: e.target.value })}
                      className="input w-full text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">Apellido</label>
                    <input
                      type="text"
                      value={formPerfil.apellido}
                      onChange={(e) => setFormPerfil({ ...formPerfil, apellido: e.target.value })}
                      className="input w-full text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
                    <input
                      type="text"
                      value={formPerfil.telefono}
                      onChange={(e) => setFormPerfil({ ...formPerfil, telefono: e.target.value })}
                      className="input w-full text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={formPerfil.email}
                      onChange={(e) => setFormPerfil({ ...formPerfil, email: e.target.value })}
                      className="input w-full text-base"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="flex items-center">
                    <User className="h-4 w-4 md:h-5 md:w-5 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Nombre Completo</p>
                      <p className="font-semibold text-sm md:text-base truncate">{grueroData.user.nombre} {grueroData.user.apellido}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">RUT</p>
                      <p className="font-semibold text-sm md:text-base truncate">{grueroData.user.rut}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 md:h-5 md:w-5 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Teléfono</p>
                      <p className="font-semibold text-sm md:text-base">{grueroData.user.telefono}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 md:h-5 md:w-5 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-semibold text-sm md:text-base truncate">{grueroData.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 md:h-5 md:w-5 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Miembro desde</p>
                      <p className="font-semibold text-sm md:text-base">
                        {new Date(grueroData.user.createdAt).toLocaleDateString('es-CL')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className={`h-4 w-4 md:h-5 md:w-5 mr-3 flex-shrink-0 ${grueroData.verificado ? 'text-green-500' : 'text-gray-400'}`} />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Estado</p>
                      <p className={`font-semibold text-sm md:text-base ${grueroData.verificado ? 'text-green-600' : 'text-gray-600'}`}>
                        {grueroData.verificado ? 'Verificado' : 'Pendiente de Verificación'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Información del Vehículo */}
            <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-bold text-[#1e3a5f] flex items-center">
                  <Truck className="h-5 w-5 md:h-6 md:w-6 mr-2" />
                  <span className="hidden sm:inline">Información del Vehículo</span>
                  <span className="sm:hidden">Vehículo</span>
                </h2>
                {!editandoVehiculo ? (
                  <button
                    onClick={() => setEditandoVehiculo(true)}
                    className="flex items-center text-[#ff7a3d] hover:text-orange-600 font-semibold text-sm md:text-base"
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Editar
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateVehiculo}
                      className="flex items-center bg-green-500 text-white px-2 md:px-3 py-1 rounded-lg hover:bg-green-600 text-sm"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Guardar</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditandoVehiculo(false);
                        setFormVehiculo({
                          patente: grueroData.patente,
                          marca: grueroData.marca,
                          modelo: grueroData.modelo,
                          anio: grueroData.anio?.toString() || '',
                          capacidadToneladas: grueroData.capacidadToneladas?.toString() || '',
                          tipoGrua: grueroData.tipoGrua || '',
                        });
                        try {
                          const tipos = JSON.parse(grueroData.tiposVehiculosAtiende || '[]');
                          setTiposVehiculosSeleccionados(Array.isArray(tipos) ? tipos : []);
                        } catch (error) {
                          setTiposVehiculosSeleccionados([]);
                        }
                      }}
                      className="flex items-center bg-gray-500 text-white px-2 md:px-3 py-1 rounded-lg hover:bg-gray-600 text-sm"
                    >
                      <X className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Cancelar</span>
                    </button>
                  </div>
                )}
              </div>

              {editandoVehiculo ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">Patente</label>
                      <input
                        type="text"
                        value={formVehiculo.patente}
                        onChange={(e) => setFormVehiculo({ ...formVehiculo, patente: e.target.value.toUpperCase() })}
                        className="input w-full uppercase text-base"
                        maxLength={6}
                      />
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">Marca</label>
                      <input
                        type="text"
                        value={formVehiculo.marca}
                        onChange={(e) => setFormVehiculo({ ...formVehiculo, marca: e.target.value })}
                        className="input w-full text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">Modelo</label>
                      <input
                        type="text"
                        value={formVehiculo.modelo}
                        onChange={(e) => setFormVehiculo({ ...formVehiculo, modelo: e.target.value })}
                        className="input w-full text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">Año</label>
                      <input
                        type="number"
                        value={formVehiculo.anio}
                        onChange={(e) => setFormVehiculo({ ...formVehiculo, anio: e.target.value })}
                        className="input w-full text-base"
                        min="1900"
                        max={new Date().getFullYear() + 1}
                      />
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">Capacidad (toneladas)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={formVehiculo.capacidadToneladas}
                        onChange={(e) => setFormVehiculo({ ...formVehiculo, capacidadToneladas: e.target.value })}
                        className="input w-full text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">Tipo de Grúa</label>
                      <select
                        value={formVehiculo.tipoGrua}
                        onChange={(e) => setFormVehiculo({ ...formVehiculo, tipoGrua: e.target.value })}
                        className="input w-full text-base"
                      >
                        <option value="">Seleccionar...</option>
                        {tiposGruaDisponibles.map((tipo) => (
                          <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Selector de Tipos de Vehículos */}
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                      Tipos de Vehículos que Atiendes *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {tiposVehiculosDisponibles.map((tipo) => (
                        <button
                          key={tipo.value}
                          type="button"
                          onClick={() => toggleTipoVehiculo(tipo.value)}
                          className={`p-3 rounded-lg border-2 text-sm font-semibold transition-colors ${
                            tiposVehiculosSeleccionados.includes(tipo.value)
                              ? 'border-[#ff7a3d] bg-orange-50 text-[#ff7a3d]'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          {tipo.label}
                        </button>
                      ))}
                    </div>
                    {tiposVehiculosSeleccionados.length === 0 && (
                      <p className="text-red-500 text-sm mt-2">
                        Debes seleccionar al menos un tipo de vehículo
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Patente</p>
                      <p className="font-semibold text-base md:text-lg">{grueroData.patente}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Marca</p>
                      <p className="font-semibold text-sm md:text-base">{grueroData.marca}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Modelo</p>
                      <p className="font-semibold text-sm md:text-base">{grueroData.modelo}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Año</p>
                      <p className="font-semibold text-sm md:text-base">{grueroData.anio}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Capacidad</p>
                      <p className="font-semibold text-sm md:text-base">{grueroData.capacidadToneladas} ton</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Tipo de Grúa</p>
                      <p className="font-semibold text-sm md:text-base">
                        {tiposGruaDisponibles.find(t => t.value === grueroData.tipoGrua)?.label || grueroData.tipoGrua}
                      </p>
                    </div>
                  </div>

                  {/* Mostrar Tipos de Vehículos */}
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Tipos de Vehículos que Atiendes</p>
                    <div className="flex flex-wrap gap-2">
                      {tiposVehiculosSeleccionados.length > 0 ? (
                        tiposVehiculosSeleccionados.map((tipo) => (
                          <span
                            key={tipo}
                            className="px-3 py-1 bg-orange-100 text-[#ff7a3d] rounded-full text-sm font-semibold"
                          >
                            {tiposVehiculosDisponibles.find(t => t.value === tipo)?.label || tipo}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">No especificado</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Zona de Peligro */}
            <div className="bg-white rounded-lg shadow-md p-4 md:p-6 border-2 border-red-200">
              <h2 className="text-lg md:text-xl font-bold text-red-600 mb-4">Zona de Peligro</h2>
              <p className="text-sm md:text-base text-gray-600 mb-4">
                Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, asegúrate de estar completamente seguro.
              </p>
              
              <button
                onClick={() => setShowEliminarCuenta(!showEliminarCuenta)}
                className="bg-red-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center text-sm md:text-base"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Cuenta
              </button>

              {showEliminarCuenta && (
                <div className="mt-4 p-3 md:p-4 bg-red-50 rounded-lg">
                  <p className="text-red-800 font-semibold mb-4 text-sm md:text-base">
                    ⚠️ Esta acción es permanente e irreversible
                  </p>
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                      Confirma tu contraseña para continuar
                    </label>
                    <input
                      type="password"
                      value={passwordEliminar}
                      onChange={(e) => setPasswordEliminar(e.target.value)}
                      placeholder="Ingresa tu contraseña"
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4 text-base"
                    />
                  </div>
                  <button
                    onClick={handleEliminarCuenta}
                    className="bg-red-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm md:text-base"
                  >
                    Sí, eliminar mi cuenta permanentemente
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 md:space-y-6">
            {/* Calificación */}
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg shadow-md p-4 md:p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base md:text-lg font-bold">Calificación</h3>
                <Star className="h-5 w-5 md:h-6 md:w-6 fill-white" />
              </div>
              <div className="text-center">
                <p className="text-4xl md:text-5xl font-bold">{grueroData.calificacionPromedio.toFixed(1)}</p>
                <div className="flex justify-center mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`h-4 w-4 md:h-5 md:w-5 ${star <= Math.round(grueroData.calificacionPromedio) ? 'fill-white text-white' : 'text-white opacity-30'}`} />
                  ))}
                </div>
                <p className="text-xs md:text-sm mt-2 opacity-90">{grueroData.totalServicios} servicios completados</p>
              </div>
            </div>

            {/* Ganancias */}
            {estadisticas && (
              <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                <h3 className="text-base md:text-lg font-bold text-[#1e3a5f] mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 md:h-6 md:w-6 mr-2" />
                  Mis Ganancias
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-sm md:text-base text-gray-600">Hoy</span>
                    <span className="font-bold text-green-600 text-sm md:text-base">${estadisticas.gananciasHoy.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-sm md:text-base text-gray-600">Esta Semana</span>
                    <span className="font-bold text-green-600 text-sm md:text-base">${estadisticas.gananciasSemana.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-sm md:text-base text-gray-600">Este Mes</span>
                    <span className="font-bold text-green-600 text-sm md:text-base">${estadisticas.gananciasMes.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm md:text-base text-gray-900 font-semibold">Total</span>
                    <span className="font-bold text-lg md:text-xl text-[#ff7a3d]">${estadisticas.gananciasTotales.toLocaleString('es-CL')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Servicios */}
            {estadisticas && (
              <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                <h3 className="text-base md:text-lg font-bold text-[#1e3a5f] mb-4">Servicios</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm md:text-base text-gray-600">Completados</span>
                    <span className="font-bold text-green-600 text-sm md:text-base">{estadisticas.serviciosCompletados}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm md:text-base text-gray-600">Activos</span>
                    <span className="font-bold text-blue-600 text-sm md:text-base">{estadisticas.serviciosActivos}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}