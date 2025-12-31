import { Link } from 'react-router-dom';
import { GiTowTruck } from 'react-icons/gi';
import { FaFacebook, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#1e3a5f] shadow-md sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="flex justify-between items-center" style={{ height: '60px' }}>
            <Link to="/" className="flex items-center space-x-2 cursor-pointer hover:opacity-90 transition-opacity">
              <GiTowTruck className="h-7 w-7 text-white" />
              <span className="text-[22px] font-bold tracking-tight">
                <span className="text-white">Gru</span>
                <span className="text-[#ff7a3d]">App</span>
              </span>
            </Link>

            <nav className="hidden lg:flex items-center space-x-8">
              <a href="#servicios" className="text-white text-[15px] hover:text-[#ff7a3d] transition-colors">
                Servicios
              </a>
              <a href="#conductores" className="text-white text-[15px] hover:text-[#ff7a3d] transition-colors">
                Para Conductores
              </a>
              <a href="#empresas" className="text-white text-[15px] hover:text-[#ff7a3d] transition-colors">
                Empresas
              </a>
              <a href="#tarifas" className="text-white text-[15px] hover:text-[#ff7a3d] transition-colors">
                Tarifas
              </a>
              <Link 
                to="/login" 
                className="bg-[#2d4a6f] text-white px-5 py-2 rounded-md hover:bg-[#3d5a7f] transition-colors text-[14px]"
              >
                Iniciar Sesión
              </Link>
              <Link 
                to="/register/cliente" 
                className="bg-[#ff7a3d] text-white px-5 py-2 rounded-md hover:bg-[#ff8c52] transition-colors text-[14px] font-semibold"
              >
                Regístrate
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white py-20">
        <div className="max-w-[1300px] mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="flex justify-center">
              <div className="relative">
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

            <div className="lg:pl-4">
              <h1 className="text-6xl lg:text-7xl font-bold text-[#1e3a5f] leading-tight mb-6">
                ¡Tu Asistencia en Ruta es{' '}
                <span className="text-[#ff7a3d]">INMEDIATA!</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Solicita grúas 24/7. Llega Rápido, Paga lo Justo.
              </p>

              <div className="flex flex-wrap gap-5 mb-16">
                <Link 
                  to="/register/cliente"
                  className="bg-[#ff7a3d] text-white rounded-lg hover:bg-[#ff8c52] transition-all shadow-lg hover:shadow-xl font-semibold px-9 py-4 text-lg"
                >
                  Solicitar Grúa ¡Ahora!
                </Link>
                <a 
                  href="#tarifas"
                  className="bg-white text-[#1e3a5f] rounded-lg border-2 border-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white transition-all font-semibold px-9 py-4 text-lg"
                >
                  Conoce Nuestras Tarifas
                </a>
              </div>

              <div className="flex items-start gap-16">
                <div className="text-center">
                  <svg className="w-14 h-14 mx-auto mb-3 text-[#1e3a5f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth="1.5"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6l4 2"/>
                  </svg>
                  <p className="text-[#1e3a5f] font-semibold text-base">Llegada Rápida</p>
                  <p className="text-gray-500 text-sm">Garantizada</p>
                </div>

                <div className="text-center">
                  <svg className="w-14 h-14 mx-auto mb-3 text-[#1e3a5f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                  <p className="text-[#1e3a5f] font-semibold text-base">Conductores</p>
                  <p className="text-gray-500 text-sm">Verificados</p>
                </div>

                <div className="text-center">
                  <svg className="w-14 h-14 mx-auto mb-3 text-[#1e3a5f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p className="text-[#1e3a5f] font-semibold text-base">Precios</p>
                  <p className="text-gray-500 text-sm">Transparentes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Servicios Section */}
      <section id="servicios" className="bg-gray-50 py-20">
        <div className="max-w-[1300px] mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-[#1e3a5f] mb-4">Nuestros Servicios</h2>
            <p className="text-xl text-gray-600">Contamos con diferentes tipos de grúas para cada necesidad</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-[#ff7a3d] bg-opacity-10 rounded-xl flex items-center justify-center mb-6">
                <GiTowTruck className="w-10 h-10 text-[#ff7a3d]" />
              </div>
              <h3 className="text-2xl font-bold text-[#1e3a5f] mb-4">Grúa Cama Baja</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Ideal para vehículos livianos y medianos. Sistema hidráulico que garantiza la seguridad de tu vehículo durante el traslado.
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Automóviles y SUVs</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Camionetas livianas</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Hasta 3.5 toneladas</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-[#ff7a3d] bg-opacity-10 rounded-xl flex items-center justify-center mb-6">
                <GiTowTruck className="w-10 h-10 text-[#ff7a3d]" />
              </div>
              <h3 className="text-2xl font-bold text-[#1e3a5f] mb-4">Grúa Horquilla</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Perfecta para remolques y vehículos con el eje trasero dañado. Levantamiento por las ruedas delanteras o traseras.
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Vehículos tracción 4x4</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Camionetas medianas</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Traslados urbanos</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-[#ff7a3d] bg-opacity-10 rounded-xl flex items-center justify-center mb-6">
                <GiTowTruck className="w-10 h-10 text-[#ff7a3d]" />
              </div>
              <h3 className="text-2xl font-bold text-[#1e3a5f] mb-4">Grúa Pluma</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Especializada en vehículos pesados y situaciones complejas. Brazo hidráulico de alta capacidad para cualquier emergencia.
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Camiones y buses</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Vehículos pesados</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Rescates complejos</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Para Conductores Section */}
      <section id="conductores" className="bg-white py-20">
        <div className="max-w-[1300px] mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-[#1e3a5f] mb-4">¿Por qué ser Gruero en GruApp?</h2>
            <p className="text-xl text-gray-600">Únete a nuestra red y aumenta tus ingresos</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#ff7a3d] bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#ff7a3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#1e3a5f] mb-2">Gana Más Dinero</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Recibe solicitudes constantes y aumenta tus ingresos mensuales. Sin cupos limitados ni restricciones horarias.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#ff7a3d] bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#ff7a3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#1e3a5f] mb-2">Trabaja a Tu Ritmo</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Tú decides cuándo trabajar. Activa o desactiva tu disponibilidad cuando quieras, sin compromisos fijos.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#ff7a3d] bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#ff7a3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#1e3a5f] mb-2">Pagos Seguros</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Recibe tus pagos de forma automática y segura a través de Mercado Pago. Sin intermediarios ni demoras.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#ff7a3d] bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#ff7a3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#1e3a5f] mb-2">Red de Clientes</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Accede a miles de usuarios que necesitan tus servicios. Amplía tu cartera de clientes día a día.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-12">
              <h3 className="text-3xl font-bold text-[#1e3a5f] mb-8">Requisitos para Unirte</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-gray-700 text-lg">Licencia de conducir clase A3 o superior vigente</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-gray-700 text-lg">Grúa propia con documentación al día</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-gray-700 text-lg">Seguro obligatorio vigente (SOAP)</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-gray-700 text-lg">Revisión técnica al día</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-gray-700 text-lg">Smartphone con GPS activo</span>
                </li>
              </ul>
              <Link
                to="/register/gruero"
                className="mt-8 w-full block text-center bg-[#ff7a3d] text-white rounded-lg hover:bg-[#ff8c52] transition-all shadow-lg hover:shadow-xl font-semibold px-9 py-4 text-lg"
              >
                Registra tu Grúa Ahora
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Empresas Section */}
      <section id="empresas" className="bg-gray-50 py-20">
        <div className="max-w-[1300px] mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-[#1e3a5f] mb-4">Soluciones para Empresas</h2>
            <p className="text-xl text-gray-600">Gestiona la flota de tu empresa de forma eficiente</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-white rounded-2xl p-12 shadow-sm">
              <h3 className="text-3xl font-bold text-[#1e3a5f] mb-8">Beneficios Corporativos</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#ff7a3d] bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-[#ff7a3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-[#1e3a5f] mb-2">Facturación Centralizada</h4>
                    <p className="text-gray-600">Recibe una sola factura mensual con todos los servicios de tu flota.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#ff7a3d] bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-[#ff7a3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-[#1e3a5f] mb-2">Reportes Detallados</h4>
                    <p className="text-gray-600">Accede a estadísticas y reportes completos de uso y costos.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#ff7a3d] bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-[#ff7a3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-[#1e3a5f] mb-2">Tarifas Preferenciales</h4>
                    <p className="text-gray-600">Descuentos especiales por volumen de servicios contratados.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#ff7a3d] bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-[#ff7a3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-[#1e3a5f] mb-2">Soporte Dedicado</h4>
                    <p className="text-gray-600">Ejecutivo exclusivo para atender las necesidades de tu empresa.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#1e3a5f] rounded-2xl p-12 text-white">
              <h3 className="text-3xl font-bold mb-6">¿Interesado en un Plan Empresarial?</h3>
              <p className="text-lg mb-8 text-gray-200 leading-relaxed">
                Contáctanos y obtén una propuesta personalizada para tu empresa. Gestionamos flotas desde 5 hasta más de 100 vehículos.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-[#ff7a3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  <span>contacto@gruappchile.cl</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-[#ff7a3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                  <span>+56 9 6183 3876</span>
                </div>
              </div>

              <a
                href="https://wa.me/56961833876?text=Hola%2C%20me%20interesa%20el%20plan%20empresarial%20de%20GruApp"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block text-center bg-[#ff7a3d] text-white rounded-lg hover:bg-[#ff8c52] transition-all shadow-lg hover:shadow-xl font-semibold px-9 py-4 text-lg"
              >
                Contactar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Tarifas Section */}
      <section id="tarifas" className="bg-white py-20">
        <div className="max-w-[1300px] mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-[#1e3a5f] mb-4">Tarifas Transparentes</h2>
            <p className="text-xl text-gray-600">Sin sorpresas, sin cobros ocultos</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div className="bg-gray-50 rounded-2xl p-12">
              <h3 className="text-3xl font-bold text-[#1e3a5f] mb-8">¿Cuánto cuesta mi servicio?</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-[#1e3a5f]">Tarifa Base</span>
                    <span className="text-2xl font-bold text-[#ff7a3d]">$25.000</span>
                  </div>
                  <p className="text-gray-600 text-sm">Incluye los primeros kilómetros de servicio</p>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-[#1e3a5f]">Por Kilómetro Adicional</span>
                    <span className="text-2xl font-bold text-[#ff7a3d]">$1.350</span>
                  </div>
                  <p className="text-gray-600 text-sm">Cada kilómetro recorrido</p>
                </div>

                <div className="bg-white rounded-xl p-6 border-2 border-[#ff7a3d]">
                  <h4 className="font-bold text-[#1e3a5f] mb-4">Ejemplo de Cálculo:</h4>
                  <div className="space-y-2 text-gray-700">
                    <div className="flex justify-between">
                      <span>Tarifa base:</span>
                      <span>$25.000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>10 km × $1.350:</span>
                      <span>$13.500</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span className="text-[#ff7a3d]">$38.500</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-[#1e3a5f] mb-8">¿Qué incluye el servicio?</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <div>
                    <h4 className="text-xl font-bold text-[#1e3a5f] mb-1">Grúa Certificada</h4>
                    <p className="text-gray-600">Vehículos con revisión técnica al día y seguros vigentes</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <div>
                    <h4 className="text-xl font-bold text-[#1e3a5f] mb-1">Conductor Profesional</h4>
                    <p className="text-gray-600">Grueros verificados con experiencia comprobada</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <div>
                    <h4 className="text-xl font-bold text-[#1e3a5f] mb-1">Tracking en Tiempo Real</h4>
                    <p className="text-gray-600">Seguimiento GPS del gruero hasta tu ubicación</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <div>
                    <h4 className="text-xl font-bold text-[#1e3a5f] mb-1">Pago Seguro</h4>
                    <p className="text-gray-600">Procesamiento 100% seguro con Mercado Pago</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <div>
                    <h4 className="text-xl font-bold text-[#1e3a5f] mb-1">Soporte 24/7</h4>
                    <p className="text-gray-600">Asistencia disponible todos los días del año</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-[#ff7a3d] bg-opacity-10 border-2 border-[#ff7a3d] rounded-xl p-6">
                <p className="text-[#1e3a5f] font-semibold text-center">
                  💡 Tip: Los precios se calculan automáticamente según la distancia real del servicio
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-[1300px] mx-auto px-8">
          <div className="bg-gray-100 rounded-2xl px-12 py-10 flex items-center justify-end gap-10 shadow-sm">
            <div className="text-right">
              <h2 className="text-[#1e3a5f] font-bold text-4xl mb-2">
                ¿Eres Gruero?
              </h2>
              <p className="text-[#1e3a5f] font-medium text-2xl">
                ¡Únete y Gana Más!
              </p>
            </div>
            <Link
              to="/register/gruero"
              className="bg-[#ff7a3d] text-white rounded-lg hover:bg-[#ff8c52] transition-all shadow-lg hover:shadow-xl font-semibold px-9 py-4 text-lg whitespace-nowrap"
            >
              Registra tu Grúa
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-gray-200">
        <div className="max-w-[1300px] mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-8">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <GiTowTruck className="h-8 w-8 text-[#1e3a5f]" />
                <span className="text-2xl font-bold">
                  <span className="text-[#1e3a5f]">Gru</span>
                  <span className="text-[#ff7a3d]">App</span>
                </span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Tu asistencia en ruta de forma rápida, segura y transparente. Disponible 24/7 en todo Chile.
              </p>
              <div className="flex gap-3">
                <a href="https://facebook.com/gruappchile" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-[#ff7a3d] hover:text-white transition-all">
                  <FaFacebook className="w-5 h-5" />
                </a>
                <a href="https://instagram.com/gruappchile" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-[#ff7a3d] hover:text-white transition-all">
                  <FaInstagram className="w-5 h-5" />
                </a>
                <a href="https://tiktok.com/@gruappchile" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-[#ff7a3d] hover:text-white transition-all">
                  <FaTiktok className="w-5 h-5" />
                </a>
                <a href="https://wa.me/56961833876" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-[#ff7a3d] hover:text-white transition-all">
                  <FaWhatsapp className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-[#1e3a5f] font-bold text-lg mb-4">Empresa</h3>
              <ul className="space-y-2">
                <li><a href="#servicios" className="text-gray-600 hover:text-[#ff7a3d] transition-colors text-sm">Servicios</a></li>
                <li><a href="#conductores" className="text-gray-600 hover:text-[#ff7a3d] transition-colors text-sm">Para Conductores</a></li>
                <li><a href="#empresas" className="text-gray-600 hover:text-[#ff7a3d] transition-colors text-sm">Empresas</a></li>
                <li><a href="#tarifas" className="text-gray-600 hover:text-[#ff7a3d] transition-colors text-sm">Tarifas</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-[#1e3a5f] font-bold text-lg mb-4">Soporte</h3>
              <ul className="space-y-2">
                <li><Link to="/ayuda" className="text-gray-600 hover:text-[#ff7a3d] transition-colors text-sm">Ayuda y FAQ</Link></li>
                <li><Link to="/contacto" className="text-gray-600 hover:text-[#ff7a3d] transition-colors text-sm">Contacto</Link></li>
                <li>
                  <a href="https://wa.me/56961833876?text=Hola%2C%20necesito%20ayuda%20con%20GruApp" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#ff7a3d] transition-colors text-sm">
                    WhatsApp Soporte
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[#1e3a5f] font-bold text-lg mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link to="/terminos" className="text-gray-600 hover:text-[#ff7a3d] transition-colors text-sm">Términos y Condiciones</Link></li>
                <li><Link to="/privacidad" className="text-gray-600 hover:text-[#ff7a3d] transition-colors text-sm">Políticas de Privacidad</Link></li>
                <li><Link to="/cookies" className="text-gray-600 hover:text-[#ff7a3d] transition-colors text-sm">Política de Cookies</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 text-center">
            <p className="text-gray-500 text-sm">
              © 2025 GruApp Chile. Todos los derechos reservados.
            </p>
            <p className="text-gray-400 text-xs mt-2">
              Servicio de intermediación de grúas operando bajo la normativa chilena vigente.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}