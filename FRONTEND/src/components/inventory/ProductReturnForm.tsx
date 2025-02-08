import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { X } from 'lucide-react';
import { CreateProductReturnData, ProductDetail } from '../../types/inventory';
import { inventoryService } from '../../services/inventory';
import { createConfigService } from '../../services/config';

const storageService = createConfigService('almacen');

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

  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductDetail[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar almacenes
  useEffect(() => {
    const loadWarehouses = async () => {
      try {
        const response = await storageService.getList(1, 100);
        setWarehouses(response.items);
      } catch (error) {
        console.error('Error loading warehouses:', error);
      }
    };
    loadWarehouses();
  }, []);

  // Cargar productos cuando se selecciona almacén
  useEffect(() => {
    const loadProducts = async () => {
      if (!selectedWarehouse) {
        setProducts([]);
        setFilteredProducts([]);
        return;
      }

      try {
        setIsLoading(true);
        const response = await inventoryService.getList(
          1, 
          100, 
          undefined,
          parseInt(atob(selectedWarehouse))
        );
        setProducts(response.items);
        setFilteredProducts(response.items);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [selectedWarehouse]);

  // Filtrar productos basado en búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter(product => 
      product.n_producto?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const handleWarehouseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedWarehouse(value);
    setSelectedProduct(null);
    setFormData(prev => ({
      ...prev,
      producto_detalle: ''
    }));
  };

  const handleProductSelect = (product: ProductDetail) => {
    setSelectedProduct(product);
    setFormData(prev => ({
      ...prev,
      producto_detalle: product.id,
      unidades_por_presentacion: product.unidades_por_presentacion,
      fecha_expiracion: product.fecha_expiracion || ''
    }));
    setShowProductSearch(false);
    setSearchTerm('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['cantidad_por_presentacion', 'unidades_por_presentacion'].includes(name)
        ? parseInt(value) || 0
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.producto_detalle || 
        formData.cantidad_por_presentacion <= 0 || 
        formData.unidades_por_presentacion <= 0) {
      alert('Por favor complete todos los campos correctamente');
      return;
    }
    
    await onSubmit(formData);
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.product-search-container')) {
        setShowProductSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLoading && !warehouses.length) {
    return <div className="text-center">Cargando...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="warehouse" className="block text-sm font-medium text-gray-700 mb-1">
          Almacén
        </label>
        <select
          id="warehouse"
          value={selectedWarehouse}
          onChange={handleWarehouseChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Seleccione almacén</option>
          {warehouses.map(warehouse => (
            <option key={warehouse.id} value={warehouse.id}>
              {warehouse.name}
            </option>
          ))}
        </select>
      </div>

      <div className="product-search-container relative">
        <label htmlFor="producto" className="block text-sm font-medium text-gray-700 mb-1">
          Producto
        </label>
        <div
          onClick={() => selectedWarehouse && setShowProductSearch(true)}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
            !selectedWarehouse ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer hover:border-blue-500'
          } text-gray-900`} // Añadido text-gray-900 para asegurar visibilidad
        >
          {selectedProduct 
            ? selectedProduct.producto
            : 'Seleccione un producto'}
        </div>

        {showProductSearch && (
          <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="p-2 border-b relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar producto..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md pr-8"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowProductSearch(false)}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-gray-900" // Añadido text-gray-900
                >
                  {product.producto}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedProduct && (
        <>
          <div>
            <label htmlFor="fecha_expiracion" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Expiración
            </label>
            <input
              type="text"
              id="fecha_expiracion"
              name="fecha_expiracion"
              value={formData.fecha_expiracion}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              readOnly
            />
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </>
      )}

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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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