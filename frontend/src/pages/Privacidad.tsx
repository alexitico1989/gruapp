import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Privacidad() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] py-20">
        <div className="max-w-[1300px] mx-auto px-8 text-center">
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
            Políticas de Privacidad
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
                En GruApp respetamos tu privacidad y nos comprometemos a proteger tus datos personales conforme a la Ley N° 19.628 sobre Protección de la Vida Privada de Chile.
              </p>
            </div>

            <h2 className="text-3xl font-bold text-[#1e3a5f] mt-12 mb-6">1. Responsable del Tratamiento de Datos</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              GruApp Chile es responsable del tratamiento de tus datos personales.
            </p>
            <ul className="list-none mb-4 text-gray-700 space-y-2">
              <li><strong>Email:</strong> contacto@gruappchile.cl</li>
              <li><strong>WhatsApp:</strong> +56 9 6183 3876</li>
            </ul>

            <h2 className="text-3xl font-bold text-[#1e3a5f] mt-12 mb-6">2. Datos que Recopilamos</h2>
            
            <h3 className="text-2xl font-bold text-[#1e3a5f] mt-8 mb-4">2.1 Datos de Usuarios</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Nombre completo</li>
              <li>RUT</li>
              <li>Correo electrónico</li>
              <li>Número de teléfono</li>
              <li>Dirección</li>
              <li>Datos de ubicación GPS</li>
              <li>Información del vehículo (marca, modelo, patente)</li>
            </ul>

            <h3 className="text-2xl font-bold text-[#1e3a5f] mt-8 mb-4">2.2 Datos de Grueros</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Nombre completo</li>
              <li>RUT</li>
              <li>Licencia de conducir</li>
              <li>Datos de la grúa (patente, tipo, documentación)</li>
              <li>Certificado de antecedentes</li>
              <li>Datos bancarios para pagos</li>
              <li>Ubicación GPS en tiempo real</li>
            </ul>

            <h3 className="text-2xl font-bold text-[#1e3a5f] mt-8 mb-4">2.3 Datos Técnicos</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Dirección IP</li>
              <li>Tipo de navegador</li>
              <li>Sistema operativo</li>
              <li>Datos de uso de la plataforma</li>
            </ul>

            <h2 className="text-3xl font-bold text-[#1e3a5f] mt-12 mb-6">3. Finalidad del Tratamiento</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Utilizamos tus datos personales para:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Facilitar la conexión entre usuarios y grueros</li>
              <li>Procesar solicitudes de servicio</li>
              <li>Gestionar pagos y facturación</li>
              <li>Verificar la identidad de grueros</li>
              <li>Mejorar nuestros servicios</li>
              <li>Cumplir con obligaciones legales</li>
              <li>Enviar notificaciones sobre el estado del servicio</li>
              <li>Proporcionar soporte al cliente</li>
            </ul>

            <h2 className="text-3xl font-bold text-[#1e3a5f] mt-12 mb-6">4. Base Legal del Tratamiento</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Tratamos tus datos personales en base a:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Consentimiento expreso al registrarte en la plataforma</li>
              <li>Ejecución del contrato de servicios</li>
              <li>Cumplimiento de obligaciones legales</li>
              <li>Interés legítimo en mejorar nuestros servicios</li>
            </ul>

            <h2 className="text-3xl font-bold text-[#1e3a5f] mt-12 mb-6">5. Compartición de Datos</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Podemos compartir tus datos con:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Grueros:</strong> Para coordinar el servicio solicitado</li>
              <li><strong>Procesadores de pago:</strong> Mercado Pago para procesar transacciones</li>
              <li><strong>Proveedores de servicios:</strong> Empresas que nos ayudan a operar la plataforma</li>
              <li><strong>Autoridades:</strong> Cuando sea requerido por ley</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              No vendemos ni compartimos tus datos con terceros para fines de marketing sin tu consentimiento.
            </p>

            <h2 className="text-3xl font-bold text-[#1e3a5f] mt-12 mb-6">6. Seguridad de los Datos</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Cifrado de datos en tránsito (HTTPS/SSL)</li>
              <li>Cifrado de contraseñas</li>
              <li>Acceso restringido a datos personales</li>
              <li>Monitoreo de seguridad continuo</li>
              <li>Backups regulares</li>
            </ul>

            <h2 className="text-3xl font-bold text-[#1e3a5f] mt-12 mb-6">7. Retención de Datos</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Conservamos tus datos personales:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Durante el tiempo que mantengas tu cuenta activa</li>
              <li>Hasta 5 años después del cierre de cuenta para cumplir obligaciones legales</li>
              <li>El tiempo necesario para resolver disputas</li>
            </ul>

            <h2 className="text-3xl font-bold text-[#1e3a5f] mt-12 mb-6">8. Tus Derechos</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Conforme a la Ley N° 19.628, tienes derecho a:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Acceso:</strong> Solicitar información sobre los datos que tenemos de ti</li>
              <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
              <li><strong>Cancelación:</strong> Solicitar la eliminación de tus datos</li>
              <li><strong>Oposición:</strong> Oponerte al tratamiento de tus datos</li>
              <li><strong>Portabilidad:</strong> Solicitar una copia de tus datos en formato electrónico</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              Para ejercer estos derechos, contáctanos en contacto@gruappchile.cl
            </p>

            <h2 className="text-3xl font-bold text-[#1e3a5f] mt-12 mb-6">9. Cookies y Tecnologías Similares</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Utilizamos cookies para mejorar tu experiencia en la plataforma. Puedes gestionar las cookies desde la configuración de tu navegador. Para más información, consulta nuestra Política de Cookies.
            </p>

            <h2 className="text-3xl font-bold text-[#1e3a5f] mt-12 mb-6">10. Transferencias Internacionales</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Algunos de nuestros proveedores de servicios pueden estar ubicados fuera de Chile. En estos casos, nos aseguramos de que existan garantías adecuadas para la protección de tus datos.
            </p>

            <h2 className="text-3xl font-bold text-[#1e3a5f] mt-12 mb-6">11. Menores de Edad</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nuestros servicios están dirigidos a personas mayores de 18 años. No recopilamos intencionalmente datos de menores de edad.
            </p>

            <h2 className="text-3xl font-bold text-[#1e3a5f] mt-12 mb-6">12. Cambios a esta Política</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Podemos actualizar esta política periódicamente. Te notificaremos sobre cambios significativos a través de la plataforma o por correo electrónico.
            </p>

            <h2 className="text-3xl font-bold text-[#1e3a5f] mt-12 mb-6">13. Contacto</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Para cualquier consulta sobre esta política de privacidad o el tratamiento de tus datos:
            </p>
            <ul className="list-none mb-4 text-gray-700 space-y-2">
              <li><strong>Email:</strong> contacto@gruappchile.cl</li>
              <li><strong>WhatsApp:</strong> +56 9 6183 3876</li>
            </ul>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-12">
              <p className="text-sm text-gray-600">
                Al utilizar GruApp, confirmas que has leído y comprendido esta Política de Privacidad y consientes el tratamiento de tus datos personales según lo descrito.
              </p>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}