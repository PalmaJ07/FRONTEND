import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { CreateProductDetailEntryData, ProductDetailEntry } from '../../types/inventory';
import { Product } from '../../types/products';
import { productService } from '../../services/products';
import { inventoryService } from '../../services/inventory';
import { createConfigService } from '../../services/config';

const storageService = createConfigService('almacen');

interface ProductEntryFormProps {
  onSubmit: (data: CreateProductDetailEntryData) => Promise<void>;
  onCancel: () => void;
  initialData?: ProductDetailEntry;
  isEditing?: boolean;
}

export function ProductEntryForm({ onSubmit, onCancel, initialData, isEditing = false }: ProductEntryFormProps) {
  const getCurrentDate = () => {
    const now = new Date();
    const managua = toZonedTime(now, 'America/Managua');
    return format(managua, 'yyyy-MM-dd');
  };

  const [formData, setFormData] = useState<CreateProductDetailEntryData>({
    producto: initialData?.producto || -1,
    producto_detalle: initialData?.producto_detalle || '',
    config_almacen: initialData?.config_almacen || -1,
    cantidad_por_presentacion: initialData?.cantidad_por_presentacion || 0,
    unidades_por_presentacion: initialData?.unidades_por_presentacion || 0,
    precio_compra_presentacion: initialData?.precio_compra_presentacion || 0,
    precio_compra_unidades: initialData?.precio_compra_unidades || 0,
    fecha_expiracion: initialData?.fecha_expiracion || '',
    fecha_ingreso: initialData?.fecha_ingreso || getCurrentDate(),
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [productDetails, setProductDetails] = useState<any[]>([]);
  const [storage, setStorage] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, detailsData, storageData] = await Promise.all([
          productService.getList(1, 100),
          inventoryService.getList(1, 100),
          storageService.getList(1, 100),
        ]);
        
        setProducts(productsData.items);
        setProductDetails(detailsData.items);
        setStorage(storageData.items);
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
      [name]: ['producto', 'config_almacen'].includes(name)
        ? parseInt(value)
        : name === 'producto_detalle'
        ? value
        : ['cantidad_por_presentacion', 'unidades_por_presentacion', 'precio_compra_presentacion', 'precio_compra_unidades'].includes(name)
        ? parseFloat(value)
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.producto === -1 || !formData.producto_detalle || formData.config_almacen === -1) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    try {
      // Primero creamos el ingreso de producto
      await onSubmit(formData);

      // Luego actualizamos el detalle del producto
      const updateData = {
        cantidad_por_presentacion: formData.cantidad_por_presentacion,
        unidades_por_presentacion: formData.unidades_por_presentacion,
        fecha_expiracion: formData.fecha_expiracion,
        almacen: formData.config_almacen
      };

      await inventoryService.update(formData.producto_detalle, updateData);
    } catch (error) {
      console.error('Error en el proceso de ingreso:', error);
      throw error;
    }
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
        <label htmlFor="producto_detalle" className="block text-sm font-medium text-gray-700 mb-1">
          Detalle de Producto
        </label>
        <select
          id="producto_detalle"
          name="producto_detalle"
          value={formData.producto_detalle}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Seleccione</option>
          {productDetails.map(detail => (
            <option key={detail.id} value={detail.id}>
              {`${getProductName(detail.producto)} - ${detail.peso}kg`}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="config_almacen" className="block text-sm font-medium text-gray-700 mb-1">
          Almacén
        </label>
        <select
          id="config_almacen"
          name="config_almacen"
          value={formData.config_almacen}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="-1">Seleccione</option>
          {storage.map(item => (
            <option key={item.id} value={parseInt(atob(item.id))}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="cantidad_por_presentacion" className="block text-sm font-medium text-gray-700 mb-1">
          Cantidad por Presentación
        </label>
        <input
          type="number"
          id="cantidad_por_presentacion"
          name="cantidad_por_presentacion"
          value={formData.cantidad_por_presentacion}
          onChange={handleChange}
          step="1"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
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
          step="1"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="precio_compra_presentacion" className="block text-sm font-medium text-gray-700 mb-1">
          Precio Compra Presentación
        </label>
        <input
          type="number"
          id="precio_compra_presentacion"
          name="precio_compra_presentacion"
          value={formData.precio_compra_presentacion}
          onChange={handleChange}
          step="0.01"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="precio_compra_unidades" className="block text-sm font-medium text-gray-700 mb-1">
          Precio Compra Unidades
        </label>
        <input
          type="number"
          id="precio_compra_unidades"
          name="precio_compra_unidades"
          value={formData.precio_compra_unidades}
          onChange={handleChange}
          step="0.01"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="fecha_expiracion" className="block text-sm font-medium text-gray-700 mb-1">
          Fecha de Expiración
        </label>
        <input
          type="date"
          id="fecha_expiracion"
          name="fecha_expiracion"
          value={formData.fecha_expiracion}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="fecha_ingreso" className="block text-sm font-medium text-gray-700 mb-1">
          Fecha de Ingreso
        </label>
        <input
          type="date"
          id="fecha_ingreso"
          name="fecha_ingreso"
          value={formData.fecha_ingreso}
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

  function getProductName(productId: number) {
    const product = products.find(p => parseInt(atob(p.id)) === productId);
    return product?.description || 'N/A';
  }
}