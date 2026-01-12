import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Terminos() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] py-20">
        <div className="max-w-[1300px] mx-auto px-8 text-center">
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
            Términos y Condiciones
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Última actualización: 31 de diciembre de 2025
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-[900px] mx-auto px-8">
          <div className="prose prose-lg max-w-none">
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
              <p className="text-gray-700 leading-relaxed">
                Al utilizar GruApp, aceptas estos términos y condiciones en su totalidad. Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestros servicios.
              </p>
            </div>

            <h2 className="text-3xl font-bold text-[#1e3a5f] mt-12 mb-6">1. Definiciones</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>GruApp:</strong> Plataforma digital de intermediación que conecta usuarios que necesitan servicios de grúa con conductores profesionales que ofrecen dichos servicios.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>Usuario:</strong> Persona natural o jurídica que solicita servicios de grúa a través de la plataforma.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>Gruero:</strong> Conductor profesional que ofrece servicios de grúa a través de la plataforma.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>Servicio:</strong> Traslado de vehículos mediante grúa solicitado a través de la plataforma.
            </p>

            <h2 className="text-3xl font-bold text-[#1e3a5f] mt-12 mb-6">2. Naturaleza del Servicio</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              GruApp actúa exclusivamente como intermediario digital entre usuarios y grueros. No somos propietarios de grúas ni empleamos directamente a conductores. Los grueros son profesionales independientes responsables de la prestación del servicio de transporte.
            </p>

            <h2 className="text-3xl font-bold text-[#1e3a5f] mt-12 mb-6">3. Registro y Cuenta</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Para utilizar nuestros servicios, debes:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Ser mayor de 18 años</li>
              <li>Proporcionar información veraz y actualizada</li>
              <li>Mantener la confidencialidad de tu cuenta</li>
              <li>Notificar inmediatamente cualquier uso no autorizado</li>
            </ul>

            <h2 className="text-3xl font-bold text-[#1e3a5f] mt-12 mb-6">4. Tarifas y Pagos</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Las tarifas se calculan según:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Tarifa base livianos: $25.000 CLP</li>
              <li>Tarifa base pesados: $80.000 CLP</li>
              <li>Tarifa por kilómetro livianos: $1.350 CLP</li>
              <li>Tarifa por kilómetro pesados: $1.850 CLP</li>
              <li>Cálculo basado en distancia GPS real</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              Los pagos se procesan a través de Mercado Pago. GruApp Chile cobra una comisión del 10% por el servicio de intermediación.
            </p>

            <h2 className="text-3xl font-bold text-[#1e3a5f] mt-12 mb-6">5. Responsabilidades del Usuario</h2>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Proporcionar información precisa sobre la ubicación y tipo de vehículo</li>
              <li>Estar presente en el lugar acordado para el servicio</li>
              <li>Tratar con respeto al gruero</li>
              <li>Pagar el monto acordado por el servicio</li>
            </ul>

            <h2 className="text-3xl font-bold text-[#1e3a5f] mt-12 mb-6">6. Responsabilidades del Gruero</h2>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Contar con licencia de conducir clase A4 o superior vigente</li>
              <li>Mantener la grúa con documentación al día</li>
              <li>Contar con seguro obligatorio (SOAP) vigente</li>
              <li>Prestar el servicio de forma profesional y segura</li>
              <li>Cumplir con las normativas de tránsito vigentes en Chile</li>
            </ul>

            <h2 className="text-3xl font-bold text-[#1e3a5f] mt-12 mb-6">7. Cancelaciones</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Los usuarios pueden cancelar solicitudes antes de que un gruero acepte el servicio sin costo. Una vez aceptado el servicio, pueden aplicarse cargos según las políticas de cancelación.
            </p>

            <h2 className="text-3xl font-bold text-[#1e3a5f] mt-12 mb-6">8. Limitación de Responsabilidad</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              GruApp no se hace responsable por:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Daños al vehículo durante el traslado (responsabilidad del gruero)</li>
              <li>Retrasos causados por condiciones de tráfico o clima</li>
              <li>Pérdida de objetos personales dejados en el vehículo</li>
              <li>Disputas entre usuarios y grueros</li>
            </ul>

            <h2 className="text-3xl font-bold text-[#1e3a5f] mt-12 mb-6">9. Propiedad Intelectual</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Todos los contenidos de la plataforma (logo, diseño, textos, imágenes) son propiedad de GruApp y están protegidos por las leyes de propiedad intelectual de Chile.
            </p>

            <h2 className="text-3xl font-bold text-[#1e3a5f] mt-12 mb-6">10. Protección de Datos Personales</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              El tratamiento de datos personales se rige por nuestra Política de Privacidad y la Ley N° 19.628 sobre Protección de la Vida Privada de Chile.
            </p>

            <h2 className="text-3xl font-bold text-[#1e3a5f] mt-12 mb-6">11. Modificaciones</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              GruApp se reserva el derecho de modificar estos términos en cualquier momento. Los cambios serán notificados a través de la plataforma y entrarán en vigencia inmediatamente.
            </p>

            <h2 className="text-3xl font-bold text-[#1e3a5f] mt-12 mb-6">12. Legislación Aplicable</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Estos términos se rigen por las leyes de la República de Chile. Cualquier controversia será resuelta en los tribunales competentes de Santiago, Chile.
            </p>

            <h2 className="text-3xl font-bold text-[#1e3a5f] mt-12 mb-6">13. Contacto</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Para consultas sobre estos términos:
            </p>
            <ul className="list-none mb-4 text-gray-700 space-y-2">
              <li><strong>Email:</strong> contacto@gruappchile.cl</li>
              <li><strong>WhatsApp:</strong> +56 9 6183 3876</li>
            </ul>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-12">
              <p className="text-sm text-gray-600">
                Al utilizar GruApp, confirmas que has leído, comprendido y aceptado estos Términos y Condiciones en su totalidad.
              </p>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}