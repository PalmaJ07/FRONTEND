import { X } from 'lucide-react';
import { StaffForm } from '../../components/users/StaffForm';
import { Staff } from '../../types/users';

interface EditStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Staff>) => Promise<void>;
  staff: Staff;
}

export function EditStaffModal({ isOpen, onClose, onSubmit, staff }: EditStaffModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Editar Colaborador</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          <StaffForm 
            onSubmit={onSubmit} 
            onCancel={onClose}
            initialData={staff}
            isEditing
          />
        </div>
      </div>
    </div>
  );
}