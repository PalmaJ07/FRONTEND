import React, { useState, useEffect } from 'react';
import { Product, ProductFormData } from '../../types/products';
import { Category } from '../../types/categories';
import { Brand } from '../../types/brands';
import { categoryService } from '../../services/categories';
import { brandService } from '../../services/brands';

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Product;
  isEditing?: boolean;
}

export function ProductForm({ onSubmit, onCancel, initialData, isEditing = false }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    config_categoria: initialData?.categoryId || -1,
    config_marca: initialData?.brandId || -1,
    descripcion: initialData?.description || '',
    codigo: initialData?.code || '',
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesData, brandsData] = await Promise.all([
          categoryService.getAll(),
          brandService.getAll()
        ]);
        
        setCategories(categoriesData);
        setBrands(brandsData);

        // Si estamos editando, asegurarnos de que los valores iniciales sean correctos
        if (isEditing && initialData) {
          setFormData(prev => ({
            ...prev,
            config_categoria: initialData.categoryId,
            config_marca: initialData.brandId,
          }));
        }
      } catch (error) {
        console.error('Error loading form data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isEditing, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'config_categoria' || name === 'config_marca') {
      const numValue = parseInt(value);
      setFormData(prev => ({
        ...prev,
        [name]: numValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.config_categoria === -1 || formData.config_marca === -1) {
      alert('Por favor seleccione una categoría y una marca');
      return;
    }
    await onSubmit(formData);
  };

  if (isLoading) {
    return <div className="text-center">Cargando...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="config_categoria" className="block text-sm font-medium text-gray-700 mb-1">
          Categoría
        </label>
        <select
          id="config_categoria"
          name="config_categoria"
          value={formData.config_categoria}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="-1">Seleccione</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="config_marca" className="block text-sm font-medium text-gray-700 mb-1">
          Marca
        </label>
        <select
          id="config_marca"
          name="config_marca"
          value={formData.config_marca}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="-1">Seleccione</option>
          {brands.map(brand => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
          Descripción
        </label>
        <input
          type="text"
          id="descripcion"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 mb-1">
          Código
        </label>
        <input
          type="text"
          id="codigo"
          name="codigo"
          value={formData.codigo}
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