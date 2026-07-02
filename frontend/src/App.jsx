import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Inicio from './pages/Inicio';
import Login from './pages/Login';
import VerifyEmail from './pages/VerifyEmail';
import Servicios from './pages/Servicios';
import MisTurnos from './pages/client/MisTurnos';
import ReservarTurno from './pages/ReservarTurno';
import DashboardAdmin from './pages/admin/Dashboard';
import Agenda from './pages/admin/Agenda';
import AdminTurnos from './pages/admin/AdminTurnos';
import { AdminSection } from './pages/admin/AdminSection';

function AppContent() {
  const { pathname } = useLocation();
  const hideNavbar =
    pathname.startsWith('/admin') ||
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/verificar-email';

  return (
    <div style={{ backgroundColor: pathname.startsWith('/admin') ? '#f4f2f5' : '#100608', minHeight: '100vh' }}>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Navigate to="/login" replace />} />
        <Route path="/olvide-contrasena" element={<Navigate to="/login" replace />} />
        <Route path="/restablecer-contrasena" element={<Navigate to="/login" replace />} />
        <Route path="/verificar-email" element={<VerifyEmail />} />
        <Route path="/servicios" element={<Servicios />} />
        <Route path="/turnos" element={<Navigate to="/reservar" replace />} />

        <Route element={<ProtectedRoute clientOnly />}>
          <Route path="/mis-turnos" element={<MisTurnos />} />
          <Route path="/reservar" element={<ReservarTurno />} />
        </Route>

        <Route element={<ProtectedRoute staffOnly />}>
          <Route path="/admin/dashboard" element={<DashboardAdmin />} />
          <Route path="/admin/agenda" element={<Agenda />} />
          <Route path="/admin/turnos" element={<AdminTurnos />} />
          <Route path="/admin/clientes" element={<AdminSection type="clientes" />} />
          <Route path="/admin/servicios" element={<AdminSection type="servicios" />} />
          <Route path="/admin/profesionales" element={<AdminSection type="profesionales" />} />
          <Route path="/admin/horarios" element={<AdminSection type="horarios" />} />
          <Route path="/admin/finanzas" element={<AdminSection type="finanzas" />} />
          <Route path="/admin/configuracion" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
