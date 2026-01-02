import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { User, Mail, Lock, Phone, Loader2, CreditCard } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface RegisterForm {
  nombre: string;
  apellido: string;
  rut: string;
  email: string;
  password: string;
  confirmPassword: string;
  telefono: string;
}

// Función para formatear RUT
const formatRut = (value: string) => {
  // Eliminar todo excepto números y K
  const cleaned = value.replace(/[^0-9kK]/g, '');
  
  if (cleaned.length === 0) return '';
  
  // Separar dígito verificador
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1).toUpperCase();
  
  // Formatear con puntos
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return body.length > 0 ? `${formatted}-${dv}` : '';
};

// Función para validar RUT chileno
const validateRut = (rut: string) => {
  // Limpiar RUT
  const cleaned = rut.replace(/[^0-9kK]/g, '');
  
  if (cleaned.length < 2) return false;
  
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1).toUpperCase();
  
  // Calcular dígito verificador
  let sum = 0;
  let multiplier = 2;
  
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const calculatedDv = 11 - (sum % 11);
  const expectedDv = calculatedDv === 11 ? '0' : calculatedDv === 10 ? 'K' : calculatedDv.toString();
  
  return dv === expectedDv;
};

export default function RegisterCliente() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>();

  const password = watch('password');

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRut(e.target.value);
    setValue('rut', formatted, { shouldValidate: true });
  };

  const onSubmit = async (data: RegisterForm) => {
    try {
      setLoading(true);
      const { confirmPassword, ...registerData } = data;

      const response = await api.post('/auth/register/cliente', registerData);

      if (response.data.success) {
        setAuth(response.data.data.user, response.data.data.token);
        toast.success('¡Cuenta creada exitosamente!');
        navigate('/cliente/dashboard');
      }
    } catch (error: any) {
      console.error('Error registro:', error);
      toast.error(error.response?.data?.message || 'Error al crear cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      {/* Register Form */}
      <section className="flex-1 py-10 md:py-16">
        <div className="max-w-md mx-auto px-4 md:px-6">
          {/* Title */}
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[#1e3a5f] mb-2 md:mb-3">
              Registro de Cliente
            </h1>
            <p className="text-gray-600 text-base md:text-lg">
              Crea tu cuenta y solicita grúas al instante
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-5">
              
              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold text-[#1e3a5f] mb-2">
                  Nombre
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    {...register('nombre', {
                      required: 'El nombre es requerido',
                      minLength: {
                        value: 2,
                        message: 'Mínimo 2 caracteres',
                      },
                    })}
                    className="w-full pl-11 pr-4 py-3 md:py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff7a3d] focus:border-transparent transition-all text-base"
                    placeholder="Nombre"
                  />
                </div>
                {errors.nombre && (
                  <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>
                )}
              </div>

              {/* Apellido */}
              <div>
                <label className="block text-sm font-semibold text-[#1e3a5f] mb-2">
                  Apellido
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    {...register('apellido', {
                      required: 'El apellido es requerido',
                      minLength: {
                        value: 2,
                        message: 'Mínimo 2 caracteres',
                      },
                    })}
                    className="w-full pl-11 pr-4 py-3 md:py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff7a3d] focus:border-transparent transition-all text-base"
                    placeholder="Apellido"
                  />
                </div>
                {errors.apellido && (
                  <p className="text-red-500 text-sm mt-1">{errors.apellido.message}</p>
                )}
              </div>

              {/* RUT */}
              <div>
                <label className="block text-sm font-semibold text-[#1e3a5f] mb-2">
                  RUT
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    {...register('rut', {
                      required: 'El RUT es requerido',
                      validate: (value) =>
                        validateRut(value) || 'RUT inválido',
                      onChange: handleRutChange,
                    })}
                    className="w-full pl-11 pr-4 py-3 md:py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff7a3d] focus:border-transparent transition-all text-base"
                    placeholder="12.345.678-9"
                    maxLength={12}
                  />
                </div>
                {errors.rut && (
                  <p className="text-red-500 text-sm mt-1">{errors.rut.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-[#1e3a5f] mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    {...register('email', {
                      required: 'El email es requerido',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email inválido',
                      },
                    })}
                    className="w-full pl-11 pr-4 py-3 md:py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff7a3d] focus:border-transparent transition-all text-base"
                    placeholder="tu@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-semibold text-[#1e3a5f] mb-2">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    {...register('telefono', {
                      required: 'El teléfono es requerido',
                      pattern: {
                        value: /^[0-9]{8,15}$/,
                        message: 'Teléfono inválido (8-15 dígitos)',
                      },
                    })}
                    className="w-full pl-11 pr-4 py-3 md:py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff7a3d] focus:border-transparent transition-all text-base"
                    placeholder="912345678"
                  />
                </div>
                {errors.telefono && (
                  <p className="text-red-500 text-sm mt-1">{errors.telefono.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-[#1e3a5f] mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    {...register('password', {
                      required: 'La contraseña es requerida',
                      minLength: {
                        value: 6,
                        message: 'Mínimo 6 caracteres',
                      },
                    })}
                    className="w-full pl-11 pr-4 py-3 md:py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff7a3d] focus:border-transparent transition-all text-base"
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-[#1e3a5f] mb-2">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    {...register('confirmPassword', {
                      required: 'Confirma tu contraseña',
                      validate: (value) =>
                        value === password || 'Las contraseñas no coinciden',
                    })}
                    className="w-full pl-11 pr-4 py-3 md:py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff7a3d] focus:border-transparent transition-all text-base"
                    placeholder="••••••••"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ff7a3d] text-white rounded-lg hover:bg-[#ff8c52] transition-all shadow-lg hover:shadow-xl font-semibold px-6 py-3.5 md:py-4 text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Creando cuenta...
                  </span>
                ) : (
                  'Crear Cuenta'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">¿Ya tienes cuenta?</span>
              </div>
            </div>

            {/* Login Link */}
            <Link
              to="/login"
              className="block w-full text-center bg-white text-[#1e3a5f] rounded-lg border-2 border-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white transition-all font-semibold px-6 py-3 text-sm md:text-base"
            >
              Iniciar Sesión
            </Link>
          </div>

          {/* Gruero Link */}
          <div className="text-center mt-6">
            <p className="text-sm md:text-base text-gray-600">
              ¿Eres conductor de grúa?{' '}
              <Link to="/register/gruero" className="text-[#ff7a3d] font-semibold hover:underline">
                Regístrate como Gruero
              </Link>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}