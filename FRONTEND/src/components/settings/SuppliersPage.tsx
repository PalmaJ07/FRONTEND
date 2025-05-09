import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import Swal from 'sweetalert2';
import { PageHeader } from '../../components/layout/PageHeader';
import { Table } from '../../components/common/Table';
import { Pagination } from '../../components/common/Pagination';
import { SearchBar } from '../../components/common/SearchBar';
import { SupplierModal } from '../../components/suppliers/SupplierModal';
import { Supplier, SupplierFormData } from '../../types/suppliers';
import { supplierService } from '../../services/suppliers';
import { useDebounce } from '../../hooks/useDebounce';

export function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    loadSuppliers();
  }, [currentPage, pageSize, debouncedSearch]);

  const loadSuppliers = async () => {
    try {
      setIsLoading(true);
      const data = await supplierService.getList(currentPage, pageSize, debouncedSearch);
      setSuppliers(data.items);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
    } catch (error) {
      console.error('Error loading suppliers:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cargar la lista de proveedores',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (data: SupplierFormData) => {
    try {
      await supplierService.create(data);
      await loadSuppliers();
      setShowAddModal(false);
      await Swal.fire({
        title: 'Éxito',
        text: 'Proveedor creado exitosamente',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error creating supplier:', error);
      await Swal.fire({
        title: 'Error',
        text: 'No se pudo crear el proveedor',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowEditModal(true);
  };

  const handleUpdate = async (data: SupplierFormData) => {
    if (!selectedSupplier) return;

    try {
      await supplierService.update(selectedSupplier.id, data);
      await loadSuppliers();
      setShowEditModal(false);
      setSelectedSupplier(null);
      await Swal.fire({
        title: 'Éxito',
        text: 'Proveedor actualizado exitosamente',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error updating supplier:', error);
      await Swal.fire({
        title: 'Error',
        text: 'No se pudo actualizar el proveedor',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    }
  };

  const handleDelete = async (supplier: Supplier) => {
    try {
      const result = await Swal.fire({
        title: '¿Eliminar proveedor?',
        text: `¿Estás seguro de que deseas eliminar a ${supplier.supplierName}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        await supplierService.delete(supplier.id);
        await loadSuppliers();
        
        await Swal.fire({
          title: 'Eliminado',
          text: 'El proveedor ha sido eliminado exitosamente',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Error deleting supplier:', error);
      await Swal.fire({
        title: 'Error',
        text: 'No se pudo eliminar el proveedor',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    }
  };

  const columns = [
    { header: 'Nombre', accessor: 'supplierName' as keyof Supplier },
    { header: 'Teléfono', accessor: 'phone' as keyof Supplier },
    { header: 'Encargado', accessor: 'manager' as keyof Supplier },
    { header: 'Teléfono Encargado', accessor: 'managerPhone' as keyof Supplier },
  ];

  return (
    <div className="p-6">
      <PageHeader title="Gestión de Proveedores" />
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Agregar Proveedor
          </button>
        </div>

        <div className="mb-6">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar proveedor..."
          />
        </div>

        <div className="bg-white rounded-lg shadow">
          {isLoading ? (
            <div className="p-4 text-center">Cargando...</div>
          ) : (
            <>
              <Table
                data={suppliers}
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

        <SupplierModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreate}
          title="Agregar Proveedor"
        />

        {selectedSupplier && (
          <SupplierModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedSupplier(null);
            }}
            onSubmit={handleUpdate}
            title="Editar Proveedor"
            initialData={selectedSupplier}
            isEditing
          />
        )}
      </div>
    </div>
  );
}