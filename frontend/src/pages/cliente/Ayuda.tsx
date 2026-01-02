import { useState } from 'react';
import { HelpCircle, Mail, Phone, MessageCircle, ChevronDown, ChevronUp, FileText, Shield } from 'lucide-react';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';

interface FAQ {
  pregunta: string;
  respuesta: string;
  categoria: 'general' | 'servicios' | 'pagos' | 'cuenta';
}

const faqs: FAQ[] = [
  {
    categoria: 'servicios',
    pregunta: '¿Cómo solicito una grúa?',
    respuesta: 'Desde tu dashboard, haz clic en "Solicitar Grúa", ingresa la ubicación de origen y destino, y confirma el servicio. Recibirás notificaciones cuando un gruero acepte tu solicitud.',
  },
  {
    categoria: 'servicios',
    pregunta: '¿Cuánto tiempo tarda en llegar la grúa?',
    respuesta: 'El tiempo de llegada depende de la disponibilidad de grueros cercanos. Generalmente, una grúa llega en 15-30 minutos. Podrás ver el tiempo estimado en el mapa en tiempo real.',
  },
  {
    categoria: 'servicios',
    pregunta: '¿Puedo cancelar un servicio?',
    respuesta: 'Sí, puedes cancelar un servicio antes de que el gruero llegue al sitio. Sin embargo, cancelaciones frecuentes pueden afectar tu cuenta.',
  },
  {
    categoria: 'pagos',
    pregunta: '¿Cómo se calcula el precio?',
    respuesta: 'El precio se calcula basado en la distancia del recorrido. Incluye: tarifa base + tarifa por kilómetro + comisión de la plataforma. Verás el precio total antes de confirmar.',
  },
  {
    categoria: 'pagos',
    pregunta: '¿Qué métodos de pago aceptan?',
    respuesta: 'Aceptamos pagos a través de Mercado Pago: tarjetas de crédito, débito y otros medios de pago disponibles en la plataforma.',
  },
  {
    categoria: 'pagos',
    pregunta: '¿Cuándo se cobra el servicio?',
    respuesta: 'El cobro se realiza automáticamente una vez que el servicio se marca como completado por el gruero.',
  },
  {
    categoria: 'cuenta',
    pregunta: '¿Cómo cambio mi contraseña?',
    respuesta: 'Ve a Perfil → Seguridad → Cambiar Contraseña. Deberás ingresar tu contraseña actual y la nueva contraseña.',
  },
  {
    categoria: 'cuenta',
    pregunta: '¿Puedo modificar mis datos personales?',
    respuesta: 'Sí, en la sección de Perfil puedes editar tu nombre, apellido, teléfono y RUT en cualquier momento.',
  },
  {
    categoria: 'cuenta',
    pregunta: '¿Cómo elimino mi cuenta?',
    respuesta: 'En Perfil → Zona de Peligro → Eliminar Cuenta. Ten en cuenta que esta acción es permanente y no se puede deshacer.',
  },
  {
    categoria: 'general',
    pregunta: '¿Puedo calificar al gruero?',
    respuesta: 'Sí, una vez completado el servicio, podrás calificar al gruero y dejar un comentario sobre tu experiencia.',
  },
  {
    categoria: 'general',
    pregunta: '¿Qué hago si tengo un problema con un servicio?',
    respuesta: 'Puedes crear un reclamo desde "Mis Servicios" → selecciona el servicio → "Reportar Problema". Nuestro equipo revisará tu caso.',
  },
  {
    categoria: 'general',
    pregunta: '¿La plataforma está disponible 24/7?',
    respuesta: 'Sí, la plataforma está disponible las 24 horas del día, los 7 días de la semana. Sin embargo, la disponibilidad de grueros puede variar según la zona y horario.',
  },
];

