import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Tarifas() {
  const [kilometros, setKilometros] = useState(10);
  const tarifaBase = 25000;
  const precioPorKm = 1350;
  const total = tarifaBase + (kilometros * precioPorKm);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] py-20">
        <div className="max-w-[1300px] mx-auto px-8 text-center">
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
            Tarifas Transparentes
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Sin sorpresas, sin cobros ocultos. Conoce exactamente cuánto pagarás antes de solicitar el servicio.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-[1300px] mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div className="bg-gray-50 rounded-2xl p-12 shadow-lg">
              <h3 className="text-3xl font-bold text-[#1e3a5f] mb-8">Calculadora de Tarifa</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-[#1e3a5f]">Tarifa Base</span>
                    <span className="text-2xl font-bold text-[#ff7a3d]">${tarifaBase.toLocaleString('es-CL')}</span>
                  </div>
                  <p className="text-gray-600 text-sm">Incluye los primeros kilómetros de servicio</p>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-[#1e3a5f]">Por Kilómetro Adicional</span>
                    <span className="text-2xl font-bold text-[#ff7a3d]">${precioPorKm.toLocaleString('es-CL')}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">Cada kilómetro recorrido</p>
                  
                  <div className="mt-6">
                    <label className="block text-sm font-semibold text-[#1e3a5f] mb-2">
                      Distancia estimada: {kilometros} km
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={kilometros}
                      onChange={(e) => setKilometros(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#ff7a3d]"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1 km</span>
                      <span>50 km</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border-2 border-[#ff7a3d]">
                  <h4 className="font-bold text-[#1e3a5f] mb-4">Cálculo de tu Servicio:</h4>
                  <div className="space-y-2 text-gray-700">
                    <div className="flex justify-between">
                      <span>Tarifa base:</span>
                      <span>${tarifaBase.toLocaleString('es-CL')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{kilometros} km × ${precioPorKm.toLocaleString('es-CL')}:</span>
                      <span>${(kilometros * precioPorKm).toLocaleString('es-CL')}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-bold text-lg">
                      <span>Total Estimado:</span>
                      <span className="text-[#ff7a3d]">${total.toLocaleString('es-CL')}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Nota:</strong> El cálculo final se realiza según la distancia real del servicio medida por GPS.
                  </p>
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
                  💡 Los precios se calculan automáticamente según la distancia real del servicio
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-20">
        <div className="max-w-[1300px] mx-auto px-8">
          <h2 className="text-4xl font-bold text-[#1e3a5f] text-center mb-12">Preguntas Frecuentes sobre Tarifas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-[#1e3a5f] mb-3">¿Cómo se calcula la tarifa final?</h3>
              <p className="text-gray-600">
                La tarifa se calcula sumando la tarifa base de $25.000 más $1.350 por cada kilómetro recorrido, medido por GPS.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-[#1e3a5f] mb-3">¿Hay cargos adicionales?</h3>
              <p className="text-gray-600">
                No. El precio que ves es el precio final. No hay cargos ocultos ni sorpresas al momento de pagar.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-[#1e3a5f] mb-3">¿Cuándo debo pagar?</h3>
              <p className="text-gray-600">
                El pago se procesa de forma segura a través de Mercado Pago una vez completado el servicio.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-[#1e3a5f] mb-3">¿Puedo cancelar mi solicitud?</h3>
              <p className="text-gray-600">
                Sí, puedes cancelar antes de que el gruero acepte el servicio sin ningún cargo.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-[1300px] mx-auto px-8 text-center">
          <h2 className="text-4xl font-bold text-[#1e3a5f] mb-6">
            ¿Listo para solicitar tu grúa?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Regístrate en menos de 2 minutos y solicita tu servicio de inmediato.
          </p>
          <Link
            to="/register/cliente"
            className="inline-block bg-[#ff7a3d] text-white rounded-lg hover:bg-[#ff8c52] transition-all shadow-lg hover:shadow-xl font-semibold px-12 py-4 text-lg"
          >
            Solicitar Grúa Ahora
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}