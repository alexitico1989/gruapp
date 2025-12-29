import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { User, Mail, Lock, Phone, Loader2 } from 'lucide-react';
import { GiTowTruck } from 'react-icons/gi';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface RegisterForm {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  confirmPassword: string;
  telefono: string;
}

export default function RegisterCliente() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const password = watch('password');

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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#1e3a5f] shadow-md">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="flex justify-between items-center" style={{ height: '60px' }}>
            <Link to="/" className="flex items-center space-x-2 cursor-pointer hover:opacity-90 transition-opacity">
              <GiTowTruck className="h-7 w-7 text-white" />
              <span className="text-[22px] font-bold tracking-tight">
                <span className="text-white">Gru</span>
                <span className="text-[#ff7a3d]">App</span>
              </span>
            </Link>

            <Link to="/" className="text-white text-[14px] hover:text-[#ff7a3d] transition-colors">
              Volver al inicio
            </Link>
          </div>
        </div>
      </header>

      {/* Register Form */}
      <section className="py-16">
        <div className="max-w-md mx-auto px-6">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#1e3a5f] mb-3">
              Registro de Cliente
            </h1>
            <p className="text-gray-600 text-lg">
              Crea tu cuenta y solicita grúas al instante
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                    className="input pl-11 w-full"
                    placeholder="Luis"
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
                    className="input pl-11 w-full"
                    placeholder="Monardes"
                  />
                </div>
                {errors.apellido && (
                  <p className="text-red-500 text-sm mt-1">{errors.apellido.message}</p>
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
                    className="input pl-11 w-full"
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
                    className="input pl-11 w-full"
                    placeholder="+56912345678"
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
                    className="input pl-11 w-full"
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
                    className="input pl-11 w-full"
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
                className="w-full bg-[#ff7a3d] text-white rounded-lg hover:bg-[#ff8c52] transition-all shadow-lg hover:shadow-xl font-semibold px-6 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed mt-6"
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
              className="block w-full text-center bg-white text-[#1e3a5f] rounded-lg border-2 border-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white transition-all font-semibold px-6 py-3"
            >
              Iniciar Sesión
            </Link>
          </div>

          {/* Gruero Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              ¿Eres conductor de grúa?{' '}
              <Link to="/register/gruero" className="text-[#ff7a3d] font-semibold hover:underline">
                Regístrate como Gruero
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-8 border-t border-gray-100">
        <div className="max-w-[1300px] mx-auto px-8 text-center">
          <p className="text-gray-400 text-sm">
            <span className="text-[#1e3a5f] font-bold">Gru</span>
            <span className="text-[#ff7a3d] font-bold">App</span>
          </p>
          <p className="text-gray-400 text-xs mt-1">© 2025 GruApp. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}