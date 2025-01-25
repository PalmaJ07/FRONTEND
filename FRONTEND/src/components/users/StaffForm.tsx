import React, { useState, useEffect } from 'react';
import { Staff, CreateStaffData } from '../../types/users';
import { createConfigService } from '../../services/config';

const storageService = createConfigService('almacen');

interface StaffFormProps {
  onSubmit: (data: CreateStaffData | Partial<Staff>) => Promise<void>;
  onCancel: () => void;
  initialData?: Staff;
  isEditing?: boolean;
}

const USER_TYPES = [
  { value: 2, label: 'Administrador' },
  { value: 3, label: 'Inventario' },
  { value: 4, label: 'Ventas' },
  { value: 5, label: 'Reportes' }
];

export function StaffForm({ onSubmit, onCancel, initialData, isEditing = false }: StaffFormProps) {
  const [formData, setFormData] = useState<CreateStaffData>({
    name: '',
    id_personal: '',
    phone: '',
    username: '',
    password: '',
    user_type: 2,
    estado: 1,
    almacen_asignado: null
  });

  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    // Load warehouses
    const loadWarehouses = async () => {
      try {
        const response = await storageService.getList(1, 100);
        setWarehouses(response.items);
      } catch (error) {
        console.error('Error loading warehouses:', error);
      }
    };
    loadWarehouses();

    // Set initial data if editing
    if (initialData) {
      setFormData({
        name: initialData.name,
        id_personal: initialData.id_personal,
        phone: initialData.phone,
        username: initialData.username,
        user_type: USER_TYPES.find(t => t.label === initialData.userType)?.value || 2,
        estado: initialData.isActive ? 1 : 0,
        almacen_asignado: initialData.almacen_asignado,
        password: '' // Password is not included when editing
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['user_type', 'almacen_asignado'].includes(name) 
        ? value === '' ? null : parseInt(value, 10) 
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="id_personal" className="block text-sm font-medium text-gray-700 mb-1">
          ID Personal
        </label>
        <input
          type="text"
          id="id_personal"
          name="id_personal"
          value={formData.id_personal}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Teléfono
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
          Usuario
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {!isEditing && (
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      )}

      <div>
        <label htmlFor="user_type" className="block text-sm font-medium text-gray-700 mb-1">
          Tipo de Usuario
        </label>
        <select
          id="user_type"
          name="user_type"
          value={formData.user_type}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          {USER_TYPES.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="almacen_asignado" className="block text-sm font-medium text-gray-700 mb-1">
          Almacén Asignado
        </label>
        <select
          id="almacen_asignado"
          name="almacen_asignado"
          value={formData.almacen_asignado || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Sin almacén asignado</option>
          {warehouses.map(warehouse => (
            <option key={warehouse.id} value={parseInt(atob(warehouse.id))}>
              {warehouse.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
        >
          {isEditing ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
}