import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { PageHeader } from '../../components/layout/PageHeader';
import { ReportTable } from '../../components/common/ReportTable';
import { Pagination } from '../../components/common/Pagination';
import { SearchBar } from '../../components/common/SearchBar';
import { SaleDetailsModal } from '../../components/sales/SaleDetailsModal';
import { Sale } from '../../types/sales';
import { salesService } from '../../services/sales';
import { useDebounce } from '../../hooks/useDebounce';
import { useProfile } from '../../hooks/useProfile';
import Swal from 'sweetalert2';

export function SalesReport() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const { profile } = useProfile();

  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    loadSales();
  }, [currentPage, pageSize, debouncedSearch]);

  const loadSales = async () => {
    try {
      setIsLoading(true);
      const data = await salesService.getList(currentPage, pageSize, debouncedSearch);
      setSales(data.items);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
    } catch (error) {
      console.error('Error loading sales:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cargar el reporte de ventas',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text('Reporte de Ventas', 14, 20);
    
    // Add metadata
    doc.setFontSize(10);
    const today = format(new Date(), 'dd/MM/yyyy');
    doc.text(`Fecha de generación: ${today}`, 14, 30);
    doc.text(`Usuario: ${profile?.nombre || 'N/A'}`, 14, 35);
    
    // Add table
    const tableData = sales.map(sale => [
      sale.clientName,
      `C$${sale.totalSale.toFixed(2)}`,
      format(new Date(sale.saleDate), 'dd/MM/yyyy'),
      sale.employeeName
    ]);

    (doc as any).autoTable({
      startY: 45,
      head: [['Cliente', 'Total', 'Fecha', 'Vendedor']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [63, 81, 181] },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 30, halign: 'right' },
        2: { cellWidth: 30 },
        3: { cellWidth: 50 }
      }
    });

    doc.save('reporte-ventas.pdf');
  };

  const handleRowClick = (sale: Sale) => {
    setSelectedSale(sale);
  };

  const columns = [
    { 
      header: 'Cliente', 
      accessor: 'clientName' as keyof Sale 
    },
    { 
      header: 'Total Venta', 
      accessor: 'totalSale' as keyof Sale,
      render: (value: number) => `C$${value.toFixed(2)}`
    },
    { 
      header: 'Fecha', 
      accessor: 'saleDate' as keyof Sale,
      render: (value: string) => format(new Date(value), 'dd/MM/yyyy')
    },
    { 
      header: 'Vendedor', 
      accessor: 'employeeName' as keyof Sale 
    },
    {
      header: 'Estado',
      accessor: 'isCancelled' as keyof Sale,
      render: (value: boolean, sale: Sale) => 
        value ? 'Anulada' : (sale.isReturn ? 'Devuelta' : 'Completada')
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Reporte de Ventas" />
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="w-96">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar ventas..."
            />
          </div>
          <button
            onClick={generatePDF}
            disabled={sales.length === 0}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileDown className="h-5 w-5 mr-2" />
            Exportar PDF
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-4">Cargando...</div>
        ) : sales.length > 0 ? (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.header}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {column.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sales.map((sale) => (
                    <tr
                      key={sale.id}
                      onClick={() => handleRowClick(sale)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      {columns.map((column) => (
                        <td
                          key={`${sale.id}-${column.header}`}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          {column.render
                            ? column.render(sale[column.accessor], sale)
                            : String(sale[column.accessor])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={totalItems}
              pageSizeOptions={[5, 10, 25, 50]}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            No hay ventas para mostrar
          </div>
        )}
      </div>

      {selectedSale && (
        <SaleDetailsModal
          isOpen={true}
          onClose={() => setSelectedSale(null)}
          sale={selectedSale}
        />
      )}
    </div>
  );
}