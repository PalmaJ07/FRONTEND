import { useState, useEffect } from "react";
import { UserPlus } from "lucide-react";
import Swal from "sweetalert2";
import { Table } from "../../components/common/Table";
import { Pagination } from "../../components/common/Pagination";
import { SearchBar } from "../../components/common/SearchBar";
import { StaffFilters } from "../../components/users/StaffFilters";
import { StatusToggle } from "../../components/common/StatusToggle";
import { AddStaffModal } from "../../components/users/AddStaffModal";
import { EditStaffModal } from "./EditStaffModal";
import { Staff, CreateStaffData } from "../../types/users";
import {
  getStaffList,
  createStaff,
  updateStaff,
  toggleStaffStatus,
  deleteStaff
} from "../../services/staff";
import { useDebounce } from "../../hooks/useDebounce";

export function StaffList() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [userType, setUserType] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    loadStaff();
  }, [currentPage, pageSize, userType, status, debouncedSearch]);

  const loadStaff = async () => {
    try {
      setIsLoading(true);
      const data = await getStaffList(
        currentPage,
        pageSize,
        userType ? parseInt(userType) : undefined,
        status ? parseInt(status) : undefined,
        debouncedSearch || undefined
      );

      setStaff(data.staff);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalUsers);
    } catch (error) {
      console.error("Error loading staff:", error);
      await Swal.fire({
        title: "Error",
        text: "No se pudo cargar la lista de colaboradores",
        icon: "error",
        confirmButtonColor: "#EF4444",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (data: CreateStaffData) => {
    try {
      await createStaff(data);
      setShowAddModal(false);
      await loadStaff();

      await Swal.fire({
        title: "Éxito",
        text: "Colaborador creado exitosamente",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error creating staff:", error);
      await Swal.fire({
        title: "Error",
        text: "No se pudo crear el colaborador",
        icon: "error",
        confirmButtonColor: "#EF4444",
      });
    }
  };

  const handleEdit = async (data: Partial<Staff>) => {
    if (!selectedStaff) return;

    try {
      await updateStaff(selectedStaff.id, data);
      setShowEditModal(false);
      setSelectedStaff(null);
      await loadStaff();

      await Swal.fire({
        title: "Éxito",
        text: "Colaborador actualizado exitosamente",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error updating staff:", error);
      await Swal.fire({
        title: "Error",
        text: "No se pudo actualizar el colaborador",
        icon: "error",
        confirmButtonColor: "#EF4444",
      });
    }
  };



  const handleStatusToggle = async (staff: Staff) => {
    try {
      await toggleStaffStatus(staff.id);
      await loadStaff();
    } catch (error) {
      console.error("Error toggling staff status:", error);
      await Swal.fire({
        title: "Error",
        text: "No se pudo cambiar el estado del colaborador",
        icon: "error",
        confirmButtonColor: "#EF4444",
      });
    }
  };

  const handleDelete = async (staff: Staff) => {
    try {
      const result = await Swal.fire({
        title: '¿Eliminar colaborador?',
        text: `¿Estás seguro de que deseas eliminar a ${staff.name}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        await deleteStaff(staff.id);
        await loadStaff();
        
        await Swal.fire({
          title: 'Eliminado',
          text: 'El colaborador ha sido eliminado exitosamente',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
      await Swal.fire({
        title: 'Error',
        text: 'No se pudo eliminar el colaborador',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    }
  };

  const columns = [
    { header: "Nombre", accessor: "name" as keyof Staff },
    { header: "ID Personal", accessor: "id_personal" as keyof Staff },
    { header: "Teléfono", accessor: "phone" as keyof Staff },
    { header: "Usuario", accessor: "username" as keyof Staff },
    { header: "Tipo", accessor: "userType" as keyof Staff },
    {
      header: "Estado",
      accessor: "isActive" as keyof Staff,
      render: (value: boolean, item: Staff) => (
        <StatusToggle
          isActive={value}
          onToggle={() => handleStatusToggle(item)}
          name={item.name}
        />
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Colaboradores</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <UserPlus className="h-5 w-5 mr-2" />
          Agregar Colaborador
        </button>
      </div>

      <div className="space-y-4 mb-6">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar colaborador..."
        />
        <StaffFilters
          userType={userType}
          status={status}
          onUserTypeChange={(value) => {
            setUserType(value);
            setCurrentPage(1);
          }}
          onStatusChange={(value) => {
            setStatus(value);
            setCurrentPage(1);
          }}
        />
      </div>

      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="p-4 text-center">Cargando...</div>
        ) : (
          <>
            <Table
              data={staff}
              columns={columns}
              onEdit={(staff) => {
                setSelectedStaff(staff);
                setShowEditModal(true);
              }}
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

      <AddStaffModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreate}
      />

      {selectedStaff && (
        <EditStaffModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedStaff(null);
          }}
          onSubmit={handleEdit}
          staff={selectedStaff}
        />
      )}
    </div>
  );
}
