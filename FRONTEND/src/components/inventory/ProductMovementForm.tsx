import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import Swal from 'sweetalert2';
import { CreateProductMovementData, ProductDetail } from '../../types/inventory';
import { inventoryService } from '../../services/inventory';
import { createConfigService } from '../../services/config';

const storageService = createConfigService('almacen');

interface ProductMovementFormProps {
  onSubmit: (data: CreateProductMovementData) => Promise<void>;
  onCancel: () => void;
}

export function ProductMovementForm({ onSubmit, onCancel }: ProductMovementFormProps) {

  const [formData, setFormData] = useState<CreateProductMovementData>({
    producto_detalle_origen: '',
    producto_detalle_destino: '',
    cantidad_por_presentacion: 0,
    unidades_por_presentacion: 0,
    precio_compra_presentacion: 0,
    precio_compra_unidades: 0,
    fecha: format(toZonedTime(new Date(), 'America/Managua'), 'yyyy-MM-dd'),
    fecha_expiracion: ''
  });

  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [storage, setStorage] = useState<{ id: string; name: string }[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [expirationDates, setExpirationDates] = useState<string[]>([]);
  const [sourceStorage, setSourceStorage] = useState<string>('');
  const [productDetails, setProductDetails] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [productsData, storageData] = await Promise.all([
          inventoryService.getList(1, 100),
          storageService.getList(1, 100)
        ]);
        
        setProducts(productsData.items);
        setStorage(storageData.items);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const handleProductChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const productId = e.target.value;
    setSelectedProduct(productId);
    
    if (productId) {
      try {
        // Obtener detalles del producto seleccionado
        const details = products.find(p => p.id === productId);
        if (details) {
          setSourceStorage(details.almacen?.toString() || '');
          setProductDetails(details);
          
          // Filtrar fechas de expiración únicas para este producto
          const dates = products
            .filter(p => p.id === productId)
            .map(p => p.fecha_expiracion)
            .filter((date): date is string => date !== null);
          
          setExpirationDates(dates);

          // Actualizar los precios en el formData
          setFormData(prev => ({
            ...prev,
            precio_compra_presentacion: details.precio_venta_presentacion,
            precio_compra_unidades: details.precio_venta_unidades
          }));
        }
      } catch (error) {
        console.error('Error loading product details:', error);
      }
    } else {
      setExpirationDates([]);
      setSourceStorage('');
      setProductDetails(null);
      setFormData(prev => ({
        ...prev,
        precio_compra_presentacion: 0,
        precio_compra_unidades: 0
      }));
    }
  };

  const handleExpirationDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const date = e.target.value;
    // Convert the encrypted ID to a regular ID
    const decodedId = selectedProduct ? parseInt(atob(selectedProduct)).toString() : '';
    setFormData(prev => ({
      ...prev,
      fecha_expiracion: date,
      producto_detalle_origen: decodedId
    }));
  };

  const handleStorageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const destinationStorage = e.target.value;
    const decodedDestination = destinationStorage ? parseInt(atob(destinationStorage)) : null;
    const sourceStorageNum = sourceStorage ? parseInt(sourceStorage) : null;
    
    if (decodedDestination === sourceStorageNum) {
      Swal.fire({
        title: 'Error',
        text: 'El almacén de destino no puede ser igual al de origen',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      producto_detalle_destino: decodedDestination ? decodedDestination.toString() : ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const decodedDestination = parseInt(formData.producto_detalle_destino);
    const sourceStorageNum = sourceStorage ? parseInt(sourceStorage) : null;

    if (decodedDestination === sourceStorageNum) {
      await Swal.fire({
        title: 'Error',
        text: 'El almacén de destino no puede ser igual al de origen',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
      return;
    }

    await onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('precio') ? parseFloat(value) : 
              name.includes('cantidad') || name.includes('unidades') ? parseInt(value) : 
              value
    }));
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
            value={formData.fecha_expiracion}
            onChange={handleExpirationDateChange}
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

      {sourceStorage && (
        <div>
          <label htmlFor="almacen_origen" className="block text-sm font-medium text-gray-700 mb-1">
            Almacén de Origen
          </label>
          <input
            type="text"
            id="almacen_origen"
            value={storage.find(s => parseInt(atob(s.id)) === parseInt(sourceStorage))?.name || ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
            readOnly
          />
        </div>
      )}

      <div>
        <label htmlFor="almacen_destino" className="block text-sm font-medium text-gray-700 mb-1">
          Almacén de Destino
        </label>
        <select
          id="almacen_destino"
          value={storage.find(s => parseInt(atob(s.id)).toString() === formData.producto_detalle_destino)?.id || ''}
          onChange={handleStorageChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Seleccione almacén de destino</option>
          {storage.map(item => (
            <option 
              key={item.id} 
              value={item.id}
              disabled={parseInt(atob(item.id)) === parseInt(sourceStorage)}
            >
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

      {productDetails && (
        <>
          <div>
            <label htmlFor="precio_compra_presentacion" className="block text-sm font-medium text-gray-700 mb-1">
              Precio Compra Presentación
            </label>
            <input
              type="number"
              id="precio_compra_presentacion"
              name="precio_compra_presentacion"
              value={formData.precio_compra_presentacion}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              readOnly
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              readOnly
            />
          </div>
        </>
      )}

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