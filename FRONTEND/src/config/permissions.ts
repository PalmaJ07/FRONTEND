export type UserType = 'Root' | 'Administrador' | 'Inventario' | 'Ventas' | 'Reportes';

interface RoutePermission {
  path: string;
  allowedRoles: UserType[];
  defaultForRoles?: UserType[];
  hideDelete?: UserType[];
}

export const ROUTE_PERMISSIONS: RoutePermission[] = [
  // Dashboard
  {
    path: '/index',
    allowedRoles: ['Root', 'Administrador', 'Inventario', 'Reportes'],
  },
  // Users
  {
    path: '/index/users/staff',
    allowedRoles: ['Root', 'Administrador'],
  },
  {
    path: '/index/users/clients',
    allowedRoles: ['Root', 'Administrador', 'Ventas'],
  },
  // Inventory
  {
    path: '/index/inventory',
    allowedRoles: ['Root', 'Administrador', 'Inventario'],
    defaultForRoles: ['Inventario']
  },
  // Sales
  {
    path: '/index/sales',
    allowedRoles: ['Root', 'Administrador', 'Ventas'],
    defaultForRoles: ['Ventas'],
    hideDelete: ['Ventas']
  },
  // Reports
  {
    path: '/index/reports',
    allowedRoles: ['Root', 'Administrador', 'Reportes'],
    defaultForRoles: ['Reportes']
  },
  {
    path: '/index/reports/movements',
    allowedRoles: ['Root', 'Administrador', 'Reportes'],
    defaultForRoles: ['Reportes']
  },
  {
    path: '/index/reports/sales',
    allowedRoles: ['Root', 'Administrador', 'Reportes'],
    defaultForRoles: ['Reportes']
  },
  {
    path: '/index/reports/profits',
    allowedRoles: ['Root', 'Administrador', 'Reportes'],
    defaultForRoles: ['Reportes']
  },
  // Settings
  {
    path: '/index/settings',
    allowedRoles: ['Root', 'Administrador', 'Inventario'],
  },
  // Settings subpages
  {
    path: '/index/settings/almacen',
    allowedRoles: ['Root', 'Administrador', 'Inventario'],
  },
  {
    path: '/index/settings/categorias',
    allowedRoles: ['Root', 'Administrador', 'Inventario'],
  },
  {
    path: '/index/settings/marcas',
    allowedRoles: ['Root', 'Administrador', 'Inventario'],
  },
  {
    path: '/index/settings/presentaciones',
    allowedRoles: ['Root', 'Administrador', 'Inventario'],
  },
  {
    path: '/index/settings/unidades',
    allowedRoles: ['Root', 'Administrador', 'Inventario'],
  },
  {
    path: '/index/settings/proveedores',
    allowedRoles: ['Root', 'Administrador', 'Inventario'],
  },
  {
    path: '/index/settings/roles',
    allowedRoles: ['Root', 'Administrador'],
  },
  {
    path: '/index/settings/productos',
    allowedRoles: ['Root', 'Administrador', 'Inventario'],
  },
];

export const getDefaultRoute = (userType: UserType): string => {
  const defaultRoute = ROUTE_PERMISSIONS.find(route => 
    route.defaultForRoles?.includes(userType)
  );
  return defaultRoute?.path || '/index';
};

export const hasPermission = (path: string, userType: UserType): boolean => {
  const permission = ROUTE_PERMISSIONS.find(route => route.path === path);
  return permission ? permission.allowedRoles.includes(userType) : false;
};

export const canDelete = (path: string, userType: UserType): boolean => {
  const permission = ROUTE_PERMISSIONS.find(route => route.path === path);
  return permission ? !permission.hideDelete?.includes(userType) : true;
};