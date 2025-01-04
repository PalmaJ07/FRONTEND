import { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import Swal from 'sweetalert2';
import { Table } from '../../components/common/Table';
import { Pagination } from '../../components/common/Pagination';
import { SearchBar } from '../../components/common/SearchBar';
import { AddClientModal } from '../../components/clients/AddClientModal';
import { EditClientModal } from '../../components/clients/EditClientModal';
import { Client, CreateClientData } from '../../types/clients';
import { getClientList, createClient, updateClient, deleteClient } from '../../services/clients';
import { useDebounce } from '../../hooks/useDebounce';

export function ClientList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    loadClients();
  }, [currentPage, pageSize, debouncedSearch]);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      const data = await getClientList(currentPage, pageSize, debouncedSearch);
      setClients(data.clients);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalClients);
    } catch (error) {
      console.error('Error loading clients:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cargar la lista de clientes',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (data: CreateClientData) => {
    try {
      await createClient(data);
      await loadClients();
      setShowAddModal(false);
      await Swal.fire({
        title: 'Éxito',
        text: 'Cliente creado exitosamente',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error creating client:', error);
      await Swal.fire({
        title: 'Error',
        text: 'No se pudo crear el cliente',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    }
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setShowEditModal(true);
  };

  const handleUpdate = async (data: CreateClientData) => {
    if (!selectedClient) return;

    try {
      await updateClient(selectedClient.id, data);
      await loadClients();
      setShowEditModal(false);
      setSelectedClient(null);
      await Swal.fire({
        title: 'Éxito',
        text: 'Cliente actualizado exitosamente',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error updating client:', error);
      await Swal.fire({
        title: 'Error',
        text: 'No se pudo actualizar el cliente',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    }
  };

  const handleDelete = async (client: Client) => {
    try {
      const result = await Swal.fire({
        title: '¿Eliminar cliente?',
        text: `¿Estás seguro de que deseas eliminar a ${client.name}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        await deleteClient(client.id);
        await loadClients();
        
        await Swal.fire({
          title: 'Eliminado',
          text: 'El cliente ha sido eliminado exitosamente',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      await Swal.fire({
        title: 'Error',
        text: 'No se pudo eliminar el cliente',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    }
  };

  const columns = [
    { header: 'Nombre', accessor: 'name' as keyof Client },
    { header: 'ID Personal', accessor: 'personalId' as keyof Client },
    { header: 'Teléfono', accessor: 'phone' as keyof Client },
    { header: 'Dirección', accessor: 'address' as keyof Client },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <UserPlus className="h-5 w-5 mr-2" />
          Agregar Cliente
        </button>
      </div>

      <div className="mb-6">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar cliente..."
        />
      </div>

      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="p-4 text-center">Cargando...</div>
        ) : (
          <>
            <Table
              data={clients}
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

      <AddClientModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreate}
      />

      {selectedClient && (
        <EditClientModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedClient(null);
          }}
          onSubmit={handleUpdate}
          client={selectedClient}
        />
      )}
    </div>
  );
}