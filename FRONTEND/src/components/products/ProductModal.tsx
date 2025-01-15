//import React from 'react';
import { X } from 'lucide-react';
import { ProductForm } from './ProductForm';
import { Product, ProductFormData } from '../../types/products';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => Promise<void>;
  title: string;
  initialData?: Product;
  isEditing?: boolean;
}

export function ProductModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  title,
  initialData,
  isEditing = false 
}: ProductModalProps) {
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
          <ProductForm 
            onSubmit={onSubmit}
            onCancel={onClose}
            initialData={initialData}
            isEditing={isEditing}
          />
        </div>
      </div>
    </div>
  );
}