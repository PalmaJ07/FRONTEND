import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { X } from 'lucide-react';
import { CreateProductMovementData, ProductDetailWithPrices } from '../../types/inventory';
import { Product } from '../../types/products';
import { productService } from '../../services/products';
import { inventoryService } from '../../services/inventory';
import { createConfigService } from '../../services/config';

const storageService = createConfigService('almacen');
const unitsService = createConfigService('unidad-medida');

interface ProductMovementFormProps {
  onSubmit: (data: CreateProductMovementData) => Promise<void>;
  onCancel: () => void;
}

export function ProductMovementForm({ onSubmit, onCancel }: ProductMovementFormProps) {
  const getCurrentDate = () => {
    const now = new Date();
    const managua = toZonedTime(now, 'America/Managua');
    return format(managua, 'yyyy-MM-dd');
  };

  const [formData, setFormData] = useState<CreateProductMovementData>({
    producto: '',
    producto_detalle: '',
    config_almacen: '',
    cantidad_por_presentacion: '',
    unidades_por_presentacion: '',
    precio_compra_presentacion: '',
    precio_compra_unidades: '',
    fecha_expiracion: '',
    fecha_ingreso: getCurrentDate(),
  });

  const [sourceStorage, setSourceStorage] = useState<string>('');
  const [destinationStorage, setDestinationStorage] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedProductDetail, setSelectedProductDetail] = useState<string>('');
  const [storage, setStorage] = useState<{ id: string; name: string }[]>([]);
  const [units, setUnits] = useState<{ id: string; name: string; abbreviation: string }[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productDetails, setProductDetails] = useState<ProductDetailWithPrices[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [availableExpirationDates, setAvailableExpirationDates] = useState<string[]>([]);

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [storageResponse, unitsResponse] = await Promise.all([
          storageService.getList(1, 100),
          unitsService.getList(1, 100)
        ]);
        setStorage(storageResponse.items);
        setUnits(unitsResponse.items);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // Cargar productos cuando se selecciona almacén origen
  useEffect(() => {
    const loadProducts = async () => {
      if (!sourceStorage) {
        setProducts([]);
        setProductDetails([]);
        return;
      }

      try {
        setIsLoading(true);
        const storageId = parseInt(atob(sourceStorage));
        const response = await inventoryService.getList(1, 100, undefined, storageId.toString());
        
        const uniqueProductIds = new Set(response.items.map(detail => detail.producto));
        const productsResponse = await productService.getList(1, 100);
        
        const filteredProducts = productsResponse.items.filter(product => 
          uniqueProductIds.has(parseInt(atob(product.id)))
        );
        
        setProducts(filteredProducts);
        setFilteredProducts(filteredProducts);
        setProductDetails(response.items);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [sourceStorage]);

  // Filtrar productos basado en búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter(product =>
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  // Cargar detalles del producto cuando se selecciona un producto
  useEffect(() => {
    const loadProductDetails = async () => {
      if (!sourceStorage || !selectedProduct) {
        setProductDetails([]);
        return;
      }

      try {
        setIsLoading(true);
        const storageId = parseInt(atob(sourceStorage));
        const productId = parseInt(atob(selectedProduct));
        
        const response = await inventoryService.getList(
          1, 
          100, 
          undefined, 
          storageId.toString(),
          productId.toString()
        );
        
        // Procesar los detalles del producto
        const details = response.items.map(detail => ({
          ...detail,
          fechas_expiracion: [detail.fecha_expiracion].filter((date): date is string => date !== null)
        }));
        
        setProductDetails(details);
        
        // Actualizar fechas de expiración disponibles
        const dates = details
          .map(detail => detail.fecha_expiracion)
          .filter((date): date is string => date !== null);
        setAvailableExpirationDates(Array.from(new Set(dates)));
      } catch (error) {
        console.error('Error loading product details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProductDetails();
  }, [sourceStorage, selectedProduct]);

  const handleSourceStorageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSourceStorage(value);
    setSelectedProduct('');
    setSelectedProductDetail('');
    setFormData(prev => ({
      ...prev,
      producto: '',
      producto_detalle: '',
      fecha_expiracion: ''
    }));
  };

  const handleDestinationStorageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === sourceStorage) {
      alert('El almacén de destino no puede ser igual al de origen');
      return;
    }
    setDestinationStorage(value);
    setFormData(prev => ({
      ...prev,
      config_almacen: parseInt(atob(value)).toString()
    }));
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProduct(productId);
    setShowProductSearch(false);
    setSearchTerm('');
    setSelectedProductDetail('');
    setFormData(prev => ({
      ...prev,
      producto: parseInt(atob(productId)).toString(),
      producto_detalle: '',
      fecha_expiracion: ''
    }));
  };

  const handleProductDetailSelect = (detailId: string) => {
    const detail = productDetails.find(d => d.id === detailId);
    if (detail) {
      setSelectedProductDetail(detailId);
      setFormData(prev => ({
        ...prev,
        producto_detalle: parseInt(atob(detailId)).toString(),
        precio_compra_presentacion: detail.precio_venta_presentacion,
        precio_compra_unidades: detail.precio_venta_unidades,
        unidades_por_presentacion: detail.unidades_por_presentacion,
        cantidad_por_presentacion: detail.cantidad_por_presentacion,
        fecha_expiracion: detail.fecha_expiracion
      }));
    }
  };

  const getProductName = (productId: number) => {
    const product = products.find(p => parseInt(atob(p.id)) === productId);
    return product?.description || '';
  };

  const getUnitAbr = (unitId: number) => {
    const unit = units.find(u => parseInt(atob(u.id)) === unitId);
    return unit?.abbreviation || '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.producto_detalle || !formData.config_almacen) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    if (sourceStorage === destinationStorage) {
      alert('El almacén de destino no puede ser igual al de origen');
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

  if (isLoading && !storage.length) {
    return <div className="text-center">Cargando...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="source_storage" className="block text-sm font-medium text-gray-700 mb-1">
          Almacén de Origen
          <span className="text-red-500"> *</span>
        </label>
        <select
          id="source_storage"
          value={sourceStorage}
          onChange={handleSourceStorageChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Seleccione almacén</option>
          {storage.map(item => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div className="product-search-container relative">
        <label htmlFor="producto" className="block text-sm font-medium text-gray-700 mb-1">
          Producto
          <span className="text-red-500"> *</span>
        </label>
        <div
          onClick={() => sourceStorage && setShowProductSearch(true)}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
            !sourceStorage ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer hover:border-blue-500'
          }`}
        >
          {selectedProduct 
            ? getProductName(parseInt(atob(selectedProduct)))
            : 'Seleccione producto'}
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
                  onClick={() => handleProductSelect(product.id)}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {product.description}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedProduct && (
        <div>
          <label htmlFor="producto_detalle" className="block text-sm font-medium text-gray-700 mb-1">
            Detalle de Producto
            <span className="text-red-500"> *</span>
          </label>
          <select
            id="producto_detalle"
            value={selectedProductDetail}
            onChange={(e) => handleProductDetailSelect(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Seleccione detalle de producto</option>
            {productDetails.map(detail => (
              <option key={detail.id} value={detail.id}>
                {`${getProductName(detail.producto)} - ${detail.peso} ${getUnitAbr(detail.config_unidad_medida)}`}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="destination_storage" className="block text-sm font-medium text-gray-700 mb-1">
          Almacén de Destino
          <span className="text-red-500"> *</span>
        </label>
        <select
          id="destination_storage"
          value={destinationStorage}
          onChange={handleDestinationStorageChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Seleccione almacén</option>
          {storage.map(item => (
            <option 
              key={item.id} 
              value={item.id}
              disabled={item.id === sourceStorage}
            >
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="cantidad_por_presentacion" className="block text-sm font-medium text-gray-700 mb-1">
            Cantidad por Presentación
            <span className="text-red-500"> *</span>
          </label>
          <input
            type="number"
            id="cantidad_por_presentacion"
            name="cantidad_por_presentacion"
            value={formData.cantidad_por_presentacion}
            onChange={(e) => setFormData(prev => ({ ...prev, cantidad_por_presentacion: e.target.value }))}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="unidades_por_presentacion" className="block text-sm font-medium text-gray-700 mb-1">
            Unidades por Presentación
            <span className="text-red-500"> *</span>
          </label>
          <input
            type="number"
            id="unidades_por_presentacion"
            value={formData.unidades_por_presentacion}
            onChange={(e) => setFormData(prev => ({ ...prev, unidades_por_presentacion: e.target.value }))}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="precio_compra_presentacion" className="block text-sm font-medium text-gray-700 mb-1">
            Precio Compra Presentación
            <span className="text-red-500"> *</span>
          </label>
          <input
            type="number"
            id="precio_compra_presentacion"
            value={formData.precio_compra_presentacion}
            onChange={(e) => setFormData(prev => ({ ...prev, precio_compra_presentacion: e.target.value }))}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          
          />
        </div>

        <div>
          <label htmlFor="precio_compra_unidades" className="block text-sm font-medium text-gray-700 mb-1">
            Precio Compra Unidades
            <span className="text-red-500"> *</span>
          </label>
          <input
            type="number"
            id="precio_compra_unidades"
            value={formData.precio_compra_unidades}
            onChange={(e) => setFormData(prev => ({ ...prev, precio_compra_unidades: e.target.value }))}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="fecha_expiracion" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de Expiración
            <span className="text-red-500"> *</span>
          </label>
          <select
            id="fecha_expiracion"
            name="fecha_expiracion"
            value={formData.fecha_expiracion}
            onChange={(e) => setFormData(prev => ({ ...prev, fecha_expiracion: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Seleccione fecha</option>
            {availableExpirationDates.map(date => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="fecha_ingreso" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de Movimiento
            <span className="text-red-500"> *</span>
          </label>
          <input
            type="date"
            id="fecha_ingreso"
            value={formData.fecha_ingreso}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            
          />
        </div>
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
          Crear Movimiento
        </button>
      </div>
    </form>
  );
}