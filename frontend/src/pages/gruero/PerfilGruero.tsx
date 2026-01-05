import { useState, useEffect } from 'react';
import { User, Truck, Edit2, Save, X, Star, DollarSign, Package, Calendar, Phone, Mail, CreditCard, CheckCircle, Camera, Upload, AlertTriangle, FileText, Trash2 } from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import toast from 'react-hot-toast';

interface GrueroData {
  id: string;
  patente: string;
  marca: string;
  modelo: string;
  anio: number;
  capacidadToneladas: number;
  status: string;
  verificado: boolean;
  totalServicios: number;
  calificacionPromedio: number;
  fotoGruero: string | null;
  fotoGrua: string | null;
  licenciaConducir: string | null;
  licenciaVencimiento: string | null;
  seguroVigente: string | null;
  seguroVencimiento: string | null;
  revisionTecnica: string | null;
  revisionVencimiento: string | null;
  permisoCirculacion: string | null;
  permisoVencimiento: string | null;
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

interface Alerta {
  tipo: string;
  mensaje: string;
  fechaVencimiento: string;
  estado: 'vencido' | 'proximo';
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
  });

  const [uploadingFotoGruero, setUploadingFotoGruero] = useState(false);
  const [uploadingFotoGrua, setUploadingFotoGrua] = useState(false);
  const [uploadingDocumento, setUploadingDocumento] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [tipoDocumentoSeleccionado, setTipoDocumentoSeleccionado] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [alertasDocumentos, setAlertasDocumentos] = useState<Alerta[]>([]);

  const [showEliminarCuenta, setShowEliminarCuenta] = useState(false);
  const [passwordEliminar, setPasswordEliminar] = useState('');

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
        });
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

  const verificarDocumentos = async () => {
    try {
      const response = await api.get('/gruero/verificar-documentos');
      if (response.data.success) {
        setAlertasDocumentos(response.data.data.alertas);
      }
    } catch (error) {
      console.error('Error verificando documentos:', error);
    }
  };

  useEffect(() => {
    if (grueroData) {
      verificarDocumentos();
    }
  }, [grueroData]);

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
    try {
      const response = await api.patch('/gruero/vehiculo', {
        ...formVehiculo,
        anio: parseInt(formVehiculo.anio),
        capacidadToneladas: parseFloat(formVehiculo.capacidadToneladas),
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

  const handleUploadFotoGruero = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes');
      return;
    }

    try {
      setUploadingFotoGruero(true);
      const formData = new FormData();
      formData.append('foto', file);

      const response = await api.post('/gruero/foto-gruero', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        toast.success('Foto de perfil actualizada');
        cargarDatos();
      }
    } catch (error: any) {
      console.error('Error subiendo foto:', error);
      toast.error(error.response?.data?.message || 'Error al subir foto');
    } finally {
      setUploadingFotoGruero(false);
    }
  };

  const handleUploadFotoGrua = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes');
      return;
    }

    try {
      setUploadingFotoGrua(true);
      const formData = new FormData();
      formData.append('foto', file);

      const response = await api.post('/gruero/foto-grua', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        toast.success('Foto de la grúa actualizada');
        cargarDatos();
      }
    } catch (error: any) {
      console.error('Error subiendo foto:', error);
      toast.error(error.response?.data?.message || 'Error al subir foto');
    } finally {
      setUploadingFotoGrua(false);
    }
  };

  const handleUploadDocumento = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo no debe superar 10MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Solo se permiten imágenes (JPG, PNG) o PDF');
      return;
    }

    if (!fechaVencimiento) {
      toast.error('Debe especificar la fecha de vencimiento');
      return;
    }

    try {
      setUploadingDocumento(true);
      const formData = new FormData();
      formData.append('documento', file);
      formData.append('tipoDocumento', tipoDocumentoSeleccionado);
      formData.append('fechaVencimiento', fechaVencimiento);

      const response = await api.post('/gruero/documento', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        if (response.data.data.documentosVencidos && response.data.data.documentosVencidos.length > 0) {
          toast.error('Documento subido pero está VENCIDO. Cuenta suspendida.');
        } else {
          toast.success('Documento subido exitosamente');
        }
        cargarDatos();
        verificarDocumentos();
        setShowUploadModal(false);
        setTipoDocumentoSeleccionado('');
        setFechaVencimiento('');
      }
    } catch (error: any) {
      console.error('Error subiendo documento:', error);
      toast.error(error.response?.data?.message || 'Error al subir documento');
    } finally {
      setUploadingDocumento(false);
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
        
        // Limpiar TODO el almacenamiento local y de sesión
        localStorage.clear();
        sessionStorage.clear();
        
        // Esperar un momento para que se vea el toast
        setTimeout(() => {
          // Redirigir al login con hard redirect
          window.location.href = '/login';
        }, 1500);
      }
    } catch (error: any) {
      console.error('Error al eliminar cuenta:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar cuenta');
    }
  };

  const abrirModalDocumento = (tipo: string) => {
    setTipoDocumentoSeleccionado(tipo);
    setShowUploadModal(true);
  };

  const getNombreDocumento = (tipo: string) => {
    switch (tipo) {
      case 'licenciaConducir': return 'Licencia de Conducir';
      case 'seguroVigente': return 'Seguro Vigente';
      case 'revisionTecnica': return 'Revisión Técnica';
      case 'permisoCirculacion': return 'Permiso de Circulación';
      default: return '';
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

        {/* Alertas de Documentos */}
        {alertasDocumentos.length > 0 && (
          <div className="mb-6 space-y-2">
            {alertasDocumentos.map((alerta, index) => (
              <div
                key={index}
                className={`p-3 md:p-4 rounded-lg flex flex-col sm:flex-row sm:items-center gap-3 ${
                  alerta.estado === 'vencido'
                    ? 'bg-red-50 border-2 border-red-500'
                    : 'bg-yellow-50 border-2 border-yellow-500'
                }`}
              >
                <AlertTriangle
                  className={`h-5 w-5 md:h-6 md:w-6 flex-shrink-0 ${
                    alerta.estado === 'vencido' ? 'text-red-500' : 'text-yellow-500'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm md:text-base ${alerta.estado === 'vencido' ? 'text-red-900' : 'text-yellow-900'}`}>
                    {alerta.mensaje}
                  </p>
                  <p className="text-xs md:text-sm text-gray-600">
                    Vencimiento: {new Date(alerta.fechaVencimiento).toLocaleDateString('es-CL')}
                  </p>
                </div>
                <button
                  onClick={() => abrirModalDocumento(alerta.tipo)}
                  className="bg-blue-500 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-blue-600 font-semibold text-sm w-full sm:w-auto"
                >
                  Actualizar
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Alerta de Cuenta Suspendida */}
        {grueroData.cuentaSuspendida && (
          <div className="mb-6 bg-red-50 border-2 border-red-500 rounded-lg p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <AlertTriangle className="h-6 w-6 md:h-8 md:w-8 text-red-500 flex-shrink-0" />
              <div>
                <h3 className="text-lg md:text-xl font-bold text-red-900">Cuenta Suspendida</h3>
                <p className="text-sm md:text-base text-red-700 mt-1">{grueroData.motivoSuspension}</p>
                <p className="text-xs md:text-sm text-red-600 mt-2">
                  No podrás ponerte disponible hasta que actualices tus documentos vencidos.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Columna Principal */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Fotos de Perfil */}
            <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold text-[#1e3a5f] mb-4 md:mb-6 flex items-center">
                <Camera className="h-5 w-5 md:h-6 md:w-6 mr-2" />
                Fotos de Perfil
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Foto Gruero */}
                <div className="text-center">
                  <p className="font-semibold mb-3 text-sm md:text-base">Foto del Gruero</p>
                  <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-3">
                    {grueroData.fotoGruero ? (
                      <img
                        src={grueroData.fotoGruero?.startsWith('http') 
                          ? grueroData.fotoGruero 
                          : `https://gruapp-production.up.railway.app${grueroData.fotoGruero}`
                        }
                        alt="Foto Gruero"
                        className="w-full h-full object-cover rounded-full border-4 border-gray-200"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-12 w-12 md:h-16 md:w-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadFotoGruero}
                      className="hidden"
                      disabled={uploadingFotoGruero}
                    />
                    <span className="bg-[#ff7a3d] text-white px-3 md:px-4 py-2 rounded-lg hover:bg-orange-600 inline-block text-sm md:text-base">
                      {uploadingFotoGruero ? 'Subiendo...' : 'Cambiar Foto'}
                    </span>
                  </label>
                </div>

                {/* Foto Grúa */}
                <div className="text-center">
                  <p className="font-semibold mb-3 text-sm md:text-base">Foto de la Grúa</p>
                  <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-3">
                    {grueroData.fotoGrua ? (
                      <img
                        src={grueroData.fotoGrua?.startsWith('http') 
                          ? grueroData.fotoGrua 
                          : `https://gruapp-production.up.railway.app${grueroData.fotoGrua}`
                        }
                        alt="Foto Grúa"
                        className="w-full h-full object-cover rounded-lg border-4 border-gray-200"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                        <Truck className="h-12 w-12 md:h-16 md:w-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadFotoGrua}
                      className="hidden"
                      disabled={uploadingFotoGrua}
                    />
                    <span className="bg-[#ff7a3d] text-white px-3 md:px-4 py-2 rounded-lg hover:bg-orange-600 inline-block text-sm md:text-base">
                      {uploadingFotoGrua ? 'Subiendo...' : 'Cambiar Foto'}
                    </span>
                  </label>
                </div>
              </div>
            </div>

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
                        {grueroData.verificado ? 'Verificado' : 'Pendiente'}
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

              {editandoVehiculo ? (
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
                </div>
              ) : (
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
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-xs text-gray-500">Capacidad</p>
                    <p className="font-semibold text-sm md:text-base">{grueroData.capacidadToneladas} toneladas</p>
                  </div>
                </div>
              )}
            </div>

            {/* Documentos */}
            <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold text-[#1e3a5f] mb-4 md:mb-6 flex items-center">
                <Package className="h-5 w-5 md:h-6 md:w-6 mr-2" />
                Documentos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {[
                  { key: 'licenciaConducir', file: grueroData.licenciaConducir, venc: grueroData.licenciaVencimiento, nombre: 'Licencia de Conducir' },
                  { key: 'seguroVigente', file: grueroData.seguroVigente, venc: grueroData.seguroVencimiento, nombre: 'Seguro Vigente' },
                  { key: 'revisionTecnica', file: grueroData.revisionTecnica, venc: grueroData.revisionVencimiento, nombre: 'Revisión Técnica' },
                  { key: 'permisoCirculacion', file: grueroData.permisoCirculacion, venc: grueroData.permisoVencimiento, nombre: 'Permiso de Circulación' },
                ].map((doc) => (
                  <div key={doc.key} className={`border-2 rounded-lg p-3 md:p-4 ${doc.file ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <CheckCircle className={`h-5 w-5 md:h-6 md:w-6 ${doc.file ? 'text-green-500' : 'text-gray-400'}`} />
                      {doc.file && (
                        <a 
                          href={doc.file?.startsWith('http') 
                            ? doc.file 
                            : `https://gruapp-production.up.railway.app${doc.file}`
                          } 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-500 hover:text-blue-600"
                        >
                          <FileText className="h-4 w-4 md:h-5 md:w-5" />
                        </a>
                      )}
                    </div>
                    <p className="font-semibold text-sm md:text-base">{doc.nombre}</p>
                    {doc.venc && (
                      <p className="text-xs text-gray-600 mt-1">Vence: {new Date(doc.venc).toLocaleDateString('es-CL')}</p>
                    )}
                    <button onClick={() => abrirModalDocumento(doc.key)} className="w-full mt-3 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 text-xs md:text-sm">
                      {doc.file ? 'Actualizar' : 'Subir'}
                    </button>
                  </div>
                ))}
              </div>
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

        {/* Modal Upload Documento */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md">
              <h3 className="text-lg md:text-xl font-bold text-[#1e3a5f] mb-4">
                Subir {getNombreDocumento(tipoDocumentoSeleccionado)}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">Fecha de Vencimiento</label>
                  <input type="date" value={fechaVencimiento} onChange={(e) => setFechaVencimiento(e.target.value)} className="input w-full text-base" min={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">Archivo (JPG, PNG o PDF - Máx 10MB)</label>
                  <input type="file" accept="image/jpeg,image/jpg,image/png,application/pdf" onChange={handleUploadDocumento} className="w-full text-sm md:text-base" disabled={uploadingDocumento || !fechaVencimiento} />
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => { setShowUploadModal(false); setTipoDocumentoSeleccionado(''); setFechaVencimiento(''); }} className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 text-sm md:text-base" disabled={uploadingDocumento}>
                    Cancelar
                  </button>
                </div>
                {uploadingDocumento && (
                  <div className="text-center text-gray-600">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff7a3d] mx-auto mb-2"></div>
                    <p className="text-sm">Subiendo documento...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}