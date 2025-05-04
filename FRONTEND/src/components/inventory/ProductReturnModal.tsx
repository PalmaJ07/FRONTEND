import { X } from 'lucide-react';
import { ProductReturnForm } from './ProductReturnForm';
import { CreateProductReturnData } from '../../types/inventory';

interface ProductReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductReturnData) => Promise<void>;
  title: string;
}

export function ProductReturnModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  title 
}: ProductReturnModalProps) {
  console.log("Modal abierto:", isOpen);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          <ProductReturnForm 
            onSubmit={onSubmit}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}