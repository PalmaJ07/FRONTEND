import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import Swal from 'sweetalert2';
import { Table } from '../common/Table';
import { Pagination } from '../common/Pagination';
import { SearchBar } from '../common/SearchBar';
import { ConfigModal } from './ConfigModal';
import { ConfigItem, ConfigFormData } from '../../types/config';
import { useDebounce } from '../../hooks/useDebounce';

interface ConfigListProps {
  title: string;
  service: ReturnType<typeof createConfigService>;
}

export function ConfigList({ title, service }: ConfigListProps) {
  const [items, setItems] = useState<ConfigItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ConfigItem | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    loadItems();
  }, [currentPage, pageSize, debouncedSearch]);

  const loadItems = async () => {
    try {
      setIsLoading(true);
      const data = await service.getList(currentPage, pageSize, debouncedSearch);
      setItems(data.items);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
    } catch (error) {
      console.error('Error loading items:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cargar la lista',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (data: ConfigFormData) => {
    try {
      await service.create(data);
      await loadItems();
      setShowAddModal(false);
      await Swal.fire({
        title: 'Éxito',
        text: 'Elemento creado exitosamente',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error creating item:', error);
      await Swal.fire({
        title: 'Error',
        text: 'No se pudo crear el elemento',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    }
  };

  const handleEdit = (item: ConfigItem) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  const handleUpdate = async (data: ConfigFormData) => {
    if (!selectedItem) return;

    try {
      await service.update(selectedItem.id, data);
      await loadItems();
      setShowEditModal(false);
      setSelectedItem(null);
      await Swal.fire({
        title: 'Éxito',
        text: 'Elemento actualizado exitosamente',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error updating item:', error);
      await Swal.fire({
        title: 'Error',
        text: 'No se pudo actualizar el elemento',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    }
  };

  const handleDelete = async (item: ConfigItem) => {
    try {
      const result = await Swal.fire({
        title: '¿Eliminar elemento?',
        text: `¿Estás seguro de que deseas eliminar ${item.name}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        await service.delete(item.id);
        await loadItems();
        
        await Swal.fire({
          title: 'Eliminado',
          text: 'El elemento ha sido eliminado exitosamente',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      await Swal.fire({
        title: 'Error',
        text: 'No se pudo eliminar el elemento',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    }
  };

  const columns = [
    { header: 'Nombre', accessor: 'name' as keyof ConfigItem },
    { header: 'Abreviatura', accessor: 'abbreviation' as keyof ConfigItem },
    { header: 'Orden', accessor: 'order' as keyof ConfigItem },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Agregar
        </button>
      </div>

      <div className="mb-6">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder={`Buscar ${title.toLowerCase()}...`}
        />
      </div>

      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="p-4 text-center">Cargando...</div>
        ) : (
          <>
            <Table
              data={items}
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

      <ConfigModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreate}
        title={`Agregar ${title}`}
      />

      {selectedItem && (
        <ConfigModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedItem(null);
          }}
          onSubmit={handleUpdate}
          title={`Editar ${title}`}
          initialData={selectedItem}
          isEditing
        />
      )}
    </div>
  );
}