interface StaffFiltersProps {
  userType: string;
  status: string;
  onUserTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

const USER_TYPES = [
  { value: '', label: 'Todos' },
  { value: '2', label: 'Administrador' },
  { value: '3', label: 'Inventario' },
  { value: '4', label: 'Ventas' },
  { value: '5', label: 'Reportes' }
];

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: '1', label: 'Activo' },
  { value: '0', label: 'Inactivo' }
];

export function StaffFilters({
  userType,
  status,
  onUserTypeChange,
  onStatusChange,
}: StaffFiltersProps) {
  return (
    <div className="flex gap-4">
      <div>
        <label htmlFor="userType" className="block text-sm font-medium text-gray-700 mb-1">
          Tipo de Usuario
        </label>
        <select
          id="userType"
          value={userType}
          onChange={(e) => onUserTypeChange(e.target.value)}
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          {USER_TYPES.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
          Estado
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          {STATUS_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}