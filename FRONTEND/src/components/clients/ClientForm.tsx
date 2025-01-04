import React, { useState } from 'react';
import { Client, CreateClientData } from '../../types/clients';

interface ClientFormProps {
  onSubmit: (data: CreateClientData) => Promise<void>;
  onCancel: () => void;
  initialData?: Client;
  isEditing?: boolean;
}

export function ClientForm({ onSubmit, onCancel, initialData, isEditing = false }: ClientFormProps) {
  const [formData, setFormData] = useState<CreateClientData>({
    nombre: initialData?.name || '',
    telefono: initialData?.phone || '',
    direccion: initialData?.address || '',
    id_personal: initialData?.personalId || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
        <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">
          Dirección
        </label>
        <textarea
          id="direccion"
          name="direccion"
          value={formData.direccion}
          onChange={handleChange}
          rows={3}
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