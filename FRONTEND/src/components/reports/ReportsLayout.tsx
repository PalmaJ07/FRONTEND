import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, TrendingUp, DollarSign } from 'lucide-react';
import { SettingsCard } from '../settings/SettingsCard';

const menuItems = [
  { 
    path: '/index/reports/movements', 
    title: 'Reporte de Movimientos',
    description: 'Ver el historial de movimientos entre almacenes',
    icon: ArrowLeftRight 
  },
  { 
    path: '/index/reports/sales', 
    title: 'Reporte de Ventas',
    description: 'Consultar el registro de todas las ventas realizadas',
    icon: TrendingUp 
  },
  { 
    path: '/index/reports/profits', 
    title: 'Reporte de Ganancias',
    description: 'Analizar las ganancias generadas por las ventas',
    icon: DollarSign 
  },
];

export function ReportsLayout() {
  const navigate = useNavigate();

  return (
    <div className="h-full space-y-6">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Reportes</h1>
        <p className="text-gray-600">Selecciona un tipo de reporte para visualizar</p>
      </div>

      <div className="px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <div key={item.path}>
            <SettingsCard {...item} />
          </div>
        ))}
      </div>
    </div>
  );
}