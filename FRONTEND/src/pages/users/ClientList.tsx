import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Table } from '../../components/common/Table';
import { Pagination } from '../../components/common/Pagination';
import { SearchBar } from '../../components/common/SearchBar';
import { Client } from '../../types/users';

// Mock data - replace with actual API calls
const mockClients: Client[] = [
  {
    id: '1',
    name: 'María García',
    phone: '+502 5555-5555',
    address: 'Calle Principal 123',
    identityCard: '0987654321',
  },
  // Add more mock data as needed
];

const columns = [
  { header: 'Nombre', accessor: 'name' as keyof Client },
  { header: 'Cédula', accessor: 'identityCard' as keyof Client },
  { header: 'Teléfono', accessor: 'phone' as keyof Client },
  { header: 'Dirección', accessor: 'address' as keyof Client },
];

export function ClientList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const handleEdit = (client: Client) => {
    console.log('Edit client:', client);
    // Implement edit functionality
  };

  const handleDelete = (client: Client) => {
    console.log('Delete client:', client);
    // Implement delete functionality
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
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
        <Table
          data={mockClients}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        <Pagination
          currentPage={currentPage}
          totalPages={5} // Calculate based on actual data
          pageSize={pageSize}
          pageSizeOptions={[5, 10, 25, 50]}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </div>
  );
}