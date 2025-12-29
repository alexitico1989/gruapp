import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

// Pages - Auth
import Landing from './pages/Landing';
import Login from './pages/Login';
import RegisterCliente from './pages/RegisterCliente';
import RegisterGruero from './pages/RegisterGruero';

// Pages - Cliente
import ClienteDashboard from './pages/cliente/ClienteDashboard';
import MisServicios from './pages/cliente/MisServicios';
import MisReclamos from './pages/cliente/MisReclamos';
import Perfil from './pages/cliente/Perfil';
import Pagos from './pages/cliente/Pagos';
import Ayuda from './pages/cliente/Ayuda';
//import DetalleServicio from './pages/cliente/DetalleServicio';

// Pages - Gruero
import GrueroDashboard from './pages/gruero/GrueroDashboard';
import GrueroServicios from './pages/gruero/GrueroServicios';
import PerfilGruero from './pages/gruero/PerfilGruero';

// Pages - Admin
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminGrueros from './pages/admin/AdminGrueros';
import AdminGrueroDetalle from './pages/admin/AdminGrueroDetalle';
import AdminServicios from './pages/admin/AdminServicios';
import AdminClientes from './pages/admin/AdminClientes';
import AdminClienteDetalle from './pages/admin/AdminClienteDetalle';
import AdminFinanzas from './pages/admin/AdminFinanzas';
import AdminReclamos from './pages/admin/AdminReclamos';

function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode; allowedRole: 'CLIENTE' | 'GRUERO' }) {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const adminToken = localStorage.getItem('adminToken');

  if (!adminToken) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          isAuthenticated 
            ? user?.role === 'CLIENTE' 
              ? <Navigate to="/cliente/dashboard" replace />
              : <Navigate to="/gruero/dashboard" replace />
            : <Landing />
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/register/cliente" element={<RegisterCliente />} />
        <Route path="/register/gruero" element={<RegisterGruero />} />

        {/* Cliente Routes */}
        <Route
          path="/cliente/dashboard"
          element={
            <ProtectedRoute allowedRole="CLIENTE">
              <ClienteDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cliente/servicios"
          element={
            <ProtectedRoute allowedRole="CLIENTE">
              <MisServicios />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cliente/reclamos"
          element={
            <ProtectedRoute allowedRole="CLIENTE">
              <MisReclamos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cliente/perfil"
          element={
            <ProtectedRoute allowedRole="CLIENTE">
              <Perfil />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cliente/pagos"
          element={
            <ProtectedRoute allowedRole="CLIENTE">
              <Pagos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cliente/ayuda"
          element={
            <ProtectedRoute allowedRole="CLIENTE">
              <Ayuda />
            </ProtectedRoute>
          }
        />
        {/* TEMPORALMENTE DESHABILITADO
        <Route
          path="/cliente/servicio/:id"
          element={
            <ProtectedRoute allowedRole="CLIENTE">
              <DetalleServicio />
            </ProtectedRoute>
          }
        />
        */}

        {/* Gruero Routes */}
        <Route
          path="/gruero/dashboard"
          element={
            <ProtectedRoute allowedRole="GRUERO">
              <GrueroDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gruero/servicios"
          element={
            <ProtectedRoute allowedRole="GRUERO">
              <GrueroServicios />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gruero/perfil"
          element={
            <ProtectedRoute allowedRole="GRUERO">
              <PerfilGruero />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="grueros" element={<AdminGrueros />} />
          <Route path="grueros/:id" element={<AdminGrueroDetalle />} />
          <Route path="clientes" element={<AdminClientes />} />
          <Route path="clientes/:id" element={<AdminClienteDetalle />} />
          <Route path="finanzas" element={<AdminFinanzas />} />
          <Route path="reclamos" element={<AdminReclamos />} />
          <Route path="servicios" element={<AdminServicios />} />
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;