import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GiTowTruck } from 'react-icons/gi';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-[#1e3a5f] sticky top-0 z-50 shadow-lg">
      <div className="max-w-[1300px] mx-auto px-4 md:px-8 py-4">
        <div className="flex items-center justify-between">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 group" onClick={closeMenu}>
            <GiTowTruck className="text-[#ff7a3d] text-3xl md:text-4xl group-hover:scale-110 transition-transform" />
            <span className="text-white text-xl md:text-2xl font-bold">
              Gru<span className="text-[#ff7a3d]">App</span>
            </span>
          </Link>

          {/* NAVEGACIÓN DESKTOP */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-white hover:text-[#ff7a3d] transition-colors font-medium">
              Inicio
            </Link>
            <Link to="/servicios" className="text-white hover:text-[#ff7a3d] transition-colors font-medium">
              Servicios
            </Link>
            <Link to="/conductores" className="text-white hover:text-[#ff7a3d] transition-colors font-medium">
              Para Conductores
            </Link>
            <Link to="/tarifas" className="text-white hover:text-[#ff7a3d] transition-colors font-medium">
              Tarifas
            </Link>
          </nav>

          {/* BOTONES DESKTOP */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/login"
              className="text-white hover:text-[#ff7a3d] transition-colors font-medium"
            >
              Iniciar Sesión
            </Link>
            <Link
              to="/register/cliente"
              className="bg-[#ff7a3d] text-white px-6 py-2 rounded-lg hover:bg-[#ff8c52] transition-all font-semibold"
            >
              Regístrate
            </Link>
          </div>

          {/* BOTÓN HAMBURGUESA MÓVIL */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-white focus:outline-none"
            aria-label="Menú"
          >
            {isMenuOpen ? (
              // ICONO X (CERRAR)
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            ) : (
              // ICONO HAMBURGUESA
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            )}
          </button>
        </div>

        {/* MENÚ DESPLEGABLE MÓVIL */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-gray-600 pt-4">
            <div className="flex flex-col gap-4">
              <Link
                to="/"
                onClick={closeMenu}
                className="text-white hover:text-[#ff7a3d] transition-colors font-medium text-lg py-2"
              >
                Inicio
              </Link>
              <Link
                to="/servicios"
                onClick={closeMenu}
                className="text-white hover:text-[#ff7a3d] transition-colors font-medium text-lg py-2"
              >
                Servicios
              </Link>
              <Link
                to="/conductores"
                onClick={closeMenu}
                className="text-white hover:text-[#ff7a3d] transition-colors font-medium text-lg py-2"
              >
                Para Conductores
              </Link>
              <Link
                to="/tarifas"
                onClick={closeMenu}
                className="text-white hover:text-[#ff7a3d] transition-colors font-medium text-lg py-2"
              >
                Tarifas
              </Link>
              
              {/* DIVISOR */}
              <div className="border-t border-gray-600 my-2"></div>
              
              {/* BOTONES EN MÓVIL */}
              <Link
                to="/login"
                onClick={closeMenu}
                className="text-white hover:text-[#ff7a3d] transition-colors font-medium text-lg py-2"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register/cliente"
                onClick={closeMenu}
                className="bg-[#ff7a3d] text-white px-6 py-3 rounded-lg hover:bg-[#ff8c52] transition-all font-semibold text-center text-lg"
              >
                Regístrate
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}