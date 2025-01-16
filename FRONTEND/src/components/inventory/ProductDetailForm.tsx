import React, { useState, useEffect } from 'react';
import { CreateProductDetailData, ProductDetail } from '../../types/inventory';
import { Product } from '../../types/products';
import { productService } from '../../services/products';
import { supplierService } from '../../services/suppliers';
import { createConfigService } from '../../services/config';

const unitsService = createConfigService('unidad-medida');
const presentationsService = createConfigService('presentacion');

interface ProductDetailFormProps {
  onSubmit: (data: CreateProductDetailData) => Promise<void>;
  onCancel: () => void;
  initialData?: ProductDetail;
  isEditing?: boolean;
}

export function ProductDetailForm({ onSubmit, onCancel, initialData, isEditing = false }: ProductDetailFormProps) {
  const [formData, setFormData] = useState<CreateProductDetailData>({
    producto: initialData?.producto || -1,
    config_unidad_medida: initialData?.config_unidad_medida || -1,
    peso: initialData?.peso || 0,
    config_presentacion_producto: initialData?.config_presentacion_producto || -1,
    unidades_por_presentacion: initialData?.unidades_por_presentacion || 0,
    precio_venta_presentacion: initialData?.precio_venta_presentacion || 0,
    precio_venta_unidades: initialData?.precio_venta_unidades || 0,
    proveedor: initialData?.proveedor || -1,
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [units, setUnits] = useState<{ id: string; name: string }[]>([]);
  const [presentations, setPresentations] = useState<{ id: string; name: string }[]>([]);
  const [suppliers, setSuppliers] = useState<{ id: string; supplierName: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, unitsData, presentationsData, suppliersData] = await Promise.all([
          productService.getList(1, 100),
          unitsService.getList(1, 100),
          presentationsService.getList(1, 100),
          supplierService.getList(1, 100),
        ]);
        
        setProducts(productsData.items);
        setUnits(unitsData.items);
        setPresentations(presentationsData.items);
        setSuppliers(suppliersData.items);
      } catch (error) {
        console.error('Error loading form data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: ['producto', 'config_unidad_medida', 'config_presentacion_producto', 'proveedor'].includes(name)
        ? parseInt(value)
        : parseFloat(value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.producto === -1 || formData.config_unidad_medida === -1 || 
        formData.config_presentacion_producto === -1 || formData.proveedor === -1) {
      alert('Por favor complete todos los campos requeridos');
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
        <label htmlFor="producto" className="block text-sm font-medium text-gray-700 mb-1">
          Producto
        </label>
        <select
          id="producto"
          name="producto"
          value={formData.producto}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="-1">Seleccione</option>
          {products.map(product => (
            <option key={product.id} value={parseInt(atob(product.id))}>
              {product.description}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="config_unidad_medida" className="block text-sm font-medium text-gray-700 mb-1">
          Unidad de Medida
        </label>
        <select
          id="config_unidad_medida"
          name="config_unidad_medida"
          value={formData.config_unidad_medida}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="-1">Seleccione</option>
          {units.map(unit => (
            <option key={unit.id} value={parseInt(atob(unit.id))}>
              {unit.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="peso" className="block text-sm font-medium text-gray-700 mb-1">
          Peso
        </label>
        <input
          type="number"
          id="peso"
          name="peso"
          value={formData.peso}
          onChange={handleChange}
          step="0.01"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="config_presentacion_producto" className="block text-sm font-medium text-gray-700 mb-1">
          Presentación
        </label>
        <select
          id="config_presentacion_producto"
          name="config_presentacion_producto"
          value={formData.config_presentacion_producto}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="-1">Seleccione</option>
          {presentations.map(presentation => (
            <option key={presentation.id} value={parseInt(atob(presentation.id))}>
              {presentation.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="unidades_por_presentacion" className="block text-sm font-medium text-gray-700 mb-1">
          Unidades por Presentación
        </label>
        <input
          type="number"
          id="unidades_por_presentacion"
          name="unidades_por_presentacion"
          value={formData.unidades_por_presentacion}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="precio_venta_presentacion" className="block text-sm font-medium text-gray-700 mb-1">
          Precio Venta Presentación
        </label>
        <input
          type="number"
          id="precio_venta_presentacion"
          name="precio_venta_presentacion"
          value={formData.precio_venta_presentacion}
          onChange={handleChange}
          step="0.01"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="precio_venta_unidades" className="block text-sm font-medium text-gray-700 mb-1">
          Precio Venta Unidades
        </label>
        <input
          type="number"
          id="precio_venta_unidades"
          name="precio_venta_unidades"
          value={formData.precio_venta_unidades}
          onChange={handleChange}
          step="0.01"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="proveedor" className="block text-sm font-medium text-gray-700 mb-1">
          Proveedor
        </label>
        <select
          id="proveedor"
          name="proveedor"
          value={formData.proveedor}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="-1">Seleccione</option>
          {suppliers.map(supplier => (
            <option key={supplier.id} value={parseInt(atob(supplier.id))}>
              {supplier.supplierName}
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