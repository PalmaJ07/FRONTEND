import { useState, useEffect } from 'react';
import { Plus, ArrowLeftRight, RotateCcw, PackagePlus } from 'lucide-react';
import Swal from 'sweetalert2';
import { PageHeader } from '../../components/layout/PageHeader';
import { Table } from '../../components/common/Table';
import { Pagination } from '../../components/common/Pagination';
import { SearchBar } from '../../components/common/SearchBar';
import { ProductDetailModal } from '../../components/inventory/ProductDetailModal';
import { ProductDetail, CreateProductDetailData } from '../../types/inventory';
import { inventoryService } from '../../services/inventory';
import { useDebounce } from '../../hooks/useDebounce';
import { Product } from '../../types/products';
import { productService } from '../../services/products';
import { supplierService } from '../../services/suppliers';
import { createConfigService } from '../../services/config';

const unitsService = createConfigService('unidad-medida');
const presentationsService = createConfigService('presentacion');

export function InventoryPage() {
  const [details, setDetails] = useState<ProductDetail[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [presentations, setPresentations] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 500);

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
        console.error('Error loading reference data:', error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    loadDetails();
  }, [currentPage, pageSize, debouncedSearch]);

  const loadDetails = async () => {
    try {
      setIsLoading(true);
      const data = await inventoryService.getList(currentPage, pageSize, debouncedSearch);
      setDetails(data.items);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
    } catch (error) {
      console.error('Error loading inventory details:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cargar la lista de detalles',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (data: CreateProductDetailData) => {
    try {
      await inventoryService.create(data);
      await loadDetails();
      setShowAddModal(false);
      await Swal.fire({
        title: 'Éxito',
        text: 'Detalle creado exitosamente',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error creating detail:', error);
      await Swal.fire({
        title: 'Error',
        text: 'No se pudo crear el detalle',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    }
  };

  const getProductName = (productId: number) => {
    const product = products.find(p => p.id === productId.toString());
    return product?.description || 'N/A';
  };

  const getUnitName = (unitId: number) => {
    const unit = units.find(u => u.id === unitId.toString());
    return unit?.name || 'N/A';
  };

  const getPresentationName = (presentationId: number) => {
    const presentation = presentations.find(p => p.id === presentationId.toString());
    return presentation?.name || 'N/A';
  };

  const getSupplierName = (supplierId: number) => {
    const supplier = suppliers.find(s => s.id === supplierId.toString());
    return supplier?.supplierName || 'N/A';
  };

  const columns = [
    { 
      header: 'Producto', 
      accessor: 'producto' as keyof ProductDetail,
      render: (value: number) => getProductName(value)
    },
    { 
      header: 'Unidad de Medida', 
      accessor: 'config_unidad_medida' as keyof ProductDetail,
      render: (value: number) => getUnitName(value)
    },
    { header: 'Peso', accessor: 'peso' as keyof ProductDetail },
    { 
      header: 'Presentación', 
      accessor: 'config_presentacion_producto' as keyof ProductDetail,
      render: (value: number) => getPresentationName(value)
    },
    { 
      header: 'Cantidad por Presentación', 
      accessor: 'cantidad_por_presentacion' as keyof ProductDetail,
      render: (value: number | null) => value ?? 'N/A'
    },
    { header: 'Unidades por Presentación', accessor: 'unidades_por_presentacion' as keyof ProductDetail },
    { 
      header: 'Total Unidades', 
      accessor: 'total_unidades' as keyof ProductDetail,
      render: (value: number | null) => value ?? 'N/A'
    },
    { header: 'Precio Venta Presentación', accessor: 'precio_venta_presentacion' as keyof ProductDetail },
    { header: 'Precio Venta Unidades', accessor: 'precio_venta_unidades' as keyof ProductDetail },
    { 
      header: 'Proveedor', 
      accessor: 'proveedor' as keyof ProductDetail,
      render: (value: number) => getSupplierName(value)
    },
    { 
      header: 'Fecha Expiración', 
      accessor: 'fecha_expiracion' as keyof ProductDetail,
      render: (value: string | null) => value ?? 'N/A'
    },
  ];

  return (
    <div className="p-6">
      <PageHeader title="Inventario" />
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <button
              onClick={() => {}}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Devoluciones
            </button>
            <button
              onClick={() => {}}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <ArrowLeftRight className="h-5 w-5 mr-2" />
              Movimiento
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Crear detalle
            </button>
            <button
              onClick={() => {}}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              <PackagePlus className="h-5 w-5 mr-2" />
              Ingresar producto
            </button>
          </div>
        </div>

        <div className="mb-6">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar en inventario..."
          />
        </div>

        <div className="bg-white rounded-lg shadow">
          {isLoading ? (
            <div className="p-4 text-center">Cargando...</div>
          ) : (
            <>
              <Table
                data={details}
                columns={columns}
                onEdit={() => {}}
                onDelete={() => {}}
              />
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalItems}
                pageSizeOptions={[5, 10, 25, 50]}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
              />
            </>
          )}
        </div>

        <ProductDetailModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreate}
          title="Agregar Detalle de Producto"
        />
      </div>
    </div>
  );
}