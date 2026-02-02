import { Link } from 'react-router-dom';
import { GiTowTruck } from 'react-icons/gi';
import Header from '../components/Header';
import Footer from '../components/Footer';

// ✅ Link del APK en GitHub Releases
const APK_DOWNLOAD_URL = 'https://github.com/alexitico1989/gruapp/releases/download/v1.0.0/gruapp.apk';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-white py-12 md:py-20">
        <div className="max-w-[1300px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            {/* TEXTO */}
            <div className="lg:pl-4 order-2 lg:order-1">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-[#1e3a5f] leading-tight mb-4 lg:mb-6">
                ¡Tu Asistencia en Ruta es{' '}
                <span className="text-[#ff7a3d]">INMEDIATA!</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-600 mb-6 lg:mb-8 leading-relaxed">
                Solicita grúas 24/7. Llega Rápido, Paga lo Justo. Descarga la app y listo.
              </p>

              {/* DESCARGA DIRECTA APK - PROTAGONISTA */}
              <div className="mb-8 lg:mb-10">
                <a
                  href={APK_DOWNLOAD_URL}
                  download
                  className="inline-flex items-center justify-center gap-3 bg-[#ff7a3d] text-white rounded-xl hover:bg-[#ff8c52] transition-all shadow-2xl hover:shadow-[#ff7a3d]/50 hover:scale-105 font-bold px-8 py-4 text-lg w-full sm:w-auto animate-pulse hover:animate-none"
                >
                  <svg className="w-7 h-7 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-sm font-normal opacity-90">Descarga Ahora</div>
                    <div className="text-lg font-bold">GruApp para Android (APK)</div>
                  </div>
                </a>
                <p className="text-sm text-gray-500 mt-3 text-center sm:text-left">
                  💡 Descarga directa • Sin Play Store • Instalación inmediata
                </p>
              </div>

              {/* BOTONES PLAY STORE / APP STORE - PRÓXIMAMENTE */}
              <div className="mb-10 lg:mb-12">
                <p className="text-sm font-semibold text-gray-600 mb-3">También disponible próximamente en:</p>
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                  {/* Google Play - Deshabilitado */}
                  <div className="flex items-center gap-3 bg-gray-100 text-gray-400 rounded-lg px-5 py-3 cursor-not-allowed opacity-60">
                    <svg className="w-7 h-7 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3.18 23.76c.3.17.68.19 1.02 0l11.45-6.61-3.62-3.62-8.85 10.23zM.53 1.18C.2 1.5 0 2.02 0 2.74v18.52c0 .72.2 1.24.53 1.56l.08.08 10.37-10.37v-.16L.61 1.1l-.08.08zM18.49 10.5l3.08-3.08c.64-.36 1.04-.86 1.04-1.56 0-.7-.4-1.2-1.04-1.56l-14.15-8.17c-.34-.2-.72-.18-1.02 0l11.47 11.47 3.62-3.6z"/>
                    </svg>
                    <div className="text-left">
                      <div className="text-xs">Próximamente en</div>
                      <div className="font-semibold text-sm">Google Play</div>
                    </div>
                  </div>

                  {/* App Store - Deshabilitado */}
                  <div className="flex items-center gap-3 bg-gray-100 text-gray-400 rounded-lg px-5 py-3 cursor-not-allowed opacity-60">
                    <svg className="w-7 h-7 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    <div className="text-left">
                      <div className="text-xs">Próximamente en</div>
                      <div className="font-semibold text-sm">App Store</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3 ICONOS */}
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

            {/* MOCKUP DEL CELULAR */}
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

      <Footer />
    </div>
  );
}