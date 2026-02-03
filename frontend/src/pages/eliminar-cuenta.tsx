import Header from '../components/Header';
import Footer from '../components/Footer';

export default function EliminarCuenta() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] py-20">
        <div className="max-w-[1300px] mx-auto px-8 text-center">
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
            Eliminar Cuenta de GruApp
          </h1>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-[900px] mx-auto px-8">
          <div className="prose prose-lg max-w-none">
            
            <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-8">
              <h3 className="text-xl font-bold text-red-800 mb-2">⚠️ Acción Permanente</h3>
              <p className="text-red-700">
                La eliminación de tu cuenta es permanente e irreversible. Todos tus datos personales, historial de servicios y calificaciones serán eliminados.
              </p>
            </div>

            <h2 className="text-3xl font-bold text-[#1e3a5f] mt-12 mb-6">Cómo Solicitar la Eliminación</h2>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              Para eliminar tu cuenta de GruApp, sigue estos pasos:
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-bold text-[#1e3a5f] mb-4">Paso 1: Envía un Email</h3>
              <p className="text-gray-700 mb-4">
                Envía un correo electrónico a <strong>contacto@gruappchile.cl</strong> con el asunto: <strong>"Solicitud de Eliminación de Cuenta"</strong>
              </p>
              
              <h3 className="text-xl font-bold text-[#1e3a5f] mb-4">Paso 2: Incluye la Siguiente Información</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Tu nombre completo</li>
                <li>Email registrado en GruApp</li>
                <li>Número de teléfono (opcional, para verificación)</li>
                <li>Motivo de eliminación (opcional)</li>
              </ul>

              <h3 className="text-xl font-bold text-[#1e3a5f] mb-4 mt-6">Paso 3: Confirmación</h3>
              <p className="text-gray-700">
                Recibirás un email de confirmación dentro de 48 horas hábiles. Tu cuenta será eliminada completamente en un plazo de 7 días.
              </p>
            </div>

            <h2 className="text-3xl font-bold text-[#1e3a5f] mt-12 mb-6">¿Qué Datos se Eliminan?</h2>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Información personal (nombre, email, teléfono, RUT)</li>
              <li>Historial de servicios</li>
              <li>Calificaciones y comentarios</li>
              <li>Datos de ubicación</li>
              <li>Información del vehículo (grueros)</li>
              <li>Datos bancarios (grueros)</li>
            </ul>

            <h2 className="text-3xl font-bold text-[#1e3a5f] mt-12 mb-6">¿Qué Datos se Conservan?</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Por obligaciones legales y fiscales, conservaremos durante 5 años:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Facturas y comprobantes de pago</li>
              <li>Registros de transacciones financieras</li>
              <li>Datos necesarios para auditorías tributarias</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Estos datos se mantendrán de forma anónima y no estarán asociados a tu cuenta eliminada.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-12">
              <h3 className="text-xl font-bold text-[#1e3a5f] mb-4">¿Necesitas Ayuda?</h3>
              <p className="text-gray-700 mb-4">
                Si tienes dudas sobre el proceso de eliminación, contáctanos:
              </p>
              <ul className="list-none text-gray-700 space-y-2">
                <li><strong>Email:</strong> contacto@gruappchile.cl</li>
                <li><strong>WhatsApp:</strong> +56 9 6183 3876</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}