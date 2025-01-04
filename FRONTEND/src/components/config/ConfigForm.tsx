import React, { useState } from 'react';
import { ConfigItem, ConfigFormData } from '../../types/config';

interface ConfigFormProps {
  onSubmit: (data: ConfigFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: ConfigItem;
  isEditing?: boolean;
}

export function ConfigForm({ onSubmit, onCancel, initialData, isEditing = false }: ConfigFormProps) {
  const [formData, setFormData] = useState<ConfigFormData>({
    nombre: initialData?.name || '',
    abreviatura: initialData?.abbreviation || '',
    orden: initialData?.order || 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'orden' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre
        </label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="abreviatura" className="block text-sm font-medium text-gray-700 mb-1">
          Abreviatura
        </label>
        <input
          type="text"
          id="abreviatura"
          name="abreviatura"
          value={formData.abreviatura}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="orden" className="block text-sm font-medium text-gray-700 mb-1">
          Orden
        </label>
        <input
          type="number"
          id="orden"
          name="orden"
          value={formData.orden}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          min="0"
        />
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