export default function Ayuda() {
  const [categoriaActiva, setCategoriaActiva] = useState<string>('general');
  const [faqAbierto, setFaqAbierto] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({
    asunto: '',
    mensaje: '',
  });

  const categorias = [
    { id: 'general', nombre: 'General', icono: HelpCircle },
    { id: 'servicios', nombre: 'Servicios', icono: MessageCircle },
    { id: 'pagos', nombre: 'Pagos', icono: FileText },
    { id: 'cuenta', nombre: 'Mi Cuenta', icono: Shield },
  ];

  const faqsFiltrados = faqs.filter((faq) => faq.categoria === categoriaActiva);

  const handleEnviarContacto = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactForm.asunto || !contactForm.mensaje) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    // TODO: Implementar envío real de mensaje
    toast.success('Mensaje enviado. Te contactaremos pronto.');
    setContactForm({ asunto: '', mensaje: '' });
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#1e3a5f] mb-2">Centro de Ayuda</h1>
          <p className="text-gray-600">Encuentra respuestas a tus preguntas o contáctanos</p>
        </div>

        {/* Contacto Rápido */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center">
            <Mail className="h-12 w-12 text-[#1e3a5f] mx-auto mb-4" />
            <h3 className="font-bold text-gray-900 mb-2">Email</h3>
            <p className="text-sm text-gray-600 mb-3">contacto@gruappchile.cl</p>
            <a
              href="mailto:contacto@gruappchile.cl"
              className="text-[#ff7a3d] hover:underline text-sm font-semibold"
            >
              Enviar email
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center">
            <Phone className="h-12 w-12 text-[#1e3a5f] mx-auto mb-4" />
            <h3 className="font-bold text-gray-900 mb-2">Teléfono</h3>
            <p className="text-sm text-gray-600 mb-3">+56 9 6183 3876</p>
            <a
              href="tel:+56961833876"
              className="text-[#ff7a3d] hover:underline text-sm font-semibold"
            >
              Llamar ahora
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center">
            <MessageCircle className="h-12 w-12 text-[#1e3a5f] mx-auto mb-4" />
            <h3 className="font-bold text-gray-900 mb-2">WhatsApp</h3>
            <p className="text-sm text-gray-600 mb-3">Atención inmediata</p>
            <a
              href="https://wa.me/56961833876"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ff7a3d] hover:underline text-sm font-semibold"
            >
              Abrir WhatsApp
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FAQ */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-2xl font-bold text-[#1e3a5f] mb-6">Preguntas Frecuentes</h2>

              {/* Categorías */}
              <div className="flex flex-wrap gap-2 mb-6">
                {categorias.map((cat) => {
                  const Icon = cat.icono;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setCategoriaActiva(cat.id);
                        setFaqAbierto(null);
                      }}
                      className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                        categoriaActiva === cat.id
                          ? 'bg-[#1e3a5f] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {cat.nombre}
                    </button>
                  );
                })}
              </div>

              {/* Lista de FAQs */}
              <div className="space-y-3">
                {faqsFiltrados.map((faq, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => setFaqAbierto(faqAbierto === index ? null : index)}
                      className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-semibold text-gray-900">{faq.pregunta}</span>
                      {faqAbierto === index ? (
                        <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      )}
                    </button>
                    {faqAbierto === index && (
                      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                        <p className="text-gray-700">{faq.respuesta}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Formulario de Contacto */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-[#1e3a5f] mb-4">¿No encontraste lo que buscabas?</h2>
              <p className="text-gray-600 text-sm mb-6">
                Envíanos un mensaje y te responderemos lo antes posible.
              </p>

              <form onSubmit={handleEnviarContacto} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asunto
                  </label>
                  <input
                    type="text"
                    value={contactForm.asunto}
                    onChange={(e) => setContactForm({ ...contactForm, asunto: e.target.value })}
                    placeholder="Ej: Problema con mi pago"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje
                  </label>
                  <textarea
                    value={contactForm.mensaje}
                    onChange={(e) => setContactForm({ ...contactForm, mensaje: e.target.value })}
                    placeholder="Describe tu consulta o problema..."
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1e3a5f] text-white py-3 rounded-lg hover:bg-[#2d4a6f] transition-colors font-semibold"
                >
                  Enviar Mensaje
                </button>
              </form>
            </div>

            {/* Enlaces Útiles */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mt-6">
              <h3 className="font-bold text-gray-900 mb-4">Enlaces Útiles</h3>
              <div className="space-y-2">
                <a
                  href="#"
                  className="block text-[#1e3a5f] hover:underline text-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.success('Términos y condiciones (próximamente)');
                  }}
                >
                  📄 Términos y Condiciones
                </a>
                <a
                  href="#"
                  className="block text-[#1e3a5f] hover:underline text-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.success('Política de privacidad (próximamente)');
                  }}
                >
                  🔒 Política de Privacidad
                </a>
                <a
                  href="#"
                  className="block text-[#1e3a5f] hover:underline text-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.success('Política de reembolsos (próximamente)');
                  }}
                >
                  💰 Política de Reembolsos
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}