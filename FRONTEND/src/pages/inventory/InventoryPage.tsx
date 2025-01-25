import { useState, useEffect } from 'react';
import { Plus, ArrowLeftRight, RotateCcw, PackagePlus } from 'lucide-react';
import Swal from 'sweetalert2';
import { PageHeader } from '../../components/layout/PageHeader';
import { Table } from '../../components/common/Table';
import { Pagination } from '../../components/common/Pagination';
import { SearchBar } from '../../components/common/SearchBar';
import { ProductDetailModal } from '../../components/inventory/ProductDetailModal';
import { ProductEntryModal } from '../../components/inventory/ProductEntryModal';
import { ProductMovementModal } from '../../components/inventory/ProductMovementModal';
import { ProductReturnModal } from '../../components/inventory/ProductReturnModal';
import { ProductDetail, CreateProductDetailData, CreateProductDetailEntryData, CreateProductMovementData, CreateProductReturnData } from '../../types/inventory';
import { inventoryService } from '../../services/inventory';
import { useDebounce } from '../../hooks/useDebounce';
import { Product } from '../../types/products';
import { productService } from '../../services/products';
import { supplierService } from '../../services/suppliers';
import { createConfigService } from '../../services/config';

const unitsService = createConfigService('unidad-medida');
const presentationsService = createConfigService('presentacion');
const storageService = createConfigService('almacen');

export function InventoryPage() {
  const [details, setDetails] = useState<ProductDetail[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [units, setUnits] = useState<{ id: string; name: string }[]>([]);
  const [presentations, setPresentations] = useState<{ id: string; name: string }[]>([]);
  const [suppliers, setSuppliers] = useState<{ id: string; supplierName: string }[]>([]);
  const [storages, setStorages] = useState<{ id: string; name: string }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<ProductDetail | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        const [productsData, unitsData, storagesData, presentationsData, suppliersData] = await Promise.all([
          productService.getList(1, 100),
          unitsService.getList(1, 100),
          storageService.getList(1, 100),
          presentationsService.getList(1, 100),
          supplierService.getList(1, 100),
        ]);
        
        setProducts(productsData.items);
        setUnits(unitsData.items);
        setStorages(storagesData.items);
        setPresentations(presentationsData.items);
        setSuppliers(suppliersData.items);
      } catch (error) {
        console.error('Error loading reference data:', error);
      }
    };
    loadReferenceData();
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

  const handleEdit = (detail: ProductDetail) => {
    setSelectedDetail(detail);
    setShowEditModal(true);
  };

  const handleUpdate = async (data: CreateProductDetailData) => {
    if (!selectedDetail) return;

    try {
      await inventoryService.update(selectedDetail.id, data);
      await loadDetails();
      setShowEditModal(false);
      setSelectedDetail(null);
      await Swal.fire({
        title: 'Éxito',
        text: 'Detalle actualizado exitosamente',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error updating detail:', error);
      await Swal.fire({
        title: 'Error',
        text: 'No se pudo actualizar el detalle',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    }
  };

  const handleDelete = async (detail: ProductDetail) => {
    try {
      const result = await Swal.fire({
        title: '¿Eliminar detalle?',
        text: `¿Estás seguro de que deseas eliminar este detalle de producto?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        await inventoryService.delete(detail.id);
        await loadDetails();
        
        await Swal.fire({
          title: 'Eliminado',
          text: 'El detalle ha sido eliminado exitosamente',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Error deleting detail:', error);
      await Swal.fire({
        title: 'Error',
        text: 'No se pudo eliminar el detalle',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    }
  };

  const handleCreateEntry = async (data: CreateProductDetailEntryData) => {
    try {
      await inventoryService.createEntry(data);
      await loadDetails();
      setShowEntryModal(false);
      await Swal.fire({
        title: 'Éxito',
        text: 'Producto ingresado exitosamente',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error creating entry:', error);
      await Swal.fire({
        title: 'Error',
        text: 'No se pudo ingresar el producto',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    }
  };

  const handleCreateMovement = async (data: CreateProductMovementData) => {
    try {
      await inventoryService.createMovement(data);
      await loadDetails();
      setShowMovementModal(false);
      await Swal.fire({
        title: 'Éxito',
        text: 'Movimiento creado exitosamente',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error creating movement:', error);
      await Swal.fire({
        title: 'Error',
        text: 'No se pudo crear el movimiento',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    }
  };

  const handleCreateReturn = async (data: CreateProductReturnData) => {
    try {
      await inventoryService.createReturn(data);
      await loadDetails();
      setShowReturnModal(false);
      await Swal.fire({
        title: 'Éxito',
        text: 'Devolución creada exitosamente',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error creating return:', error);
      await Swal.fire({
        title: 'Error',
        text: 'No se pudo crear la devolución',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    }
  };

  const getProductName = (productId: number) => {
    const product = products.find(p => parseInt(atob(p.id)) === productId);
    return product?.description || 'N/A';
  };

  const getUnitName = (unitId: number) => {
    const unit = units.find(u => parseInt(atob(u.id)) === unitId);
    return unit?.name || 'N/A';
  };

  const getPresentationName = (presentationId: number) => {
    const presentation = presentations.find(p => parseInt(atob(p.id)) === presentationId);
    return presentation?.name || 'N/A';
  };

  const getSupplierName = (supplierId: number) => {
    const supplier = suppliers.find(s => parseInt(atob(s.id)) === supplierId);
    return supplier?.supplierName || 'N/A';
  };

  const getStorageName = (storageId: number | null) => {
    if (!storageId) return 'N/A';
    const storage = storages.find(s => parseInt(atob(s.id)) === storageId);
    return storage?.name || 'N/A';
  };

  const columns = [
    { 
      header: 'Producto', 
      accessor: 'producto' as keyof ProductDetail,
      render: (value: number) => getProductName(value)
    },
    { 
      header: 'Almacén', 
      accessor: 'almacen' as keyof ProductDetail,
      render: (value: number | null) => getStorageName(value)
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
    { 
      header: 'Precio Venta Presentación', 
      accessor: 'precio_venta_presentacion' as keyof ProductDetail,
      render: (value: number) => value + ' C$' 
    },
    { 
      header: 'Precio Venta Unidades', 
      accessor: 'precio_venta_unidades' as keyof ProductDetail,
      render: (value: number) => value + ' C$'
    },
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
              onClick={() => setShowReturnModal(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Devoluciones
            </button>
            <button
              onClick={() => setShowMovementModal(true)}
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
              onClick={() => setShowEntryModal(true)}
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
                onEdit={handleEdit}
                onDelete={handleDelete}
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

        {selectedDetail && (
          <ProductDetailModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedDetail(null);
            }}
            onSubmit={handleUpdate}
            title="Editar Detalle de Producto"
            initialData={selectedDetail}
            isEditing
          />
        )}

        <ProductEntryModal
          isOpen={showEntryModal}
          onClose={() => setShowEntryModal(false)}
          onSubmit={handleCreateEntry}
          title="Ingresar Producto"
        />

        <ProductMovementModal
          isOpen={showMovementModal}
          onClose={() => setShowMovementModal(false)}
          onSubmit={handleCreateMovement}
          title="Movimiento de Producto"
        />

        <ProductReturnModal
          isOpen={showReturnModal}
          onClose={() => setShowReturnModal(false)}
          onSubmit={handleCreateReturn}
          title="Devolución de Producto"
        />
      </div>
    </div>
  );
}