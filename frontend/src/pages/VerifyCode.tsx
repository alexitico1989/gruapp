// frontend/src/pages/VerifyCode.tsx

import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Shield, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function VerifyCode() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    
    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setCode(newCode);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fullCode = code.join('');

    if (fullCode.length !== 6) {
      toast.error('Ingresa el código completo');
      return;
    }

    try {
      setLoading(true);

      const response = await api.post('/auth/verify-code', {
        email,
        code: fullCode,
      });

      if (response.data.success) {
        toast.success('Código verificado');
        navigate('/reset-password', {
          state: { email, code: fullCode },
        });
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Código inválido');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setResending(true);

      const response = await api.post('/auth/resend-code', { email });

      if (response.data.success) {
        toast.success('Nuevo código enviado');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Error al reenviar código');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-[#1e3a5f]" />
              </div>
              <h2 className="text-2xl font-bold text-[#1e3a5f]">
                Verificar Código
              </h2>
              <p className="text-gray-600 mt-2">
                Ingresa el código de 6 dígitos que enviamos a
              </p>
              <p className="text-[#ff7a3d] font-semibold mt-1">{email}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex gap-2 justify-center">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff7a3d] focus:border-[#ff7a3d] transition-all"
                    disabled={loading}
                  />
                ))}
              </div>

              <p className="text-center text-sm text-gray-500">
                El código expira en 15 minutos
              </p>

              <button
                type="submit"
                disabled={loading || code.join('').length !== 6}
                className="w-full bg-[#ff7a3d] text-white py-3.5 rounded-lg font-semibold hover:bg-[#ff8c52] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Verificando...
                  </>
                ) : (
                  'Verificar Código'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={handleResendCode}
                disabled={resending}
                className="text-[#1e3a5f] hover:text-[#ff7a3d] transition-colors font-medium inline-flex items-center disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${resending ? 'animate-spin' : ''}`} />
                Reenviar código
              </button>
            </div>

            <div className="mt-6">
              <Link
                to="/forgot-password"
                className="flex items-center justify-center text-gray-600 hover:text-[#ff7a3d] transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cambiar email
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}