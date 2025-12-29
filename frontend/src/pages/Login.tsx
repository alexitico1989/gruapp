import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { GiTowTruck } from 'react-icons/gi';
import { useAuthStore } from '../store/authStore';
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

      {/* Login Form */}
      <section className="py-20">
        <div className="max-w-md mx-auto px-6">
          {/* Title */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-[#1e3a5f] mb-3">
              Iniciar Sesión
            </h1>
            <p className="text-gray-600 text-lg">
              Bienvenido de vuelta a GruApp
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ff7a3d] text-white rounded-lg hover:bg-[#ff8c52] transition-all shadow-lg hover:shadow-xl font-semibold px-6 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="relative my-8">
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
                className="block w-full text-center bg-white text-[#1e3a5f] rounded-lg border-2 border-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white transition-all font-semibold px-6 py-3"
              >
                Registrarme como Cliente
              </Link>
              <Link
                to="/register/gruero"
                className="block w-full text-center bg-gray-100 text-[#1e3a5f] rounded-lg hover:bg-gray-200 transition-all font-semibold px-6 py-3"
              >
                Registrarme como Gruero
              </Link>
            </div>
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