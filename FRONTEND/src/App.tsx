import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardHome } from './pages/DashboardHome';
import { StaffList } from './pages/users/StaffList';
import { ClientList } from './pages/users/ClientList';
import { SettingsLayout } from './components/settings/SettingsLayout';
import { StoragePage } from './components/settings/StoragePage';
import { CategoriesPage } from './components/settings/CategoriesPage';
import { BrandsPage } from './components/settings/BrandsPage';
import { PresentationsPage } from './components/settings/PresentationsPage';
import { UnitsPage } from './components/settings/UnitsPage';
import { SuppliersPage } from './components/settings/SuppliersPage';
import { RolesPage } from './components/settings/RolesPage';
import { ProductsPage } from './components/settings/ProductsPage';
//import { ReportsPage } from './pages/reports/ReportsPage';
import { ReportsLayout } from './components/reports/ReportsLayout';
import { SalesReport } from './pages/reports/SalesReport';
import { ProfitsReport } from './pages/reports/ProfitsReport';
import { MovementsReport } from './pages/reports/MovementsReport';
import { InventoryPage } from './pages/inventory/InventoryPage'
import { SalesPage } from './pages/sales/SalesPage';	
import { SalesPageAdmin } from './pages/sales/SalesPageAdmin';
import { useProfile } from './hooks/useProfile';


function App() {
  const { profile } = useProfile();
  const isAdmin = profile?.user_type === 'Administrador';

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/index" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="users/staff" element={<StaffList />} />
          <Route path="users/clients" element={<ClientList />} />
          <Route path="settings" element={<SettingsLayout />} />
          <Route path="settings/almacen" element={<StoragePage />} />
          <Route path="settings/categorias" element={<CategoriesPage />} />
          <Route path="settings/marcas" element={<BrandsPage />} />
          <Route path="settings/presentaciones" element={<PresentationsPage />} />
          <Route path="settings/unidades" element={<UnitsPage />} />
          <Route path="settings/proveedores" element={<SuppliersPage />} />
          <Route path="settings/roles" element={<RolesPage />} />
          <Route path="settings/productos" element={<ProductsPage />} />
          <Route path="reports" element={<ReportsLayout />} />
          <Route path="reports/movements" element={<MovementsReport />} />
          <Route path="reports/sales" element={<SalesReport />} />
          <Route path="reports/profits" element={<ProfitsReport />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="sales" element={isAdmin ? <SalesPageAdmin /> : <SalesPage />} />
          <Route path="sales1" element={<SalesPageAdmin />} />
          
        </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;