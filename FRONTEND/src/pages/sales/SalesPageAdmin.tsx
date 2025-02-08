import React, { useState, useEffect} from 'react';
//import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Trash2, Percent, Coins, Store, UserPlus } from 'lucide-react';
import { ProductDetail } from '../../types/sales';
import { searchProducts } from '../../services/sales';
import { getClientList } from '../../services/clients';
import { Client } from '../../types/clients';
import { useDebounce } from '../../hooks/useDebounce';
import { useProfile } from '../../hooks/useProfile';
import { createConfigService } from '../../services/config';
import { salesService } from '../../services/sales';
import { format } from 'date-fns';
import Swal from 'sweetalert2';

const storageService = createConfigService('almacen');

type DiscountType = 'percentage' | 'amount' | 'none';

interface ProductWithDiscount extends ProductDetail {
  discountType: DiscountType;
  discountValue: number;
  unitType: 'presentation' | 'units'; // Agregamos el tipo de unidad
}

export function SalesPageAdmin() {
  //const navigate = useNavigate();
  const { profile, isLoading: isProfileLoading } = useProfile();
  
  // Estados para la búsqueda y selección de productos
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<ProductDetail[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProductWithDiscount[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [showSearchResults, setShowSearchResults] = useState(false);
  // Estados para el manejo de almacenes
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<{ id: number; name: string } | null>(null);

  // Estados para el manejo de clientes
  const [clientName, setClientName] = useState('');
  const [isExistingClient, setIsExistingClient] = useState(false);
  const [showClientResults, setShowClientResults] = useState(false);
  const [clientSearchResults, setClientSearchResults] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  // Agregar estado para el índice seleccionado con teclado
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);

  

  // Estados para descuentos
  const [globalDiscountType, setGlobalDiscountType] = useState<DiscountType>('none');
  const [globalDiscountValue, setGlobalDiscountValue] = useState(0);

  const debouncedSearch = useDebounce(searchTerm, 500);
  const debouncedClientSearch = useDebounce(clientName, 500);
  
  const searchContainerRef = React.useRef<HTMLDivElement>(null);
  const clientSearchContainerRef = React.useRef<HTMLDivElement>(null);

  // Agregar estos estados para el formulario
    const [comment, setComment] = useState('');
    const [saleDate, setSaleDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Efecto para manejar clics fuera de los contenedores
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Verificar si el clic fue fuera del contenedor de búsqueda de productos
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }

      // Verificar si el clic fue fuera del contenedor de búsqueda de clientes
      if (clientSearchContainerRef.current && !clientSearchContainerRef.current.contains(event.target as Node)) {
        setShowClientResults(false);
      }
    };

    // Agregar el event listener
    document.addEventListener('mousedown', handleClickOutside);

    // Limpiar el event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cargar almacenes y establecer almacén inicial
  useEffect(() => {
    const loadWarehouses = async () => {
      try {
        const response = await storageService.getList(1, 100);
        setWarehouses(response.items);

        if (!isProfileLoading && profile?.almacen_asignado && response.items.length > 0) {
          const assignedWarehouse = response.items.find(
            w => parseInt(atob(w.id)) === profile.almacen_asignado
          );
          if (assignedWarehouse) {
            setSelectedWarehouse({
              id: parseInt(atob(assignedWarehouse.id)),
              name: assignedWarehouse.name
            });
          }
        }
      } catch (error) {
        console.error('Error loading warehouses:', error);
      }
    };
    loadWarehouses();
  }, [profile, isProfileLoading]);

  // Cargar y filtrar clientes cuando se activa el checkbox
  useEffect(() => {
    const loadClients = async () => {
      if (!isExistingClient) {
        setClientSearchResults([]);
        return;
      }

      try {
        const response = await getClientList(1, 100);
        setClientSearchResults(response.clients);
      } catch (error) {
        console.error('Error loading clients:', error);
        setClientSearchResults([]);
      }
    };

    loadClients();
  }, [isExistingClient]);

  // Filtrar clientes basado en la búsqueda
  // Modificar el efecto de búsqueda de clientes
  useEffect(() => {
    const searchClients = async () => {
      if (!isExistingClient) return;

      try {
        setIsSearching(true);
        const response = await getClientList(1, 100, debouncedClientSearch);
        setClientSearchResults(response.clients);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Error searching clients:', error);
        setClientSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    searchClients();
  }, [debouncedClientSearch, isExistingClient]);


  // Agregar efecto para el click fuera
  useEffect(() => {
    const loadProducts = async () => {
      if (!selectedWarehouse) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchProducts(debouncedSearch, selectedWarehouse.id);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching products:', error);
      } finally {
        setIsSearching(false);
      }
    };

    loadProducts();
  }, [debouncedSearch, selectedWarehouse]);

  // Agregar manejador de teclas
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showClientResults || clientSearchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < clientSearchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleClientSelect(clientSearchResults[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowClientResults(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Búsqueda de productos
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearch || !selectedWarehouse) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchProducts(debouncedSearch, selectedWarehouse.id);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching products:', error);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearch, selectedWarehouse]);

  const handleClientInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setClientName(value);
    if (isExistingClient) {
      setShowClientResults(true);
      setSelectedClient(null);
    }
  };

  // Modificar el manejador del checkbox de cliente existente
  const handleExistingClientToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsExistingClient(checked);
    if (!checked) {
      setClientName('');
      setShowClientResults(false);
      setSelectedClient(null);
    } else {
      setShowClientResults(true);
    }
  };

  const handleWarehouseChange = async (warehouseId: string) => {
    if (selectedProducts.length > 0) {
      const result = await Swal.fire({
        title: '¿Cambiar de bodega?',
        text: 'Se perderá el registro de los productos seleccionados',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, cambiar',
        cancelButtonText: 'Cancelar'
      });

      if (!result.isConfirmed) {
        return;
      }
    }

    const newWarehouse = warehouses.find(w => w.id === warehouseId);
    if (newWarehouse) {
      setSelectedWarehouse({
        id: parseInt(atob(warehouseId)),
        name: newWarehouse.name
      });
      setSelectedProducts([]);
      setQuantities({});
      setShowSearchResults(false);
      setSearchTerm('');
      setSearchResults([]);

      // Cargar productos de la nueva bodega
      try {
        const results = await searchProducts('', parseInt(atob(warehouseId)));
        setSearchResults(results);
      } catch (error) {
        console.error('Error loading products:', error);
      }
    }
  };

  const handleProductSelect = (product: ProductDetail) => {
    if (!selectedProducts.some(p => p.encrypted_id === product.encrypted_id)) {
      setSelectedProducts(prev => [...prev, {
        ...product,
        discountType: 'none',
        discountValue: 0,
        unitType: 'units' // Por defecto en presentación
      }]);
      setQuantities(prev => ({
        ...prev,
        [product.encrypted_id]: 1
      }));
    }
    setSearchTerm('');
    setShowSearchResults(false);
  };

  const handleUnitTypeChange = (productId: string, unitType: 'presentation' | 'units') => {
    setSelectedProducts(prev => prev.map(product => {
      if (product.encrypted_id === productId) {
        return {
          ...product,
          unitType
        };
      }
      return product;
    }));
  };

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setClientName(client.name);
    setShowClientResults(false);
    setSelectedIndex(-1);
  };

  const handleAddNewClient = () => {
    window.open('/index/users/clients', '_blank');
  };
  

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.encrypted_id !== productId));
    setQuantities(prev => {
      const newQuantities = { ...prev };
      delete newQuantities[productId];
      return newQuantities;
    });
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity > 0) {
      setQuantities(prev => ({
        ...prev,
        [productId]: quantity
      }));
    }
  };
  
  const handleProductDiscountChange = (
    productId: string,
    discountType: DiscountType,
    discountValue: number = 0
  ) => {
    setSelectedProducts(prev => prev.map(product => {
      if (product.encrypted_id === productId) {
        return {
          ...product,
          discountType,
          discountValue: discountValue
        };
      }
      return product;
    }));
  };

  const calculateProductTotal = (product: ProductWithDiscount, quantity: number): number => {
    // Obtener el precio base según el tipo de unidad
    const basePrice = product.unitType === 'presentation' 
      ? parseFloat(product.precio_venta_presentacion) * quantity
      : parseFloat(product.precio_venta_unidades) * quantity;
    
    if (product.discountType === 'none' || !basePrice) return basePrice || 0;
    
    if (product.discountType === 'percentage') {
      return basePrice * (1 - (product.discountValue / 100));
    }
    
    return Math.max(basePrice - product.discountValue, 0);
  };

  const calculateSubtotal = (): number => {
    return selectedProducts.reduce((total, product) => {
      return total + calculateProductTotal(product, quantities[product.encrypted_id] || 0);
    }, 0);
  };

  const calculateTotal = (): number => {
    const subtotal = calculateSubtotal();
    
    if (globalDiscountType === 'none') return subtotal;
    
    if (globalDiscountType === 'percentage') {
      return subtotal * (1 - (globalDiscountValue / 100));
    }
    
    const total = Math.max(subtotal - globalDiscountValue, 0);
    return isNaN(total) ? 0 : total;
  };

  const handleProcessSale = async () => {
    if (selectedProducts.length === 0) {
      Swal.fire({
        title: 'Error',
        text: 'Debe seleccionar al menos un producto',
        icon: 'error'
      });
      return;
    }
    if (!clientName.trim()) {
      Swal.fire({
        title: 'Error',
        text: 'Debe ingresar el nombre del cliente',
        icon: 'error'
      });
      return;
    }

    try {
      // 1. Preparar datos de la venta principal
      const saleData = {
        cliente: selectedClient?.id ? parseInt(atob(selectedClient.id)) : null,
        cliente_nombre: selectedClient ? null : clientName,
        total_sin_descuento: calculateSubtotal(),
        descuento: globalDiscountValue,
        descuento_porcentual: globalDiscountType === 'percentage',
        total_venta: calculateTotal(),
        fecha_venta: saleDate,
        comentario: comment || null
      };
  
      // 2. Crear la venta principal
      const response = await salesService.createSale(saleData);
      const ventaId = response.id;
  
      // 3. Crear los detalles de la venta
      const detailPromises = selectedProducts.map(async (product) => {
        const detailData = {
          producto_detalle: parseInt(atob(product.encrypted_id)),
          venta: ventaId,
          descuento: product.discountValue,
          cantidad: quantities[product.encrypted_id] || 1,
          unidades: product.unitType === 'units',
          descuento_porcentual: product.discountType === 'percentage',
          precio_venta: product.unitType === 'presentation' 
            ? parseFloat(product.precio_venta_presentacion)
            : parseFloat(product.precio_venta_unidades)
        };
  
        return salesService.createSaleDetail(detailData);
      });
  
      await Promise.all(detailPromises);
  
      // 4. Mostrar mensaje de éxito
      await Swal.fire({
        title: 'Éxito',
        text: 'Venta procesada correctamente',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
  
      // 5. Limpiar el formulario
      setSelectedProducts([]);
      setQuantities({});
      setClientName('');
      setSelectedClient(null);
      setGlobalDiscountType('none');
      setGlobalDiscountValue(0);
      setComment('');
      setSaleDate(format(new Date(), 'yyyy-MM-dd'));
  
    } catch (error) {
      console.error('Error processing sale:', error);
      await Swal.fire({
        title: 'Error',
        text: 'No se pudo procesar la venta',
        icon: 'error'
      });
    }



  }
  
  return (
    <div className="p-6">
      <div className="max-w-[calc(100%-384px)] mb-6">
        {/* Selector de almacén */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center space-x-2">
            <Store className="h-5 w-5 text-gray-500" />
            <span className="font-medium text-gray-700">
              Almacén: {selectedWarehouse?.name}
            </span>
          </div>
          <select
            value=""
            onChange={(e) => handleWarehouseChange(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">Cambiar Almacén</option>
            {warehouses.map(warehouse => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </option>
            ))}
          </select>
        </div>

        {/* Barra de búsqueda */}
        <div ref={searchContainerRef} className="search-container relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => {
              if (selectedWarehouse) {
                setShowSearchResults(true);
              }
            }}
            placeholder="Buscar productos..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!selectedWarehouse}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          
          {/* Resultados de búsqueda */}
          {showSearchResults && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg max-h-96 overflow-y-auto">
              {isSearching ? (
                <div className="px-4 py-2 text-gray-500">Buscando...</div>
              ) : searchResults.length > 0 ? (
                searchResults.map((product) => (
                  <div
                    key={product.encrypted_id}
                    onClick={() => handleProductSelect(product)}
                    className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  >
                    <div className="grid grid-cols-5 gap-2 text-sm">
                              <div className="font-medium">{product.n_producto}</div>
                              <div>Unidades: {product.total_unidades}</div>
                              <div>Presentación: {product.cantidad_por_presentacion}</div>
                              <div>Vence: {product.fecha_expiracion || 'N/A'}</div>
                              <div>Precio: C${product.precio_venta_unidades}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-gray-500">
                  No se encontraron productos
                </div>
              )}
            </div>
          )}
        </div>
      </div>
{/* --------------------------------------- */}
      <div className="grid grid-cols-12 gap-6 mt-6">
        {/* Sección de productos seleccionados */}
        <div className="col-span-8">
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Productos Seleccionados</h2>
            </div>
            
            <div className="p-4">
              {selectedProducts.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <ShoppingCart className="h-10 w-10 mx-auto mb-2" />
                  <p>No hay productos seleccionados</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedProducts.map((product) => (
                    <div key={product.encrypted_id} className="bg-gray-50 p-2 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <h3 className="font-medium text-sm">{product.n_producto}</h3>
                          <p className="text-xs text-gray-600">
                          Precio unitario: C${product.precio_venta_unidades}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveProduct(product.encrypted_id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {/* Cantidad */}
                        <div className="flex flex-col">
                          <label className="text-xs font-medium text-gray-700 mb-1">
                            Cantidad
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={quantities[product.encrypted_id] || 1}
                            onChange={(e) => handleQuantityChange(product.encrypted_id, parseInt(e.target.value))}
                            className="w-36 p-1.5 text-sm border border-gray-300 rounded"
                          />
                        </div>

                        {/* Descuento (ahora más grande) */}
                        <div className="flex flex-col">
                          <label className="text-xs font-medium text-gray-700 mb-1">
                            Descuento
                          </label>
                          <div className="flex items-center gap-2">
                            <select
                              value={product.discountType}
                              onChange={(e) =>
                                handleProductDiscountChange(
                                  product.encrypted_id,
                                  e.target.value as DiscountType,
                                  product.discountValue
                                )
                              }
                              className="w-36 p-1.5 text-sm border border-gray-300 rounded"
                            >
                              <option value="none" >Sin descuento</option>
                              <option value="percentage" value-type="1">Porcentaje</option>
                              <option value="amount" value-type="0">Monto</option>
                            </select>
                            {product.discountType !== 'none' && (
                              <input
                                type="number"
                                min="0"
                                value={product.discountValue}
                                onChange={(e) =>
                                  handleProductDiscountChange(
                                    product.encrypted_id,
                                    product.discountType,
                                    parseFloat(e.target.value)
                                  )
                                }
                                className="w-28 p-1.5 text-sm border border-gray-300 rounded"
                              />
                            )}
                          </div>
                        </div>

                        {/* Unidades de Venta */}
                        <div className="flex flex-col">
                          <label className="text-xs font-medium text-gray-700 mb-1">
                            Unidades de Venta
                          </label>
                          <select
                            value={product.unitType || "units"} // ✅ Ahora "Por Unidades" es el valor predeterminado
                            onChange={(e) =>
                              handleUnitTypeChange(
                                product.encrypted_id,
                                e.target.value as "units" | "presentation"
                              )
                            }
                            className="w-36 p-1.5 text-sm border border-gray-300 rounded"
                          >
                            <option value="units" value-type="0">Por Unidades</option>
                            <option value="presentation" value-type="1">Por Presentación</option>
                          </select>
                        </div>

                      </div>
                      
                      <div className="text-right mt-2">
                        <span className="text-sm font-medium">
                          Subtotal: C${calculateProductTotal(product, quantities[product.encrypted_id] || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sección de resumen y total */}
        <div className="col-span-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-center mb-6">Resumen de Venta</h2>

            <div className="space-y-4 mb-6">
              <div ref={clientSearchContainerRef} className="client-search-container relative">
                <input
                  type="text"
                  value={clientName}
                  onChange={handleClientInputChange}
                  onFocus={() => {
                    if (isExistingClient) {
                      setShowClientResults(true);
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Nombre del cliente"
                  className={`w-full px-3 py-2 border ${
                    selectedClient ? 'border-green-500' : 'border-gray-300'
                  } rounded-md focus:ring-2 focus:ring-blue-500`}
                />
                
                {showClientResults && isExistingClient && (
                  <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {isSearching ? (
                      <div className="px-4 py-2 text-gray-500">
                        Buscando...
                      </div>
                    ) : clientSearchResults.length > 0 ? (
                      clientSearchResults.map((client, index) => (
                        <div
                          key={client.id}
                          onClick={() => handleClientSelect(client)}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={`px-4 py-2 cursor-pointer ${
                            (index === selectedIndex || client.id === selectedClient?.id)
                              ? 'bg-blue-50 text-blue-700' 
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          {client.name}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500">
                        Cliente no existe
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="existingClient"
                    checked={isExistingClient}
                    onChange={handleExistingClientToggle}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="existingClient" className="text-sm text-gray-600">
                    Ya existe?
                  </label>
                </div>

                {!isExistingClient && (
                  <button
                    onClick={handleAddNewClient}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <UserPlus className="h-5 w-5 mr-1" />
                    <span className="text-sm">Agregar Cliente</span>
                  </button>
                )}
              </div>

              {selectedClient && (
              <div className="mt-2 p-2 bg-green-50 rounded-md">
                <p className="text-sm text-green-700">
                  Cliente seleccionado: {selectedClient.name}
                </p>
              </div>
            )}

            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-lg">
                <span>Subtotal:</span>
                <span>C${calculateSubtotal().toFixed(2)}</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descuento Global
                </label>
                <div className="flex items-center space-x-2">
                  <select
                    value={globalDiscountType}
                    onChange={(e) => setGlobalDiscountType(e.target.value as DiscountType)}
                    className="w-1/2 p-2 border border-gray-300 rounded"
                  >
                    <option value="none">Sin descuento</option>
                    <option value="percentage">Porcentaje</option>
                    <option value="amount">Monto</option>
                  </select>
                  {globalDiscountType !== 'none' && (
                    <div className="w-1/2">
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          value={globalDiscountValue}
                          onChange={(e) => setGlobalDiscountValue(parseFloat(e.target.value))}
                          className="w-full p-2 border border-gray-300 rounded pl-8"
                        />
                        <span className="absolute left-2 top-2">
                          {globalDiscountType === 'percentage' ? 
                            <Percent className="h-5 w-5 text-gray-400" /> : 
                            <Coins className="h-5 w-5 text-gray-400" />
                          }
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* Comentario */}
              <div>
                <label htmlFor="fecha_ingreso" className="block text-sm font-medium text-gray-700 mb-1">
                  Comentario
                </label>
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className={`w-full px-3 py-2 border border-gray-300
                    rounded-md focus:ring-2 focus:ring-blue-500`}
                  placeholder='Comentario'
                />
              </div>
              {/*Fecha Venta*/}
              <div>
                <label htmlFor="fecha_ingreso" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Ingreso
                </label>
                <input
                  type="date"
                  //id="fecha_ingreso"
                  name="fecha_ingreso"
                  value={saleDate}
                  onChange={(e) => setSaleDate(e.target.value)}
                  //onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {/* Total */}
              <div className="pt-4 border-t">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total:</span>
                  <span>C${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
              {/* Procesar Venta */}
              <button
                onClick={handleProcessSale}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium mt-6"
                disabled={selectedProducts.length === 0 || !clientName.trim()}
              >
                Procesar Venta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}