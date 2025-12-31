import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Conductores() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] py-20">
        <div className="max-w-[1300px] mx-auto px-8 text-center">
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
            ¿Por qué ser Gruero en GruApp?
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Únete a nuestra red de conductores profesionales y aumenta tus ingresos trabajando cuando tú decidas.
          </p>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-20">
        <div className="max-w-[1300px] mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <h2 className="text-4xl font-bold text-[#1e3a5f] mb-12">Beneficios de Unirte</h2>
              
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-[#ff7a3d] bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-7 h-7 text-[#ff7a3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#1e3a5f] mb-2">Gana Más Dinero</h3>
                    <p className="text-gray-600 leading-relaxed text-lg">
                      Recibe solicitudes constantes y aumenta tus ingresos mensuales. Sin cupos limitados ni restricciones horarias. Tú defines cuánto quieres trabajar.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-[#ff7a3d] bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-7 h-7 text-[#ff7a3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#1e3a5f] mb-2">Trabaja a Tu Ritmo</h3>
                    <p className="text-gray-600 leading-relaxed text-lg">
                      Tú decides cuándo trabajar. Activa o desactiva tu disponibilidad cuando quieras, sin compromisos fijos. Libertad total para organizar tu tiempo.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-[#ff7a3d] bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-7 h-7 text-[#ff7a3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#1e3a5f] mb-2">Pagos Seguros</h3>
                    <p className="text-gray-600 leading-relaxed text-lg">
                      Recibe tus pagos de forma automática y segura a través de Mercado Pago. Sin intermediarios ni demoras. Dinero directo a tu cuenta.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-[#ff7a3d] bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-7 h-7 text-[#ff7a3d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#1e3a5f] mb-2">Red de Clientes</h3>
                    <p className="text-gray-600 leading-relaxed text-lg">
                      Accede a miles de usuarios que necesitan tus servicios. Amplía tu cartera de clientes día a día sin invertir en publicidad.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-12 shadow-lg">
              <h3 className="text-3xl font-bold text-[#1e3a5f] mb-8">Requisitos para Unirte</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-gray-700 text-lg">Licencia de conducir clase a4 o superior vigente</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-gray-700 text-lg">Grúa con documentación al día</span>
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
                  <span className="text-gray-700 text-lg">Revisión técnica y gases al día</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-gray-700 text-lg">Smartphone con GPS activo</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-gray-700 text-lg">Permiso de circulación al día</span>
                </li>
              </ul>

              <div className="mt-8 bg-[#ff7a3d] bg-opacity-10 border-2 border-[#ff7a3d] rounded-xl p-6">
                <p className="text-[#1e3a5f] font-semibold text-center">
                  💡 Proceso de aprobación en menos de 48 horas
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo Funciona */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-[1300px] mx-auto px-8">
          <h2 className="text-4xl font-bold text-[#1e3a5f] text-center mb-16">¿Cómo Funciona?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#ff7a3d] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold text-[#1e3a5f] mb-2">Regístrate</h3>
              <p className="text-gray-600">
                Completa el formulario con tus datos y documentación
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#ff7a3d] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold text-[#1e3a5f] mb-2">Verificación</h3>
              <p className="text-gray-600">
                Revisamos tus documentos y aprobamos tu cuenta
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#ff7a3d] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold text-[#1e3a5f] mb-2">Actívate</h3>
              <p className="text-gray-600">
                Enciende tu disponibilidad y comienza a recibir servicios
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#ff7a3d] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                4
              </div>
              <h3 className="text-xl font-bold text-[#1e3a5f] mb-2">Gana Dinero</h3>
              <p className="text-gray-600">
                Recibe pagos automáticos por cada servicio completado
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-[1300px] mx-auto px-8 text-center">
          <h2 className="text-4xl font-bold text-[#1e3a5f] mb-6">
            ¿Listo para Aumentar tus Ingresos?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Únete a nuestra red de conductores profesionales y comienza a ganar más hoy mismo.
          </p>
          <Link
            to="/register/gruero"
            className="inline-block bg-[#ff7a3d] text-white rounded-lg hover:bg-[#ff8c52] transition-all shadow-lg hover:shadow-xl font-semibold px-12 py-4 text-lg"
          >
            Registra tu Grúa Ahora
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}