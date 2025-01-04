import { useNavigate } from 'react-router-dom';
import { 
  Store, 
  Tags, 
  Badge, 
  Package, 
  Scale, 
  Truck, 
  ShieldCheck 
} from 'lucide-react';
import { SettingsCard } from './SettingsCard';

const menuItems = [
  { 
    path: '/index/settings/almacen', 
    title: 'Almacén',
    description: 'Gestiona los almacenes y su configuración',
    icon: Store 
  },
  { 
    path: '/index/settings/categorias', 
    title: 'Categorías',
    description: 'Administra las categorías de productos',
    icon: Tags 
  },
  { 
    path: '/index/settings/marcas', 
    title: 'Marcas',
    description: 'Gestiona las marcas de productos',
    icon: Badge 
  },
  { 
    path: '/index/settings/presentaciones', 
    title: 'Presentación',
    description: 'Configura las presentaciones de productos',
    icon: Package 
  },
  { 
    path: '/index/settings/unidades', 
    title: 'Unidad de Medida',
    description: 'Administra las unidades de medida',
    icon: Scale 
  },
  { 
    path: '/index/settings/proveedores', 
    title: 'Proveedor',
    description: 'Gestiona los proveedores del sistema',
    icon: Truck 
  },
  { 
    path: '/index/settings/roles', 
    title: 'Roles',
    description: 'Configura los roles y permisos',
    icon: ShieldCheck 
  },
];

export function SettingsLayout() {
  const navigate = useNavigate();

  return (
    <div className="h-full space-y-6">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Configuraciones</h1>
        <p className="text-gray-600">Selecciona una opción para gestionar</p>
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