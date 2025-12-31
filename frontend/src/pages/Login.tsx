import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface LoginForm {
  email: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', data);

      if (response.data.success) {
        setAuth(response.data.data.user, response.data.data.token);
        toast.success('¡Bienvenido de vuelta!');

        // Redirigir según el rol
        if (response.data.data.user.role === 'CLIENTE') {
          navigate('/cliente/dashboard');
        } else if (response.data.data.user.role === 'GRUERO') {
          navigate('/gruero/dashboard');
        }
      }
    } catch (error: any) {
      console.error('Error login:', error);
      toast.error(error.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      {/* Login Form */}
      <section className="flex-1 py-12 md:py-20">
        <div className="max-w-md mx-auto px-4 md:px-6">
          {/* Title */}
          <div className="text-center mb-8 md:mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-[#1e3a5f] mb-2 md:mb-3">
              Iniciar Sesión
            </h1>
            <p className="text-gray-600 text-base md:text-lg">
              Bienvenido de vuelta a GruApp
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 md:space-y-6">
              
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ff7a3d] text-white rounded-lg hover:bg-[#ff8c52] transition-all shadow-lg hover:shadow-xl font-semibold px-6 py-3.5 md:py-4 text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Ingresando...
                  </span>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6 md:my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">¿No tienes cuenta?</span>
              </div>
            </div>

            {/* Register Links */}
            <div className="space-y-3">
              <Link
                to="/register/cliente"
                className="block w-full text-center bg-white text-[#1e3a5f] rounded-lg border-2 border-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white transition-all font-semibold px-6 py-3 text-sm md:text-base"
              >
                Registrarme como Cliente
              </Link>
              <Link
                to="/register/gruero"
                className="block w-full text-center bg-gray-100 text-[#1e3a5f] rounded-lg hover:bg-gray-200 transition-all font-semibold px-6 py-3 text-sm md:text-base"
              >
                Registrarme como Gruero
              </Link>
            </div>
          </div>

          {/* Helper Text */}
          <p className="text-center text-gray-500 text-sm mt-6">
            ¿Problemas para ingresar?{' '}
            <a href="mailto:contacto@gruappchile.cl" className="text-[#ff7a3d] hover:underline font-semibold">
              Contáctanos
            </a>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}