import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, Package, ShoppingCart, Settings, FileText } from 'lucide-react';
import { useProfile } from '../../hooks/useProfile';
import { hasPermission } from '../../config/permissions';

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path?: string;
  subItems?: {
    label: string;
    path: string;
  }[];
}

const menuItems: MenuItem[] = [
  { icon: Home, label: 'Inicio', path: '/index' },
  {
    icon: Users,
    label: 'Usuarios',
    subItems: [
      { label: 'Colaboradores', path: '/index/users/staff' },
      { label: 'Clientes', path: '/index/users/clients' }
    ]
  },
  { icon: Package, label: 'Inventario', path: '/index/inventory' },
  { icon: ShoppingCart, label: 'Ventas', path: '/index/sales' },
  { icon: FileText, label: 'Reportes', path: '/index/reports' },
  { icon: Settings, label: 'Configuraciones', path: '/index/settings' }
];

export function Sidebar() {
  const [expandedItem, setExpandedItem] = React.useState<string | null>(null);
  const { profile } = useProfile();
  //const location = useLocation();

  if (!profile) return null;

  const filteredMenuItems = menuItems.filter(item => {
    if (item.path) {
      return hasPermission(item.path, profile.user_type);
    }
    if (item.subItems) {
      const hasPermittedSubItems = item.subItems.some(subItem => 
        hasPermission(subItem.path, profile.user_type)
      );
      return hasPermittedSubItems;
    }
    return false;
  });

  return (
    <aside className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <div className="text-xl font-bold mb-8 pl-4">Mi Dashboard</div>
      <nav>
        {filteredMenuItems.map((item) => (
          <div key={item.label} className="mb-2">
            {item.subItems ? (
              <div>
                <button
                  onClick={() => setExpandedItem(expandedItem === item.label ? null : item.label)}
                  className="flex items-center w-full p-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  <span>{item.label}</span>
                </button>
                {expandedItem === item.label && (
                  <div className="ml-8 mt-2 space-y-2">
                    {item.subItems
                      .filter(subItem => hasPermission(subItem.path, profile.user_type))
                      .map((subItem) => (
                        <NavLink
                          key={subItem.path}
                          to={subItem.path}
                          className={({ isActive }) =>
                            `block p-2 rounded-lg hover:bg-gray-700 transition-colors ${
                              isActive ? 'bg-gray-700' : ''
                            }`
                          }
                        >
                          {subItem.label}
                        </NavLink>
                      ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                to={item.path!}
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors ${
                    isActive ? 'bg-gray-700' : ''
                  }`
                }
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span>{item.label}</span>
              </NavLink>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}