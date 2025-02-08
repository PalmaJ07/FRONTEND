import React, { useState, useEffect } from 'react';
import { X, FileDown } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Sale, SaleDetail } from '../../types/sales';
import { salesService } from '../../services/sales';

interface SaleDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale;
}

export function SaleDetailsModal({ isOpen, onClose, sale }: SaleDetailsModalProps) {
  const [details, setDetails] = useState<SaleDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setIsLoading(true);
        const data = await salesService.getSaleDetails(sale.rawId);
        setDetails(data);
      } catch (error) {
        console.error('Error loading sale details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadDetails();
    }
  }, [isOpen, sale.rawId]);

  const generateDetailsPDF = () => {
    const doc = new jsPDF();
    
    // Add title and header information
    doc.setFontSize(16);
    doc.text('Detalle de Venta', 14, 20);
    
    doc.setFontSize(10);
    doc.text(`Cliente: ${sale.clientName}`, 14, 30);
    doc.text(`Fecha: ${format(new Date(sale.saleDate), 'dd/MM/yyyy')}`, 14, 35);
    doc.text(`Vendedor: ${sale.employeeName}`, 14, 40);
    
    // Add table with sale details
    const tableData = details.map(detail => [
      detail.productDetailId.toString(),
      detail.quantity.toString(),
      detail.isUnits ? 'Unidades' : 'Presentación',
      `C$${detail.salePrice.toFixed(2)}`,
      `${detail.discount}${detail.isPercentageDiscount ? '%' : 'C$'}`,
      `C$${(detail.salePrice * detail.quantity).toFixed(2)}`
    ]);

    (doc as any).autoTable({
      startY: 45,
      head: [['Producto', 'Cantidad', 'Tipo', 'Precio', 'Descuento', 'Subtotal']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [63, 81, 181] },
      styles: { fontSize: 8 },
    });

    // Add totals
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.text(`Subtotal: C$${sale.totalWithoutDiscount.toFixed(2)}`, 14, finalY);
    doc.text(`Descuento: ${sale.discount}${sale.isPercentageDiscount ? '%' : 'C$'}`, 14, finalY + 5);
    doc.text(`Total: C$${sale.totalSale.toFixed(2)}`, 14, finalY + 10);

    doc.save(`detalle-venta-${sale.rawId}.pdf`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Detalle de Venta</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">Cliente</p>
              <p className="font-medium">{sale.clientName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Fecha</p>
              <p className="font-medium">{format(new Date(sale.saleDate), 'dd/MM/yyyy')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Vendedor</p>
              <p className="font-medium">{sale.employeeName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Estado</p>
              <p className="font-medium">
                {sale.isCancelled ? 'Anulada' : sale.isReturn ? 'Devuelta' : 'Completada'}
              </p>
            </div>
          </div>

          <div className="mb-4 flex justify-end">
            <button
              onClick={generateDetailsPDF}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <FileDown className="h-5 w-5 mr-2" />
              Exportar PDF
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Cargando detalles...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Producto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cantidad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descuento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {details.map((detail) => (
                      <tr key={detail.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {detail.productDetailId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {detail.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {detail.isUnits ? 'Unidades' : 'Presentación'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          C${detail.salePrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {detail.discount}{detail.isPercentageDiscount ? '%' : 'C$'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          C${(detail.salePrice * detail.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 border-t pt-4">
                <div className="flex justify-end space-y-2 text-right">
                  <div className="w-48">
                    <div className="flex justify-between">
                      <span className="font-medium">Subtotal:</span>
                      <span>C${sale.totalWithoutDiscount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Descuento:</span>
                      <span>{sale.discount}{sale.isPercentageDiscount ? '%' : 'C$'}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold mt-2">
                      <span>Total:</span>
                      <span>C${sale.totalSale.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}