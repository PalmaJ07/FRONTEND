import { Package } from 'lucide-react';
import { ProductDetail } from '../../types/sales';

interface ProductSearchResultsProps {
  products: ProductDetail[];
  onSelect: (product: ProductDetail) => void;
}

export function ProductSearchResults({ products, onSelect }: ProductSearchResultsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <div
          key={product.encrypted_id}
          className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onSelect(product)}
        >
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{product.n_producto}</h3>
              <p className="text-sm text-gray-500">Peso: {product.peso}kg</p>
              <p className="text-sm text-gray-500">
                Unidades: {product.unidades_por_presentacion}
              </p>
              <p className="mt-1 text-blue-600 font-medium">
                ${product.precio_venta_unidades}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}