import { X } from 'lucide-react';
import { StaffForm } from './StaffForm';
import { CreateStaffData } from '../../types/users';

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateStaffData) => Promise<void>;
}

export function AddStaffModal({ isOpen, onClose, onSubmit }: AddStaffModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Agregar Colaborador</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          <StaffForm onSubmit={onSubmit} onCancel={onClose} />
        </div>
      </div>
    </div>
  );
}