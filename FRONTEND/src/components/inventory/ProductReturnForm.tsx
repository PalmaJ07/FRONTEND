import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { CreateProductReturnData, ProductDetail } from '../../types/inventory';
import { inventoryService } from '../../services/inventory';

interface ProductReturnFormProps {
  onSubmit: (data: CreateProductReturnData) => Promise<void>;
  onCancel: () => void;
}

export function ProductReturnForm({ onSubmit, onCancel }: ProductReturnFormProps) {
  const getCurrentDate = () => {
    const now = new Date();
    const managua = toZonedTime(now, 'America/Managua');
    return format(managua, 'yyyy-MM-dd');
  };

  const [formData, setFormData] = useState<CreateProductReturnData>({
    producto_detalle: '',
    cantidad_por_presentacion: 0,
    unidades_por_presentacion: 0,
    fecha: getCurrentDate(),
    fecha_expiracion: ''
  });

  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [expirationDates, setExpirationDates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await inventoryService.getList(1, 100);
        setProducts(response.items);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const productId = e.target.value;
    setSelectedProduct(productId);
    // Send the numeric ID instead of encrypted_id
    setFormData(prev => ({ ...prev, producto_detalle: atob(productId) }));
    
    if (productId) {
      const dates = products
        .filter(p => p.id === productId)
        .map(p => p.fecha_expiracion)
        .filter((date): date is string => date !== null);
      
      setExpirationDates(dates);
    } else {
      setExpirationDates([]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['cantidad_por_presentacion', 'unidades_por_presentacion'].includes(name)
        ? parseInt(value)
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          value={selectedProduct}
          onChange={handleProductChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Seleccione un producto</option>
          {products.map(product => (
            <option key={product.id} value={product.id}>
              {product.producto}
            </option>
          ))}
        </select>
      </div>

      {selectedProduct && (
        <div>
          <label htmlFor="fecha_expiracion" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de Expiración
          </label>
          <select
            id="fecha_expiracion"
            name="fecha_expiracion"
            value={formData.fecha_expiracion}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Seleccione fecha de expiración</option>
            {expirationDates.map(date => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>
        </div>
      )}

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
          min="1"
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
          min="1"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-1">
          Fecha
        </label>
        <input
          type="date"
          id="fecha"
          name="fecha"
          value={formData.fecha}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
          readOnly
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
          Crear Devolución
        </button>
      </div>
    </form>
  );
}