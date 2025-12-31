import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Empresas() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] py-20">
        <div className="max-w-[1300px] mx-auto px-8 text-center">
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
            Soluciones para Empresas
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Gestiona la flota de tu empresa de forma eficiente con planes corporativos diseñados para tus necesidades.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-[1300px] mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100">
              <h3 className="text-3xl font-bold text-[#1e3a5f] mb-8">Beneficios Corporativos</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#ff7a3d] bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#ff7a3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-[#1e3a5f] mb-2">Facturación Centralizada</h4>
                    <p className="text-gray-600">Recibe una sola factura mensual con todos los servicios de tu flota.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#ff7a3d] bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#ff7a3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-[#1e3a5f] mb-2">Reportes Detallados</h4>
                    <p className="text-gray-600">Accede a estadísticas y reportes completos de uso y costos.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#ff7a3d] bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#ff7a3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-[#1e3a5f] mb-2">Tarifas Preferenciales</h4>
                    <p className="text-gray-600">Descuentos especiales por volumen de servicios.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#ff7a3d] bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#ff7a3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-[#1e3a5f] mb-2">Soporte Dedicado</h4>
                    <p className="text-gray-600">Ejecutivo exclusivo para tu empresa 24/7.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#1e3a5f] rounded-2xl p-12 text-white">
              <h3 className="text-3xl font-bold mb-6">¿Interesado en un Plan Empresarial?</h3>
              <p className="text-lg mb-8 text-gray-200 leading-relaxed">
                Contáctanos y obtén una propuesta personalizada para tu empresa.
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
                href="https://wa.me/56961833876?text=Hola%2C%20me%20interesa%20el%20plan%20empresarial"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block text-center bg-[#ff7a3d] text-white rounded-lg hover:bg-[#ff8c52] transition-all shadow-lg font-semibold px-9 py-4 text-lg"
              >
                Contactar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-20">
        <div className="max-w-[1300px] mx-auto px-8">
          <h2 className="text-4xl font-bold text-[#1e3a5f] text-center mb-4">Planes Empresariales</h2>
          <p className="text-xl text-gray-600 text-center mb-16">
            Elige el plan que mejor se adapte al tamaño de tu flota
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200">
              <h3 className="text-2xl font-bold text-[#1e3a5f] mb-2">Plan Básico</h3>
              <p className="text-gray-600 mb-6">Para empresas pequeñas</p>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-[#1e3a5f]">5-15</span>
                <span className="text-gray-600 ml-2">vehículos</span>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-gray-700">5% descuento</span>
                </li>
              </ul>

              <a
                href="https://wa.me/56961833876?text=Plan%20Basico"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block text-center bg-gray-200 text-[#1e3a5f] rounded-lg hover:bg-gray-300 transition-all font-semibold px-6 py-3"
              >
                Consultar
              </a>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-[#ff7a3d] relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#ff7a3d] text-white px-4 py-1 rounded-full text-sm font-semibold">
                Más Popular
              </div>
              
              <h3 className="text-2xl font-bold text-[#1e3a5f] mb-2">Plan Profesional</h3>
              <p className="text-gray-600 mb-6">Para empresas medianas</p>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-[#1e3a5f]">16-50</span>
                <span className="text-gray-600 ml-2">vehículos</span>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-gray-700">10% descuento</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-gray-700">Soporte 24/7</span>
                </li>
              </ul>

              <a
                href="https://wa.me/56961833876?text=Plan%20Profesional"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block text-center bg-[#ff7a3d] text-white rounded-lg hover:bg-[#ff8c52] transition-all font-semibold px-6 py-3"
              >
                Consultar
              </a>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200">
              <h3 className="text-2xl font-bold text-[#1e3a5f] mb-2">Plan Enterprise</h3>
              <p className="text-gray-600 mb-6">Para grandes flotas</p>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-[#1e3a5f]">50+</span>
                <span className="text-gray-600 ml-2">vehículos</span>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-gray-700">15% descuento</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-gray-700">SLA garantizado</span>
                </li>
              </ul>

              <a
                href="https://wa.me/56961833876?text=Plan%20Enterprise"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block text-center bg-gray-200 text-[#1e3a5f] rounded-lg hover:bg-gray-300 transition-all font-semibold px-6 py-3"
              >
                Consultar
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}