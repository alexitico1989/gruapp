import { Link } from 'react-router-dom';
import { GiTowTruck } from 'react-icons/gi';

export default function Header() {
  return (
    <header className="bg-[#1e3a5f] shadow-md sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="flex justify-between items-center" style={{ height: '60px' }}>
          <Link to="/" className="flex items-center space-x-2 cursor-pointer hover:opacity-90 transition-opacity">
            <GiTowTruck className="h-7 w-7 text-white" />
            <span className="text-[22px] font-bold tracking-tight">
              <span className="text-white">Gru</span>
              <span className="text-[#ff7a3d]">App</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center space-x-8">
            <Link to="/servicios" className="text-white text-[15px] hover:text-[#ff7a3d] transition-colors">
              Servicios
            </Link>
            <Link to="/conductores" className="text-white text-[15px] hover:text-[#ff7a3d] transition-colors">
              Para Conductores
            </Link>
            <Link to="/empresas" className="text-white text-[15px] hover:text-[#ff7a3d] transition-colors">
              Empresas
            </Link>
            <Link to="/tarifas" className="text-white text-[15px] hover:text-[#ff7a3d] transition-colors">
              Tarifas
            </Link>
            <Link 
              to="/login" 
              className="bg-[#2d4a6f] text-white px-5 py-2 rounded-md hover:bg-[#3d5a7f] transition-colors text-[14px]"
            >
              Iniciar Sesión
            </Link>
            <Link 
              to="/register/cliente" 
              className="bg-[#ff7a3d] text-white px-5 py-2 rounded-md hover:bg-[#ff8c52] transition-colors text-[14px] font-semibold"
            >
              Regístrate
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}