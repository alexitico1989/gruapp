import { Link } from 'react-router-dom';
import { GiTowTruck } from 'react-icons/gi';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-white py-12 md:py-20">
        <div className="max-w-[1300px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            {/* MÓVIL: TEXTO PRIMERO */}
            <div className="lg:pl-4 order-2 lg:order-1">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-[#1e3a5f] leading-tight mb-4 lg:mb-6">
                ¡Tu Asistencia en Ruta es{' '}
                <span className="text-[#ff7a3d]">INMEDIATA!</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-600 mb-6 lg:mb-10 leading-relaxed">
                Solicita grúas 24/7. Llega Rápido, Paga lo Justo.
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-5 mb-10 lg:mb-16">
                <Link 
                  to="/register/cliente"
                  className="bg-[#ff7a3d] text-white rounded-lg hover:bg-[#ff8c52] transition-all shadow-lg hover:shadow-xl font-semibold px-8 py-3 lg:px-9 lg:py-4 text-base lg:text-lg text-center"
                >
                  Solicitar Grúa ¡Ahora!
                </Link>
                <Link 
                  to="/tarifas"
                  className="bg-white text-[#1e3a5f] rounded-lg border-2 border-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white transition-all font-semibold px-8 py-3 lg:px-9 lg:py-4 text-base lg:text-lg text-center"
                >
                  Conoce Nuestras Tarifas
                </Link>
              </div>

              {/* 3 ICONOS - RESPONSIVE */}
              <div className="grid grid-cols-3 gap-4 sm:gap-8 lg:flex lg:items-start lg:gap-12">
                <div className="text-center">
                  <svg className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 mx-auto mb-2 lg:mb-3 text-[#1e3a5f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth="1.5"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6l4 2"/>
                  </svg>
                  <p className="text-[#1e3a5f] font-semibold text-sm sm:text-base">Llegada Rápida</p>
                  <p className="text-gray-500 text-xs sm:text-sm">Garantizada</p>
                </div>

                <div className="text-center">
                  <svg className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 mx-auto mb-2 lg:mb-3 text-[#1e3a5f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                  <p className="text-[#1e3a5f] font-semibold text-sm sm:text-base">Conductores</p>
                  <p className="text-gray-500 text-xs sm:text-sm">Verificados</p>
                </div>

                <div className="text-center">
                  <svg className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 mx-auto mb-2 lg:mb-3 text-[#1e3a5f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p className="text-[#1e3a5f] font-semibold text-sm sm:text-base">Precios</p>
                  <p className="text-gray-500 text-xs sm:text-sm">Transparentes</p>
                </div>
              </div>
            </div>

            {/* MOCKUP DEL CELULAR - REDUCIDO EN MÓVIL */}
            <div className="flex justify-center order-1 lg:order-2">
              <div className="relative scale-75 sm:scale-90 lg:scale-100">
                <div className="absolute bg-gray-200 rounded-full opacity-30 w-24 h-24 -top-4 -left-6"></div>
                <div className="absolute bg-gray-200 rounded-full opacity-25 w-16 h-16 top-24 -right-8"></div>
                <div className="absolute bg-gray-200 rounded-full opacity-25 w-20 h-20 bottom-10 left-4"></div>

                <div className="relative bg-[#1e3a5f] rounded-[36px] shadow-2xl p-3 w-[280px] z-10">
                  <div className="bg-white rounded-[28px] overflow-hidden">
                    <div className="h-7 bg-white flex items-center justify-center">
                      <div className="w-24 h-1 bg-gray-300 rounded-full"></div>
                    </div>

                    <div className="relative h-[480px] bg-gradient-to-br from-green-50 via-blue-50 to-green-50">
                      <div className="absolute inset-0 opacity-15">
                        <div 
                          className="w-full h-full"
                          style={{
                            backgroundImage: 'linear-gradient(#9ca3af 1px, transparent 1px), linear-gradient(90deg, #9ca3af 1px, transparent 1px)',
                            backgroundSize: '35px 35px'
                          }}
                        />
                      </div>

                      <div className="absolute top-16 left-12">
                        <div className="w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
                        <div className="w-0.5 h-2.5 bg-green-500 mx-auto"></div>
                      </div>

                      <div className="absolute bottom-20 right-12">
                        <div className="w-3.5 h-3.5 bg-[#ff7a3d] rounded-full border-2 border-white shadow-lg"></div>
                        <div className="w-0.5 h-2.5 bg-[#ff7a3d] mx-auto"></div>
                      </div>

                      <svg className="absolute inset-0 w-full h-full pointer-events-none z-[1]">
                        <path 
                          d="M 60 80 Q 140 180 220 380" 
                          stroke="#ff7a3d" 
                          strokeWidth="2" 
                          fill="none"
                          strokeDasharray="8,6"
                          strokeLinecap="round"
                        />
                      </svg>

                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                        <div className="bg-white rounded-full shadow-2xl border-4 border-[#1e3a5f] p-5">
                          <GiTowTruck className="w-11 h-11 text-[#ff7a3d]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Banner - RESPONSIVE */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="max-w-[1300px] mx-auto px-4 md:px-8">
          <div className="bg-gray-100 rounded-2xl px-6 py-8 md:px-12 md:py-10 flex flex-col md:flex-row items-center justify-between md:justify-end gap-6 md:gap-10 shadow-sm">
            <div className="text-center md:text-right">
              <h2 className="text-[#1e3a5f] font-bold text-3xl md:text-4xl mb-2">
                ¿Eres Gruero?
              </h2>
              <p className="text-[#1e3a5f] font-medium text-xl md:text-2xl">
                ¡Únete y Gana Más!
              </p>
            </div>
            <Link
              to="/register/gruero"
              className="bg-[#ff7a3d] text-white rounded-lg hover:bg-[#ff8c52] transition-all shadow-lg hover:shadow-xl font-semibold px-8 py-3 md:px-9 md:py-4 text-base md:text-lg whitespace-nowrap w-full md:w-auto text-center"
            >
              Registra tu Grúa
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}