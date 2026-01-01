import { GiTowTruck } from 'react-icons/gi';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Servicios() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] py-12 md:py-20">
        <div className="max-w-[1300px] mx-auto px-4 md:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6">
            Nuestros Servicios
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto">
            Contamos con diferentes tipos de grúas especializadas para cada necesidad. Servicio profesional las 24 horas del día.
          </p>
        </div>
      </section>

      {/* Servicios */}
      <section className="py-12 md:py-20">
        <div className="max-w-[1300px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            
            {/* Grúa Cama Baja */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-[#1e3a5f] bg-opacity-10 rounded-xl flex items-center justify-center mb-4 md:mb-6">
                <GiTowTruck className="w-10 h-10 md:w-12 md:h-12 text-[#ff7a3d]" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-[#1e3a5f] mb-3 md:mb-4">Grúa Cama Baja</h3>
              <p className="text-sm md:text-lg text-gray-600 mb-4 md:mb-6 leading-relaxed">
                Ideal para vehículos livianos y medianos. Sistema hidráulico que garantiza la seguridad de tu vehículo durante el traslado.
              </p>
              
              <h4 className="font-bold text-[#1e3a5f] mb-3 text-sm md:text-base">Características:</h4>
              <ul className="space-y-2 md:space-y-3 text-sm md:text-base text-gray-600 mb-4 md:mb-6">
                <li className="flex items-start">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Automóviles y SUVs</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Camionetas livianas</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Hasta 3.5 toneladas</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Sistema hidráulico de carga</span>
                </li>
              </ul>

              <div className="bg-gray-50 rounded-lg p-3 md:p-4 border border-gray-200">
                <p className="text-xs md:text-sm text-gray-600">
                  <strong className="text-[#1e3a5f]">Tiempo promedio:</strong> 15-30 minutos
                </p>
              </div>
            </div>

            {/* Grúa Horquilla */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-[#1e3a5f] bg-opacity-10 rounded-xl flex items-center justify-center mb-4 md:mb-6">
                <GiTowTruck className="w-10 h-10 md:w-12 md:h-12 text-[#ff7a3d]" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-[#1e3a5f] mb-3 md:mb-4">Grúa Horquilla</h3>
              <p className="text-sm md:text-lg text-gray-600 mb-4 md:mb-6 leading-relaxed">
                Perfecta para remolques y vehículos con el eje trasero dañado. Levantamiento por las ruedas delanteras o traseras.
              </p>
              
              <h4 className="font-bold text-[#1e3a5f] mb-3 text-sm md:text-base">Características:</h4>
              <ul className="space-y-2 md:space-y-3 text-sm md:text-base text-gray-600 mb-4 md:mb-6">
                <li className="flex items-start">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Vehículos tracción 4x4</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Camionetas medianas</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Traslados urbanos</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Eje trasero o delantero</span>
                </li>
              </ul>

              <div className="bg-gray-50 rounded-lg p-3 md:p-4 border border-gray-200">
                <p className="text-xs md:text-sm text-gray-600">
                  <strong className="text-[#1e3a5f]">Tiempo promedio:</strong> 20-35 minutos
                </p>
              </div>
            </div>

            {/* Grúa Pluma */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-[#1e3a5f] bg-opacity-10 rounded-xl flex items-center justify-center mb-4 md:mb-6">
                <GiTowTruck className="w-10 h-10 md:w-12 md:h-12 text-[#ff7a3d]" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-[#1e3a5f] mb-3 md:mb-4">Grúa Pluma</h3>
              <p className="text-sm md:text-lg text-gray-600 mb-4 md:mb-6 leading-relaxed">
                Especializada en vehículos pesados y situaciones complejas. Brazo hidráulico de alta capacidad para cualquier emergencia.
              </p>
              
              <h4 className="font-bold text-[#1e3a5f] mb-3 text-sm md:text-base">Características:</h4>
              <ul className="space-y-2 md:space-y-3 text-sm md:text-base text-gray-600 mb-4 md:mb-6">
                <li className="flex items-start">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Camiones y buses</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Vehículos pesados</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Rescates complejos</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Brazo de alta capacidad</span>
                </li>
              </ul>

              <div className="bg-gray-50 rounded-lg p-3 md:p-4 border border-gray-200">
                <p className="text-xs md:text-sm text-gray-600">
                  <strong className="text-[#1e3a5f]">Tiempo promedio:</strong> 30-45 minutos
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="max-w-[1300px] mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a5f] mb-4 md:mb-6">
            ¿Necesitas una grúa ahora?
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8 max-w-2xl mx-auto">
            Solicita tu servicio en menos de 2 minutos y recibe asistencia inmediata las 24 horas del día.
          </p>
          <Link
            to="/register/cliente"
            className="inline-block bg-[#ff7a3d] text-white rounded-lg hover:bg-[#ff8c52] transition-all shadow-lg hover:shadow-xl font-semibold px-10 py-3 md:px-12 md:py-4 text-base md:text-lg"
          >
            Solicitar Grúa Ahora
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}