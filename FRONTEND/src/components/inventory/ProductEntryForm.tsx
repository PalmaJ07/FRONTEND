import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { CreateProductDetailEntryData, ProductDetail } from '../../types/inventory';
import { Product } from '../../types/products';
import { productService } from '../../services/products';
import { inventoryService } from '../../services/inventory';
import { createConfigService } from '../../services/config';

const storageService = createConfigService('almacen');
const unitsService = createConfigService('unidad-medida');

interface ProductEntryFormProps {
  onSubmit: (data: CreateProductDetailEntryData) => Promise<void>;
  onCancel: () => void;
  initialData?: ProductDetail;
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
    producto_detalle: initialData?.id || '',
    config_almacen: initialData?.almacen || -1,
    cantidad_por_presentacion: initialData?.cantidad_por_presentacion || 0,
    unidades_por_presentacion: initialData?.unidades_por_presentacion || 0,
    precio_compra_presentacion: 0,
    precio_compra_unidades: 0,
    fecha_expiracion: '',
    fecha_ingreso: getCurrentDate(),
  });

  const [storage, setStorage] = useState<{ id: string; name: string }[]>([]);
  const [units, setUnits] = useState<{ id: string; name: string; abbreviation: string }[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productDetails, setProductDetails] = useState<ProductDetail[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showProductSearch, setShowProductSearch] = useState(false);

  // Cargar almacenes al inicio
  useEffect(() => {
    const loadStorage = async () => {
      try {
        const [storageResponse, unitsResponse] = await Promise.all([
          storageService.getList(1, 100),
          unitsService.getList(1, 100)
        ]);
        setStorage(storageResponse.items);
        setUnits(unitsResponse.items);
      } catch (error) {
        console.error('Error loading storage:', error);
      }
    };
    loadStorage();
  }, []);

  // Cargar productos cuando se selecciona un almacén
  useEffect(() => {
    const loadProducts = async () => {
      if (formData.config_almacen === -1) {
        setProducts([]);
        setProductDetails([]);
        return;
      }

      try {
        setIsLoading(true);
        // Obtener solo los productos del almacén seleccionado
        const response = await inventoryService.getList(1, 100, undefined, formData.config_almacen);
        
        // Crear un conjunto de IDs de productos únicos
        const uniqueProductIds = new Set(response.items.map(detail => detail.producto));
        
        // Obtener todos los productos
        const productsResponse = await productService.getList(1, 100);
        
        // Filtrar los productos que existen en el almacén seleccionado
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
  }, [formData.config_almacen]);

  // Filtrar productos basado en el término de búsqueda
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
      if (formData.config_almacen === -1 || formData.producto === -1) {
        setProductDetails([]);
        return;
      }

      try {
        setIsLoading(true);
        const response = await inventoryService.getList(
          1, 
          100, 
          undefined, 
          formData.config_almacen,
          formData.producto
        );
        setProductDetails(response.items);
      } catch (error) {
        console.error('Error loading product details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProductDetails();
  }, [formData.config_almacen, formData.producto]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'config_almacen') {
      const numValue = parseInt(value);
      setFormData(prev => ({
        ...prev,
        [name]: numValue,
        producto: -1,
        producto_detalle: ''
      }));
      setSearchTerm('');
    } else if (name === 'producto') {
      const numValue = parseInt(value);
      setFormData(prev => ({
        ...prev,
        [name]: numValue,
        producto_detalle: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: ['cantidad_por_presentacion', 'unidades_por_presentacion', 'precio_compra_presentacion', 'precio_compra_unidades'].includes(name)
          ? parseFloat(value) || 0
          : value
      }));
    }
  };

  const handleProductSelect = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      producto: parseInt(atob(productId))
    }));
    setShowProductSearch(false);
    setSearchTerm('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.config_almacen === -1) {
      alert('Por favor seleccione un almacén');
      return;
    }

    if (formData.producto === -1) {
      alert('Por favor seleccione un producto');
      return;
    }

    if (!formData.producto_detalle) {
      alert('Por favor seleccione un detalle de producto');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error en el proceso de ingreso:', error);
      throw error;
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



  if (isLoading && !storage.length) {
    return <div className="text-center">Cargando...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="config_almacen" className="block text-sm font-medium text-gray-700 mb-1">
          Almacén
          <span className="text-red-500"> *</span>
        </label>
        <select
          id="config_almacen"
          name="config_almacen"
          value={formData.config_almacen}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="-1">Seleccione almacén</option>
          {storage.map(item => (
            <option key={item.id} value={parseInt(atob(item.id))}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="producto" className="block text-sm font-medium text-gray-700 mb-1">
          Producto
          <span className="text-red-500"> *</span>
        </label>
        <div className="relative">
          <div
            onClick={() => formData.config_almacen !== -1 && setShowProductSearch(true)}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
              formData.config_almacen === -1 ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            {formData.producto !== -1 
              ? getProductName(formData.producto)
              : 'Seleccione producto'}
          </div>

          {showProductSearch && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg">
              <div className="p-2 border-b">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar producto..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  autoFocus
                />
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
      </div>

      {formData.producto !== -1 && (
        <div>
          <label htmlFor="producto_detalle" className="block text-sm font-medium text-gray-700 mb-1">
            Detalle de Producto
            <span className="text-red-500"> *</span>
          </label>
          <select
            id="producto_detalle"
            name="producto_detalle"
            value={formData.producto_detalle}
            onChange={handleChange}
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="cantidad_por_presentacion" className="block text-sm font-medium text-gray-700 mb-1">
            Cantidad por Presentación<span className="text-red-500"> *</span>
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
            <span className="text-red-500"> *</span>
          </label>
          <input
            type="number"
            id="unidades_por_presentacion"
            name="unidades_por_presentacion"
            value={formData.unidades_por_presentacion}
            onChange={handleChange}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
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
            name="precio_compra_presentacion"
            value={formData.precio_compra_presentacion}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
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
            name="precio_compra_unidades"
            value={formData.precio_compra_unidades}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="fecha_expiracion" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de Expiración
            <span className="text-red-500"> *</span>
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
            <span className="text-red-500"> *</span>
          </label>
          <input
            type="date"
            id="fecha_ingreso"
            name="fecha_ingreso"
            value={formData.fecha_ingreso}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
            readOnly
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
          {isEditing ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
}