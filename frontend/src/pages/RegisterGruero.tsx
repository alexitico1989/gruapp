import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Phone, FileText, Truck, Camera, Upload, ChevronRight, ChevronLeft, CheckCircle, Loader2 } from 'lucide-react';
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
  fotoGruero: File | null;
  fotoGrua: File | null;
  licenciaConducir: File | null;
  licenciaVencimiento: string;
  seguroVigente: File | null;
  seguroVencimiento: string;
  revisionTecnica: File | null;
  revisionVencimiento: string;
  permisoCirculacion: File | null;
  permisoVencimiento: string;
}

export default function RegisterGruero() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
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
    fotoGruero: null,
    fotoGrua: null,
    licenciaConducir: null,
    licenciaVencimiento: '',
    seguroVigente: null,
    seguroVencimiento: '',
    revisionTecnica: null,
    revisionVencimiento: '',
    permisoCirculacion: null,
    permisoVencimiento: '',
  });

  const [fotoGrueroPreview, setFotoGrueroPreview] = useState<string>('');
  const [fotoGruaPreview, setFotoGruaPreview] = useState<string>('');

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof FormData) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, [fieldName]: file }));
      
      if (fieldName === 'fotoGruero' || fieldName === 'fotoGrua') {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (fieldName === 'fotoGruero') {
            setFotoGrueroPreview(reader.result as string);
          } else {
            setFotoGruaPreview(reader.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.apellido.trim()) newErrors.apellido = 'El apellido es requerido';
    if (!formData.rut.trim()) newErrors.rut = 'El RUT es requerido';
    else if (!rutValidator.validar(formData.rut)) newErrors.rut = 'RUT inválido';
    if (!formData.email.trim()) newErrors.email = 'El email es requerido';
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es requerido';
    else if (!/^[0-9]{8,15}$/.test(formData.telefono)) newErrors.telefono = 'Teléfono inválido (8-15 dígitos)';
    
    // ✅ NUEVA VALIDACIÓN DE PASSWORD
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
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
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

  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fotoGruero) newErrors.fotoGruero = 'La foto del gruero es requerida';
    if (!formData.fotoGrua) newErrors.fotoGrua = 'La foto de la grúa es requerida';
    if (!formData.licenciaConducir) newErrors.licenciaConducir = 'La licencia de conducir es requerida';
    if (!formData.licenciaVencimiento) newErrors.licenciaVencimiento = 'La fecha de vencimiento es requerida';
    if (!formData.seguroVigente) newErrors.seguroVigente = 'El seguro es requerido';
    if (!formData.seguroVencimiento) newErrors.seguroVencimiento = 'La fecha de vencimiento es requerida';
    if (!formData.revisionTecnica) newErrors.revisionTecnica = 'La revisión técnica es requerida';
    if (!formData.revisionVencimiento) newErrors.revisionVencimiento = 'La fecha de vencimiento es requerida';
    if (!formData.permisoCirculacion) newErrors.permisoCirculacion = 'El permiso de circulación es requerido';
    if (!formData.permisoVencimiento) newErrors.permisoVencimiento = 'La fecha de vencimiento es requerida';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = false;
    
    if (currentStep === 1) isValid = validateStep1();
    else if (currentStep === 2) isValid = validateStep2();
    
    if (isValid && currentStep < 3) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;
    
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
      
      if (formData.fotoGruero) {
        const fotoGrueroFormData = new FormData();
        fotoGrueroFormData.append('foto', formData.fotoGruero);
        
        await api.post('/gruero/foto-gruero', fotoGrueroFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });
      }
      
      if (formData.fotoGrua) {
        const fotoGruaFormData = new FormData();
        fotoGruaFormData.append('foto', formData.fotoGrua);
        
        await api.post('/gruero/foto-grua', fotoGruaFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });
      }
      
      const documentos = [
        { file: formData.licenciaConducir, tipo: 'licenciaConducir', vencimiento: formData.licenciaVencimiento },
        { file: formData.seguroVigente, tipo: 'seguroVigente', vencimiento: formData.seguroVencimiento },
        { file: formData.revisionTecnica, tipo: 'revisionTecnica', vencimiento: formData.revisionVencimiento },
        { file: formData.permisoCirculacion, tipo: 'permisoCirculacion', vencimiento: formData.permisoVencimiento },
      ];
      
      for (const doc of documentos) {
        if (doc.file) {
          const docFormData = new FormData();
          docFormData.append('documento', doc.file);
          docFormData.append('tipoDocumento', doc.tipo);
          docFormData.append('fechaVencimiento', doc.vencimiento);
          
          await api.post('/gruero/documento', docFormData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${token}`
            }
          });
        }
      }
      
      setAuth(user, token);
      toast.success('¡Registro exitoso! Tu cuenta está pendiente de verificación.');
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

      {/* Progress Bar - RESPONSIVE */}
      <div className="bg-white border-b border-gray-200 py-4 md:py-6">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full font-bold text-sm md:text-base ${
                  currentStep >= step ? 'bg-[#ff7a3d] text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {currentStep > step ? <CheckCircle className="h-5 w-5 md:h-6 md:w-6" /> : step}
                </div>
                <div className="ml-2 md:ml-3 flex-1 hidden sm:block">
                  <p className={`text-xs md:text-sm font-semibold ${currentStep >= step ? 'text-[#1e3a5f]' : 'text-gray-400'}`}>
                    {step === 1 && 'Datos Personales'}
                    {step === 2 && 'Datos del Vehículo'}
                    {step === 3 && 'Fotos y Documentos'}
                  </p>
                </div>
                {step < 3 && (
                  <ChevronRight className={`h-4 w-4 md:h-5 md:w-5 mx-2 md:mx-4 ${currentStep > step ? 'text-[#ff7a3d]' : 'text-gray-300'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="flex-1 py-6 md:py-8">
        <div className="max-w-2xl mx-auto px-4 md:px-6">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            
            {/* STEP 1: Datos Personales */}
            {currentStep === 1 && (
              <div className="space-y-4 md:space-y-5">
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
                    
                    {/* ✅ NUEVO: Mensaje de ayuda */}
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
              </div>
            )}

            {/* STEP 2: Datos del Vehículo */}
            {currentStep === 2 && (
              <div className="space-y-4 md:space-y-5">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#1e3a5f] mb-2">Tipo de Grúa</label>
                    <select
                      name="tipoGrua"
                      value={formData.tipoGrua}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 md:py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff7a3d] focus:border-transparent transition-all text-base"
                    >
                      {TIPOS_GRUA.map(tipo => (
                        <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
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
                        <option key={cap.value} value={cap.value}>{cap.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1e3a5f] mb-3">
                    Tipos de Vehículos que Atiende <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {TIPOS_VEHICULO.map(tipo => (
                      <label key={tipo.value} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.tiposVehiculosAtiende.includes(tipo.value)}
                          onChange={() => handleCheckboxChange(tipo.value)}
                          className="w-4 h-4 text-[#ff7a3d] border-gray-300 rounded focus:ring-[#ff7a3d]"
                        />
                        <span className="text-sm text-gray-700">{tipo.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.tiposVehiculosAtiende && <p className="text-red-500 text-sm mt-1">{errors.tiposVehiculosAtiende}</p>}
                </div>
              </div>
            )}

            {/* STEP 3: Fotos y Documentos */}
            {currentStep === 3 && (
              <div className="space-y-5 md:space-y-6">
                <h2 className="text-xl md:text-2xl font-bold text-[#1e3a5f] mb-4 md:mb-6">Fotos y Documentos</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#1e3a5f] mb-2">
                      Foto del Gruero <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#ff7a3d] transition-colors">
                      {fotoGrueroPreview ? (
                        <div className="space-y-2">
                          <img src={fotoGrueroPreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg mx-auto" />
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, fotoGruero: null }));
                              setFotoGrueroPreview('');
                            }}
                            className="text-sm text-red-500 hover:text-red-700"
                          >
                            Eliminar
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <Camera className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Click para subir foto</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'fotoGruero')}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                    {errors.fotoGruero && <p className="text-red-500 text-sm mt-1">{errors.fotoGruero}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#1e3a5f] mb-2">
                      Foto de la Grúa <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#ff7a3d] transition-colors">
                      {fotoGruaPreview ? (
                        <div className="space-y-2">
                          <img src={fotoGruaPreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg mx-auto" />
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, fotoGrua: null }));
                              setFotoGruaPreview('');
                            }}
                            className="text-sm text-red-500 hover:text-red-700"
                          >
                            Eliminar
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <Truck className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Click para subir foto</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'fotoGrua')}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                    {errors.fotoGrua && <p className="text-red-500 text-sm mt-1">{errors.fotoGrua}</p>}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-base md:text-lg font-semibold text-[#1e3a5f]">Documentos Requeridos</h3>
                  
                  {/* Licencia de Conducir */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Licencia de Conducir <span className="text-red-500">*</span>
                        </label>
                        <label className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm md:text-base">
                          <Upload className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600 truncate">
                            {formData.licenciaConducir ? formData.licenciaConducir.name : 'Subir archivo'}
                          </span>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange(e, 'licenciaConducir')}
                            className="hidden"
                          />
                        </label>
                        {errors.licenciaConducir && <p className="text-red-500 text-xs mt-1">{errors.licenciaConducir}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Fecha de Vencimiento <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="licenciaVencimiento"
                          value={formData.licenciaVencimiento}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 md:py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff7a3d] focus:border-transparent transition-all text-base"
                        />
                        {errors.licenciaVencimiento && <p className="text-red-500 text-xs mt-1">{errors.licenciaVencimiento}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Seguro SOAP */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Seguro Obligatorio (SOAP) <span className="text-red-500">*</span>
                        </label>
                        <label className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                          <Upload className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600 truncate">
                            {formData.seguroVigente ? formData.seguroVigente.name : 'Subir archivo'}
                          </span>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange(e, 'seguroVigente')}
                            className="hidden"
                          />
                        </label>
                        {errors.seguroVigente && <p className="text-red-500 text-xs mt-1">{errors.seguroVigente}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Fecha de Vencimiento <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="seguroVencimiento"
                          value={formData.seguroVencimiento}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 md:py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff7a3d] focus:border-transparent transition-all text-base"
                        />
                        {errors.seguroVencimiento && <p className="text-red-500 text-xs mt-1">{errors.seguroVencimiento}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Revisión Técnica */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Revisión Técnica <span className="text-red-500">*</span>
                        </label>
                        <label className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                          <Upload className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600 truncate">
                            {formData.revisionTecnica ? formData.revisionTecnica.name : 'Subir archivo'}
                          </span>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange(e, 'revisionTecnica')}
                            className="hidden"
                          />
                        </label>
                        {errors.revisionTecnica && <p className="text-red-500 text-xs mt-1">{errors.revisionTecnica}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Fecha de Vencimiento <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="revisionVencimiento"
                          value={formData.revisionVencimiento}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 md:py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff7a3d] focus:border-transparent transition-all text-base"
                        />
                        {errors.revisionVencimiento && <p className="text-red-500 text-xs mt-1">{errors.revisionVencimiento}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Permiso de Circulación */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Permiso de Circulación <span className="text-red-500">*</span>
                        </label>
                        <label className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                          <Upload className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600 truncate">
                            {formData.permisoCirculacion ? formData.permisoCirculacion.name : 'Subir archivo'}
                          </span>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange(e, 'permisoCirculacion')}
                            className="hidden"
                          />
                        </label>
                        {errors.permisoCirculacion && <p className="text-red-500 text-xs mt-1">{errors.permisoCirculacion}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Fecha de Vencimiento <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="permisoVencimiento"
                          value={formData.permisoVencimiento}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 md:py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff7a3d] focus:border-transparent transition-all text-base"
                        />
                        {errors.permisoVencimiento && <p className="text-red-500 text-xs mt-1">{errors.permisoVencimiento}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6 md:mt-8 pt-6 border-t border-gray-200">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center px-5 py-2.5 md:px-6 md:py-3 border-2 border-[#1e3a5f] text-[#1e3a5f] rounded-lg hover:bg-[#1e3a5f] hover:text-white transition-colors font-semibold text-sm md:text-base"
                >
                  <ChevronLeft className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2" />
                  Anterior
                </button>
              )}
              
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="ml-auto flex items-center px-5 py-2.5 md:px-6 md:py-3 bg-[#ff7a3d] text-white rounded-lg hover:bg-[#ff8c52] transition-colors font-semibold text-sm md:text-base"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 md:h-5 md:w-5 ml-1 md:ml-2" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="ml-auto flex items-center px-6 py-2.5 md:px-8 md:py-3 bg-[#ff7a3d] text-white rounded-lg hover:bg-[#ff8c52] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
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
              )}
            </div>
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