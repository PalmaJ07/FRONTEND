import { useState, useEffect } from 'react';
import { Store, Search, X, ArrowLeft } from 'lucide-react';
import { ProductDetail } from '../../types/sales';
import { searchProducts } from '../../services/sales';
import { createConfigService } from '../../services/config';
import { useProfile } from '../../hooks/useProfile';
import { Pagination } from '../../components/common/Pagination';

const storageService = createConfigService('almacen');

interface WarehouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  warehouses: { id: string; name: string }[];
  onWarehouseSelect: (warehouseId: string) => void;
}

interface ProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  warehouseName: string;
  products: ProductDetail[];
  onBack: () => void;
}

function WarehouseModal({ isOpen, onClose, warehouses, onWarehouseSelect }: WarehouseModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Consultar Almacenes</h2>
          <div className="grid grid-cols-2 gap-4">
            {warehouses.map(warehouse => (
              <div
                key={warehouse.id}
                onClick={() => onWarehouseSelect(warehouse.id)}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Store className="h-6 w-6 text-blue-600" />
                  <span className="font-medium">{warehouse.name}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductsModal({ isOpen, onClose, warehouseName, products: initialProducts, onBack }: ProductsModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filteredProducts, setFilteredProducts] = useState(initialProducts);

  useEffect(() => {
    const filtered = initialProducts.filter(
      product => 
        product.n_producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.fecha_expiracion?.includes(searchTerm)
    );
    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [searchTerm, initialProducts]);

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <Store className="h-6 w-6 mr-2 text-blue-600" />
              {warehouseName}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre o fecha de expiración..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Expiración
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedProducts.map((product) => (
                  <tr key={product.encrypted_id}>
                    <td className="px-6 py-4 whitespace-nowrap">{product.n_producto}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{product.total_unidades}</td>
                    <td className="px-6 py-4 whitespace-nowrap">C${product.precio_venta_unidades}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{product.fecha_expiracion || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredProducts.length / pageSize)}
              pageSize={pageSize}
              totalItems={filteredProducts.length}
              pageSizeOptions={[5, 10, 25, 50]}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </div>

          <div className="mt-6 flex justify-between px-4">
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Atrás
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SalesPage() {
  const { profile } = useProfile();
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<{ id: string; name: string } | null>(null);
  const [products, setProducts] = useState<ProductDetail[]>([]);

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

  const handleWarehouseSelect = async (warehouseId: string) => {
    const warehouse = warehouses.find(w => w.id === warehouseId);
    if (warehouse) {
      setSelectedWarehouse(warehouse);
      try {
        const results = await searchProducts('', parseInt(atob(warehouseId)));
        setProducts(results);
        setShowWarehouseModal(false);
        setShowProductsModal(true);
      } catch (error) {
        console.error('Error loading products:', error);
      }
    }
  };

  const handleBackToWarehouses = () => {
    setShowProductsModal(false);
    setShowWarehouseModal(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Store className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold">
            Almacén: {profile?.almacen_asignado ? warehouses.find(w => parseInt(atob(w.id)) === profile.almacen_asignado)?.name : ' Cargando ...'}
          </h2>
        </div>
        <button
          onClick={() => setShowWarehouseModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Store className="h-5 w-5 mr-2" />
          Consultar Almacenes
        </button>
      </div>

      <WarehouseModal
        isOpen={showWarehouseModal}
        onClose={() => setShowWarehouseModal(false)}
        warehouses={warehouses}
        onWarehouseSelect={handleWarehouseSelect}
      />

      {selectedWarehouse && (
        <ProductsModal
          isOpen={showProductsModal}
          onClose={() => setShowProductsModal(false)}
          warehouseName={selectedWarehouse.name}
          products={products}
          onBack={handleBackToWarehouses}
        />
      )}
    </div>
  );
}