import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Phone, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { rutValidator } from '../utils/rutValidator';
import { TIPOS_GRUA, CAPACIDADES_TONELADAS, TIPOS_VEHICULO, MARCAS_GRUA, validarPatente, formatearPatente } from '../utils/grueroConstants';

interface FormData {
  nombre: string;
  apellido: string;
  rut: string;
  email: string;
  telefono: string;
  password: string;
  confirmPassword: string;
  patente: string;
  marca: string;
  modelo: string;
  anio: string;
  tipoGrua: string;
  capacidadToneladas: string;
  tiposVehiculosAtiende: string[];
}

export default function RegisterGruero() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    apellido: '',
    rut: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
    patente: '',
    marca: '',
    modelo: '',
    anio: '',
    tipoGrua: 'CAMA_BAJA',
    capacidadToneladas: '3',
    tiposVehiculosAtiende: [],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'rut') {
      const rutFormateado = rutValidator.formatearInput(value);
      setFormData(prev => ({ ...prev, [name]: rutFormateado }));
      
      if (rutFormateado && !rutValidator.validar(rutFormateado)) {
        setErrors(prev => ({ ...prev, rut: rutValidator.mensajeError(rutFormateado) }));
      } else {
        setErrors(prev => ({ ...prev, rut: '' }));
      }
      return;
    }
    
    if (name === 'patente') {
      const patenteFormateada = formatearPatente(value);
      setFormData(prev => ({ ...prev, [name]: patenteFormateada }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      tiposVehiculosAtiende: prev.tiposVehiculosAtiende.includes(value)
        ? prev.tiposVehiculosAtiende.filter(v => v !== value)
        : [...prev.tiposVehiculosAtiende, value]
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.apellido.trim()) newErrors.apellido = 'El apellido es requerido';
    if (!formData.rut.trim()) newErrors.rut = 'El RUT es requerido';
    else if (!rutValidator.validar(formData.rut)) newErrors.rut = 'RUT inválido';
    if (!formData.email.trim()) newErrors.email = 'El email es requerido';
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es requerido';
    else if (!/^[0-9]{8,15}$/.test(formData.telefono)) newErrors.telefono = 'Teléfono inválido (8-15 dígitos)';
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Mínimo 8 caracteres';
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      newErrors.password = 'Debe contener al menos una minúscula';
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = 'Debe contener al menos una mayúscula';
    } else if (!/(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Debe contener al menos un número';
    } else if (!/(?=.*[@$!%*?&])/.test(formData.password)) {
      newErrors.password = 'Debe contener al menos un carácter especial (@$!%*?&)';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!formData.patente.trim()) newErrors.patente = 'La patente es requerida';
    else if (!validarPatente(formData.patente)) newErrors.patente = 'Formato de patente inválido (ej: AA1234 o ABCD12)';
    if (!formData.marca.trim()) newErrors.marca = 'La marca es requerida';
    if (!formData.modelo.trim()) newErrors.modelo = 'El modelo es requerido';
    if (!formData.anio) newErrors.anio = 'El año es requerido';
    else {
      const anio = parseInt(formData.anio);
      const anioActual = new Date().getFullYear();
      if (anio < 1990 || anio > anioActual + 1) newErrors.anio = `Año debe estar entre 1990 y ${anioActual + 1}`;
    }
    if (formData.tiposVehiculosAtiende.length === 0) newErrors.tiposVehiculosAtiende = 'Selecciona al menos un tipo de vehículo';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }
    
    try {
      setLoading(true);
      
      const registerData = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        rut: formData.rut,
        email: formData.email,
        telefono: formData.telefono,
        password: formData.password,
        patente: formData.patente,
        marca: formData.marca,
        modelo: formData.modelo,
        anio: parseInt(formData.anio),
        tipoGrua: formData.tipoGrua,
        capacidadToneladas: parseFloat(formData.capacidadToneladas),
        tiposVehiculosAtiende: formData.tiposVehiculosAtiende,
      };
      
      const response = await api.post('/auth/register/gruero', registerData);
      
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      
      const token = response.data.data.token;
      const user = response.data.data.user;
      
      setAuth(user, token);
      toast.success('¡Registro exitoso! Tu cuenta será verificada por un administrador.');
      navigate('/gruero/dashboard');
      
    } catch (error: any) {
      console.error('Error en registro:', error);
      toast.error(error.response?.data?.message || error.message || 'Error al registrar gruero');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* Form Container */}
      <div className="flex-1 py-6 md:py-8">
        <div className="max-w-2xl mx-auto px-4 md:px-6">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="text-xl md:text-2xl font-bold text-[#1e3a5f] mb-4 md:mb-6">Datos Personales</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                <div>
                  <label className="block text-sm font-semibold text-[#1e3a5f] mb-2">Nombre</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 md:py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff7a3d] focus:border-transparent transition-all text-base"
                      placeholder="Juan"
                    />
                  </div>
                  {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-[#1e3a5f] mb-2">Apellido</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 md:py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff7a3d] focus:border-transparent transition-all text-base"
                      placeholder="Pérez"
                    />
                  </div>
                  {errors.apellido && <p className="text-red-500 text-sm mt-1">{errors.apellido}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1e3a5f] mb-2">RUT</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="rut"
                    value={formData.rut}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-4 py-3 md:py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff7a3d] focus:border-transparent transition-all text-base"
                    placeholder="12.345.678-9"
                    maxLength={12}
                  />
                </div>
                {errors.rut && <p className="text-red-500 text-sm mt-1">{errors.rut}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1e3a5f] mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-4 py-3 md:py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff7a3d] focus:border-transparent transition-all text-base"
                    placeholder="tu@email.com"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1e3a5f] mb-2">Teléfono</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-4 py-3 md:py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff7a3d] focus:border-transparent transition-all text-base"
                    placeholder="912345678"
                  />
                </div>
                {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                <div>
                  <label className="block text-sm font-semibold text-[#1e3a5f] mb-2">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 md:py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff7a3d] focus:border-transparent transition-all text-base"
                      placeholder="••••••••"
                    />
                  </div>
                  <p className="text-gray-500 text-xs mt-1.5">
                    Mínimo 8 caracteres con al menos: 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial (@$!%*?&)
                  </p>
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-[#1e3a5f] mb-2">Confirmar Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 md:py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff7a3d] focus:border-transparent transition-all text-base"
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* Datos del Vehículo */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h2 className="text-xl md:text-2xl font-bold text-[#1e3a5f] mb-4 md:mb-6">Datos del Vehículo (Grúa)</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#1e3a5f] mb-2">Patente</label>
                    <input
                      type="text"
                      name="patente"
                      value={formData.patente}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 md:py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff7a3d] focus:border-transparent transition-all text-base uppercase"
                      placeholder="AA1234 o ABCD12"
                      maxLength={6}
                    />
                    {errors.patente && <p className="text-red-500 text-sm mt-1">{errors.patente}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-[#1e3a5f] mb-2">Marca</label>
                    <select
                      name="marca"
                      value={formData.marca}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 md:py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff7a3d] focus:border-transparent transition-all text-base"
                    >
                      <option value="">Seleccionar marca</option>
                      {MARCAS_GRUA.map(marca => (
                        <option key={marca} value={marca}>{marca}</option>
                      ))}
                    </select>
                    {errors.marca && <p className="text-red-500 text-sm mt-1">{errors.marca}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mt-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#1e3a5f] mb-2">Modelo</label>
                    <input
                      type="text"
                      name="modelo"
                      value={formData.modelo}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 md:py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff7a3d] focus:border-transparent transition-all text-base"
                      placeholder="Ej: Actros 2546"
                    />
                    {errors.modelo && <p className="text-red-500 text-sm mt-1">{errors.modelo}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-[#1e3a5f] mb-2">Año</label>
                    <input
                      type="number"
                      name="anio"
                      value={formData.anio}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 md:py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff7a3d] focus:border-transparent transition-all text-base"
                      placeholder="2020"
                      min="1990"
                      max={new Date().getFullYear() + 1}
                    />
                    {errors.anio && <p className="text-red-500 text-sm mt-1">{errors.anio}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mt-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#1e3a5f] mb-2">Tipo de Grúa</label>
                    <select
                      name="tipoGrua"
                      value={formData.tipoGrua}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 md:py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff7a3d] focus:border-transparent transition-all text-base"
                    >
                      {Object.entries(TIPOS_GRUA).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-[#1e3a5f] mb-2">Capacidad de Carga</label>
                    <select
                      name="capacidadToneladas"
                      value={formData.capacidadToneladas}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 md:py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff7a3d] focus:border-transparent transition-all text-base"
                    >
                      {CAPACIDADES_TONELADAS.map(cap => (
                        <option key={cap} value={cap}>{cap} ton</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-semibold text-[#1e3a5f] mb-3">
                    Tipos de Vehículos que Atiende <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(TIPOS_VEHICULO).map(([value, label]) => (
                      <label key={value} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.tiposVehiculosAtiende.includes(value)}
                          onChange={() => handleCheckboxChange(value)}
                          className="w-4 h-4 text-[#ff7a3d] border-gray-300 rounded focus:ring-[#ff7a3d]"
                        />
                        <span className="text-sm text-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.tiposVehiculosAtiende && <p className="text-red-500 text-sm mt-1">{errors.tiposVehiculosAtiende}</p>}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end mt-6 md:mt-8 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-6 py-2.5 md:px-8 md:py-3 bg-[#ff7a3d] text-white rounded-lg hover:bg-[#ff8c52] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 md:h-5 md:w-5 mr-2" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                      Completar Registro
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-sm md:text-base text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-[#ff7a3d] font-semibold hover:underline">
                Iniciar Sesión
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}