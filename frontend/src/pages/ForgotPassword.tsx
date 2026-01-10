// frontend/src/pages/ForgotPassword.tsx

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Ingresa tu email');
      return;
    }

    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      toast.error('Email inválido');
      return;
    }

    try {
      setLoading(true);

      const response = await api.post('/auth/forgot-password', { email });

      if (response.data.success) {
        toast.success('Código enviado a tu email');
        navigate('/verify-code', { state: { email } });
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Error al enviar el código');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="h-8 w-8 text-[#ff7a3d]" />
              </div>
              <h2 className="text-2xl font-bold text-[#1e3a5f]">
                ¿Olvidaste tu contraseña?
              </h2>
              <p className="text-gray-600 mt-2">
                Ingresa tu email y te enviaremos un código de verificación
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#1e3a5f] mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff7a3d] focus:border-transparent transition-all"
                    placeholder="tu@email.com"
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ff7a3d] text-white py-3.5 rounded-lg font-semibold hover:bg-[#ff8c52] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Enviando...
                  </>
                ) : (
                  'Enviar Código'
                )}
              </button>
            </form>

            <div className="mt-6">
              <Link
                to="/login"
                className="flex items-center justify-center text-[#1e3a5f] hover:text-[#ff7a3d] transition-colors font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al inicio de sesión
              </Link>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿No recibes el código?{' '}
              <a href="mailto:soporte@gruapp.cl" className="text-[#ff7a3d] hover:underline font-semibold">
                Contáctanos
              </a>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}