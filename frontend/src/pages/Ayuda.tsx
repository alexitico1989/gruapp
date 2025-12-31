import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Ayuda() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      categoria: 'Sobre GruApp',
      preguntas: [
        {
          pregunta: '¿Qué es GruApp?',
          respuesta: 'GruApp es una plataforma digital que conecta usuarios que necesitan servicios de grúa con conductores profesionales disponibles en tiempo real. Facilitamos el proceso de solicitud, pago y seguimiento del servicio.'
        },
        {
          pregunta: '¿En qué ciudades opera GruApp?',
          respuesta: 'Actualmente operamos en toda la Región Metropolitana de Santiago. Estamos expandiéndonos a otras regiones de Chile próximamente.'
        },
        {
          pregunta: '¿GruApp es dueña de las grúas?',
          respuesta: 'No, GruApp es una plataforma de intermediación. Conectamos usuarios con grueros independientes que son dueños de sus propias grúas y operan de forma autónoma.'
        }
      ]
    },
    {
      categoria: 'Para Usuarios',
      preguntas: [
        {
          pregunta: '¿Cómo solicito una grúa?',
          respuesta: 'Regístrate en la plataforma, ingresa tu ubicación y destino, selecciona el tipo de grúa que necesitas, y confirma tu solicitud. Un gruero cercano aceptará tu servicio en minutos.'
        },
        {
          pregunta: '¿Cuánto tiempo tarda en llegar la grúa?',
          respuesta: 'El tiempo de llegada depende de la ubicación y disponibilidad de grueros cercanos. En promedio, las grúas llegan entre 15 y 45 minutos. Podrás ver el tiempo estimado antes de confirmar tu solicitud.'
        },
        {
          pregunta: '¿Cómo se calcula el precio?',
          respuesta: 'El precio se calcula con una tarifa base de $25.000 más $1.350 por cada kilómetro recorrido. La distancia se mide por GPS de forma automática y transparente.'
        },
        {
          pregunta: '¿Puedo cancelar mi solicitud?',
          respuesta: 'Sí, puedes cancelar tu solicitud antes de que un gruero la acepte sin ningún cargo. Una vez aceptada, pueden aplicarse cargos de cancelación.'
        },
        {
          pregunta: '¿Cómo puedo rastrear mi grúa?',
          respuesta: 'Una vez que un gruero acepta tu solicitud, podrás ver su ubicación en tiempo real en el mapa de la aplicación hasta que llegue a tu ubicación.'
        },
        {
          pregunta: '¿Qué métodos de pago aceptan?',
          respuesta: 'Aceptamos todos los métodos de pago disponibles en Mercado Pago: tarjetas de crédito, débito y transferencias bancarias.'
        }
      ]
    },
    {
      categoria: 'Para Grueros',
      preguntas: [
        {
          pregunta: '¿Cómo me registro como gruero?',
          respuesta: 'Debes completar el formulario de registro con tus datos personales, información de tu grúa, licencia de conducir clase A3 o superior, certificado de antecedentes, y documentación de la grúa (permiso de circulación, revisión técnica, SOAP).'
        },
        {
          pregunta: '¿Cuánto cobro por servicio?',
          respuesta: 'Recibes el 85% del valor total del servicio. GruApp retiene el 15% como comisión por intermediación. El pago se deposita automáticamente después de cada servicio.'
        },
        {
          pregunta: '¿Puedo rechazar solicitudes?',
          respuesta: 'Sí, tienes total libertad para aceptar o rechazar las solicitudes que recibas. No hay penalizaciones por rechazar servicios.'
        },
        {
          pregunta: '¿Cuándo recibo mis pagos?',
          respuesta: 'Los pagos se procesan automáticamente una vez completado el servicio. El dinero está disponible en tu cuenta de Mercado Pago de forma inmediata.'
        },
        {
          pregunta: '¿Necesito estar disponible 24/7?',
          respuesta: 'No, tú decides cuándo trabajar. Puedes activar o desactivar tu disponibilidad cuando quieras desde la aplicación.'
        }
      ]
    },
    {
      categoria: 'Seguridad y Confianza',
      preguntas: [
        {
          pregunta: '¿Cómo verifican a los grueros?',
          respuesta: 'Verificamos la licencia de conducir, certificado de antecedentes, documentación de la grúa (permiso de circulación, revisión técnica, SOAP) y realizamos una revisión de antecedentes antes de aprobar cada gruero.'
        },
        {
          pregunta: '¿Qué pasa si hay un problema con el servicio?',
          respuesta: 'Puedes reportar cualquier incidencia a través del chat de soporte o escribirnos a contacto@gruappchile.cl. Nuestro equipo revisará el caso y tomará las medidas necesarias.'
        },
        {
          pregunta: '¿Están aseguradas las grúas?',
          respuesta: 'Sí, todas las grúas deben contar con seguro obligatorio (SOAP) vigente. Los grueros son responsables de mantener sus seguros al día.'
        },
        {
          pregunta: '¿Qué pasa si mi vehículo sufre daños durante el traslado?',
          respuesta: 'El gruero es responsable de cualquier daño causado durante el servicio. Debes reportar el incidente inmediatamente y tomar fotografías como evidencia.'
        }
      ]
    },
    {
      categoria: 'Facturación y Pagos',
      preguntas: [
        {
          pregunta: '¿Emiten factura?',
          respuesta: 'Sí, emitimos factura electrónica por cada servicio. La recibirás automáticamente en tu correo electrónico registrado.'
        },
        {
          pregunta: '¿Puedo solicitar factura a nombre de mi empresa?',
          respuesta: 'Sí, al registrarte puedes ingresar los datos de facturación de tu empresa. También ofrecemos planes corporativos con facturación centralizada.'
        },
        {
          pregunta: '¿Qué pasa si hay un error en el cobro?',
          respuesta: 'Contáctanos inmediatamente a contacto@gruappchile.cl con los detalles del servicio. Revisaremos el caso y realizaremos los ajustes necesarios.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] py-20">
        <div className="max-w-[1300px] mx-auto px-8 text-center">
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
            Centro de Ayuda
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Encuentra respuestas a las preguntas más frecuentes sobre GruApp
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-[900px] mx-auto px-8">
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-12">
            <p className="text-gray-700 leading-relaxed">
              ¿No encuentras lo que buscas? Contáctanos por WhatsApp al <strong>+56 9 6183 3876</strong> o escríbenos a <strong>contacto@gruappchile.cl</strong>
            </p>
          </div>

          {faqs.map((categoria, catIndex) => (
            <div key={catIndex} className="mb-12">
              <h2 className="text-3xl font-bold text-[#1e3a5f] mb-6">{categoria.categoria}</h2>
              
              <div className="space-y-4">
                {categoria.preguntas.map((faq, faqIndex) => {
                  const globalIndex = catIndex * 100 + faqIndex;
                  const isOpen = openFaq === globalIndex;
                  
                  return (
                    <div key={faqIndex} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleFaq(globalIndex)}
                        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-lg font-semibold text-[#1e3a5f] pr-4">
                          {faq.pregunta}
                        </span>
                        <svg
                          className={`w-5 h-5 text-[#ff7a3d] flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                      </button>
                      
                      {isOpen && (
                        <div className="px-6 pb-4">
                          <p className="text-gray-700 leading-relaxed">
                            {faq.respuesta}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="bg-gray-50 rounded-2xl p-8 mt-12">
            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-4 text-center">
              ¿Necesitas ayuda adicional?
            </h2>
            <p className="text-gray-700 text-center mb-6">
              Nuestro equipo está disponible para ayudarte
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="https://wa.me/56961833876?text=Hola%2C%20necesito%20ayuda"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-semibold px-6 py-3"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp Soporte
              </a>

              <a
                href="mailto:contacto@gruappchile.cl"
                className="flex items-center justify-center gap-3 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d4a6f] transition-all font-semibold px-6 py-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                Enviar Email
              </a>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}