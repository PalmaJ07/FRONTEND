import { X } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userInfo: {
    name: string;
    username: string;
    phone: string;
    personalId: string;
    userType: string;
  };
}

export function ProfileModal({ isOpen, onClose, userInfo }: ProfileModalProps) {
  if (!isOpen) return null;

  const fields = [
    { label: 'Nombre', value: userInfo.name },
    { label: 'Usuario', value: userInfo.username },
    { label: 'Teléfono', value: userInfo.phone },
    { label: 'Cedula de identidad', value: userInfo.personalId },
    { label: 'Tipo de Usuario', value: userInfo.userType },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Perfil de Usuario</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          {fields.map(({ label, value }) => (
            <div key={label} className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {label}
              </label>
              <div className="text-gray-800 bg-gray-50 p-2 rounded">
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}