import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardHome } from './pages/DashboardHome';
import { StaffList } from './pages/users/StaffList';
import { ClientList } from './pages/users/ClientList';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/index" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="users/staff" element={<StaffList />} />
          <Route path="users/clients" element={<ClientList />} />
          <Route path="inventory" element={<div>Inventario</div>} />
          <Route path="sales" element={<div>Ventas</div>} />
          <Route path="settings" element={<div>Configuraciones</div>} />
        </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;