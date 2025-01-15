import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import Swal from 'sweetalert2';
import { PageHeader } from '../../components/layout/PageHeader';
import { Table } from '../../components/common/Table';
import { Pagination } from '../../components/common/Pagination';
import { SearchBar } from '../../components/common/SearchBar';
import { ProductModal } from '../../components/products/ProductModal';
import { Product, ProductFormData } from '../../types/products';
import { productService } from '../../services/products';
import { categoryService } from '../../services/categories';
import { brandService } from '../../services/brands';
import { useDebounce } from '../../hooks/useDebounce';
import { Category } from '../../types/categories';
import { Brand } from '../../types/brands';

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesData, brandsData] = await Promise.all([
          categoryService.getAll(),
          brandService.getAll()
        ]);
        setCategories(categoriesData);
        setBrands(brandsData);
      } catch (error) {
        console.error('Error loading categories and brands:', error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [currentPage, pageSize, debouncedSearch]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const data = await productService.getList(currentPage, pageSize, debouncedSearch);
      setProducts(data.items);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
    } catch (error) {
      console.error('Error loading products:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cargar la lista de productos',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (data: ProductFormData) => {
    try {
      await productService.create(data);
      await loadProducts();
      setShowAddModal(false);
      await Swal.fire({
        title: 'Éxito',
        text: 'Producto creado exitosamente',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error creating product:', error);
      await Swal.fire({
        title: 'Error',
        text: 'No se pudo crear el producto',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleUpdate = async (data: ProductFormData) => {
    if (!selectedProduct) return;

    try {
      await productService.update(selectedProduct.id, data);
      await loadProducts();
      setShowEditModal(false);
      setSelectedProduct(null);
      await Swal.fire({
        title: 'Éxito',
        text: 'Producto actualizado exitosamente',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error updating product:', error);
      await Swal.fire({
        title: 'Error',
        text: 'No se pudo actualizar el producto',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    }
  };

  const handleDelete = async (product: Product) => {
    try {
      const result = await Swal.fire({
        title: '¿Eliminar producto?',
        text: `¿Estás seguro de que deseas eliminar el producto ${product.description}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        await productService.delete(product.id);
        await loadProducts();
        
        await Swal.fire({
          title: 'Eliminado',
          text: 'El producto ha sido eliminado exitosamente',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      await Swal.fire({
        title: 'Error',
        text: 'No se pudo eliminar el producto',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    }
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'N/A';
  };

  const getBrandName = (brandId: number) => {
    const brand = brands.find(b => b.id === brandId);
    return brand?.name || 'N/A';
  };

  const columns = [
    { header: 'Código', accessor: 'code' as keyof Product },
    { header: 'Descripción', accessor: 'description' as keyof Product },
    { 
      header: 'Categoría', 
      accessor: 'categoryId' as keyof Product,
      render: (value: string | number) => getCategoryName(Number(value))
    },
    { 
      header: 'Marca', 
      accessor: 'brandId' as keyof Product,
      render: (value: string | number) => getBrandName(Number(value))
    },
  ];

  return (
    <div className="p-6">
      <PageHeader title="Gestión de Productos" />
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Agregar Producto
          </button>
        </div>

        <div className="mb-6">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar producto..."
          />
        </div>

        <div className="bg-white rounded-lg shadow">
          {isLoading ? (
            <div className="p-4 text-center">Cargando...</div>
          ) : (
            <>
              <Table
                data={products}
                columns={columns}
                onEdit={handleEdit}
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

        <ProductModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreate}
          title="Agregar Producto"
        />

        {selectedProduct && (
          <ProductModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedProduct(null);
            }}
            onSubmit={handleUpdate}
            title="Editar Producto"
            initialData={selectedProduct}
            isEditing
          />
        )}
      </div>
    </div>
  );
}