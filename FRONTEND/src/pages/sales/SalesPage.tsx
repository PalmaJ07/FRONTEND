import { useState, useEffect } from 'react';
import { Search, ShoppingCart, Trash2, Users, Percent, DollarSign } from 'lucide-react';
import { ProductDetail } from '../../types/sales';
import { searchProducts } from '../../services/sales';
import { getClientList } from '../../services/clients';
import { Client } from '../../types/clients';
import { useDebounce } from '../../hooks/useDebounce';

type DiscountType = 'percentage' | 'amount' | 'none';

interface ProductWithDiscount extends ProductDetail {
  discountType: DiscountType;
  discountValue: number;
}

export function SalesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<ProductDetail[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProductWithDiscount[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [globalDiscountType, setGlobalDiscountType] = useState<DiscountType>('none');
  const [globalDiscountValue, setGlobalDiscountValue] = useState(0);

  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const response = await getClientList();
        setClients(response.clients);
      } catch (error) {
        console.error('Error loading clients:', error);
      }
    };
    loadClients();
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearch) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await searchProducts(debouncedSearch);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedSearch]);

  const handleProductSelect = (product: ProductDetail) => {
    if (!selectedProducts.some(p => p.encrypted_id === product.encrypted_id)) {
      setSelectedProducts(prev => [...prev, {
        ...product,
        discountType: 'none',
        discountValue: 0
      }]);
      setQuantities(prev => ({
        ...prev,
        [product.encrypted_id]: 1
      }));
    }
    setSearchTerm('');
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
    const basePrice = parseFloat(product.precio_venta_unidades) * quantity;
    
    if (product.discountType === 'none') return basePrice;
    
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
    
    return Math.max(subtotal - globalDiscountValue, 0);
  };

  return (
    <div className="p-6">
      {/* Sección de búsqueda y resultados */}
      <div className="mb-8">
        <div className="relative mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          />
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          
          {/* Resultados de búsqueda en un dropdown */}
          {searchTerm && !isLoading && searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg max-h-96 overflow-y-auto">
              {searchResults.map((product) => (
                <div
                  key={product.encrypted_id}
                  onClick={() => handleProductSelect(product)}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{product.n_producto}</p>
                      <p className="text-sm text-gray-600">
                        Stock: {product.total_unidades} unidades
                      </p>
                    </div>
                    <p className="text-blue-600 font-medium">
                      ${product.precio_venta_unidades}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sección de productos seleccionados */}
        <div className="col-span-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Productos Seleccionados</h2>
            
            {selectedProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-2" />
                <p>No hay productos seleccionados</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedProducts.map((product) => (
                  <div key={product.encrypted_id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{product.n_producto}</h3>
                        <p className="text-gray-600">
                          Precio unitario: ${product.precio_venta_unidades}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveProduct(product.encrypted_id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cantidad
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={quantities[product.encrypted_id] || 1}
                          onChange={(e) => handleQuantityChange(product.encrypted_id, parseInt(e.target.value))}
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Descuento
                        </label>
                        <div className="flex space-x-2">
                          <select
                            value={product.discountType}
                            onChange={(e) => handleProductDiscountChange(
                              product.encrypted_id, 
                              e.target.value as DiscountType,
                              product.discountValue
                            )}
                            className="w-1/2 p-2 border border-gray-300 rounded"
                          >
                            <option value="none">Sin descuento</option>
                            <option value="percentage">Porcentaje</option>
                            <option value="amount">Monto</option>
                          </select>
                          {product.discountType !== 'none' && (
                            <input
                              type="number"
                              min="0"
                              value={product.discountValue}
                              onChange={(e) => handleProductDiscountChange(
                                product.encrypted_id,
                                product.discountType,
                                parseFloat(e.target.value)
                              )}
                              className="w-1/2 p-2 border border-gray-300 rounded"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right mt-2">
                      <span className="text-lg font-medium">
                        Subtotal: ${calculateProductTotal(product, quantities[product.encrypted_id] || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sección de resumen y total */}
        <div className="col-span-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Resumen de Venta</h2>
              <button
                onClick={() => setShowClientSearch(true)}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <Users className="h-5 w-5 mr-1" />
                {selectedClient ? 'Cambiar Cliente' : 'Seleccionar Cliente'}
              </button>
            </div>

            {showClientSearch && (
              <div className="mb-6">
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Seleccionar cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex justify-between text-lg">
                <span>Subtotal:</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
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
                            <DollarSign className="h-5 w-5 text-gray-400" />
                          }
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <button
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium mt-6"
                disabled={selectedProducts.length === 0 || !selectedClient}
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