import { Link } from 'react-router-dom';
import { GiTowTruck } from 'react-icons/gi';

export default function Header() {
  return (
    <header className="bg-[#1e3a5f] sticky top-0 z-50 shadow-lg">
      <div className="max-w-[1300px] mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <GiTowTruck className="text-[#ff7a3d] text-4xl group-hover:scale-110 transition-transform" />
            <span className="text-white text-2xl font-bold">
              Gru<span className="text-[#ff7a3d]">App</span>
            </span>
          </Link>

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

          <div className="flex items-center gap-4">
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
        </div>
      </div>
    </header>
  );
}