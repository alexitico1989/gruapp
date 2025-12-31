import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] py-20 lg:py-32">
        <div className="max-w-[1300px] mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                Tu Grúa en <span className="text-[#ff7a3d]">Minutos</span>
              </h1>
              <p className="text-xl lg:text-2xl mb-8 text-gray-200 leading-relaxed">
                Conectamos usuarios con grueros profesionales en tiempo real. Servicio rápido, seguro y transparente.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register/cliente"
                  className="bg-[#ff7a3d] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#ff8c52] transition-all shadow-lg hover:shadow-xl text-center"
                >
                  Solicitar Grúa
                </Link>
                <Link
                  to="/register/gruero"
                  className="bg-white text-[#1e3a5f] px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl text-center"
                >
                  Ser Gruero
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&q=80&w=800"
                  alt="Mockup GruApp"
                  className="w-full rounded-lg"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-[#ff7a3d] rounded-full opacity-20 blur-3xl"></div>
              <div className="absolute -top-6 -left-6 w-64 h-64 bg-blue-400 rounded-full opacity-20 blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section para Grueros */}
      <section className="bg-[#ff7a3d] py-16">
        <div className="max-w-[1300px] mx-auto px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            ¿Eres Gruero? Aumenta tus Ingresos
          </h2>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto opacity-95">
            Únete a nuestra red de conductores profesionales y recibe solicitudes constantes. Sin cupos limitados.
          </p>
          <Link
            to="/register/gruero"
            className="inline-block bg-white text-[#ff7a3d] px-12 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
          >
            Registra tu Grúa Ahora
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}