import { Link } from 'react-router-dom';
import { GiTowTruck } from 'react-icons/gi';
import { FaFacebook, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa';

export default function Footer() {
  return (
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
              <li><Link to="/servicios" className="text-gray-600 hover:text-[#ff7a3d] transition-colors text-sm">Servicios</Link></li>
              <li><Link to="/conductores" className="text-gray-600 hover:text-[#ff7a3d] transition-colors text-sm">Para Conductores</Link></li>
              <li><Link to="/empresas" className="text-gray-600 hover:text-[#ff7a3d] transition-colors text-sm">Empresas</Link></li>
              <li><Link to="/tarifas" className="text-gray-600 hover:text-[#ff7a3d] transition-colors text-sm">Tarifas</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[#1e3a5f] font-bold text-lg mb-4">Soporte</h3>
            <ul className="space-y-2">
              <li><Link to="/ayuda" className="text-gray-600 hover:text-[#ff7a3d] transition-colors text-sm">Ayuda y FAQ</Link></li>
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
  );
}