import Swal from 'sweetalert2';
import { ToggleSwitch } from './ToggleSwitch';

interface StatusToggleProps {
  isActive: boolean;
  onToggle: (newStatus: boolean) => void;
  name: string;
}

export function StatusToggle({ isActive, onToggle, name }: StatusToggleProps) {
  const handleToggle = async (checked: boolean) => {
    const newStatus = !isActive;
    const result = await Swal.fire({
      title: '¿Cambiar estado?',
      text: `¿Estás seguro de que deseas cambiar el estado de ${name} a ${newStatus ? 'activo' : 'inactivo'}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: newStatus ? '#10B981' : '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      onToggle(newStatus);
      await Swal.fire({
        title: 'Estado actualizado',
        text: `El estado se ha cambiado a ${newStatus ? 'activo' : 'inactivo'} exitosamente`,
        icon: 'success',
        confirmButtonColor: '#10B981'
      });
    }
  };

  return (
    <ToggleSwitch
      checked={isActive}
      onChange={handleToggle}
      size="md"
    />
  );
}