import { X } from 'lucide-react';
import { ProductDetailForm } from './ProductDetailForm';
import { CreateProductDetailData, ProductDetail } from '../../types/inventory';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductDetailData) => Promise<void>;
  title: string;
  initialData?: ProductDetail;
  isEditing?: boolean;
}

export function ProductDetailModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  title,
  initialData,
  isEditing = false
}: ProductDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
  <div className="bg-white rounded-lg shadow-xl w-full max-w-lg relative">
    <div className="flex justify-between items-center p-6 border-b">
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      <button
        onClick={onClose}
        className="text-gray-500 hover:text-gray-700 transition-colors"
      >
        <X className="h-6 w-6" />
      </button>
    </div>

    <div className="p-7">
      <ProductDetailForm 
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