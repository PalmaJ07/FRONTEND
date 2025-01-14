import React, { useState } from 'react';
import { Supplier, SupplierFormData } from '../../types/suppliers';

interface SupplierFormProps {
  onSubmit: (data: SupplierFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Supplier;
  isEditing?: boolean;
}

export function SupplierForm({ onSubmit, onCancel, initialData, isEditing = false }: SupplierFormProps) {
  const [formData, setFormData] = useState<SupplierFormData>({
    nombre_proveedor: initialData?.supplierName || '',
    telefono: initialData?.phone || '',
    encargado: initialData?.manager || '',
    telefono_encargado: initialData?.managerPhone || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="nombre_proveedor" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre del Proveedor
        </label>
        <input
          type="text"
          id="nombre_proveedor"
          name="nombre_proveedor"
          value={formData.nombre_proveedor}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
          Teléfono
        </label>
        <input
          type="tel"
          id="telefono"
          name="telefono"
          value={formData.telefono}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="encargado" className="block text-sm font-medium text-gray-700 mb-1">
          Encargado
        </label>
        <input
          type="text"
          id="encargado"
          name="encargado"
          value={formData.encargado}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="telefono_encargado" className="block text-sm font-medium text-gray-700 mb-1">
          Teléfono del Encargado
        </label>
        <input
          type="tel"
          id="telefono_encargado"
          name="telefono_encargado"
          value={formData.telefono_encargado}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
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