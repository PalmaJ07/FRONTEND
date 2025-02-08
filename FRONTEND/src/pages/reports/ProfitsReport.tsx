import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FileDown, Calendar } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { PageHeader } from '../../components/layout/PageHeader';
import { Table } from '../../components/common/Table';
import { ProfitsReport as ProfitsReportType, DateRange } from '../../types/reports';
import { reportsService } from '../../services/reports';
import { useProfile } from '../../hooks/useProfile';

export function ProfitsReport() {
  const [profitsData, setProfitsData] = useState<ProfitsReportType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: '',
    endDate: ''
  });
  const [isRangeMode, setIsRangeMode] = useState(false);
  const { profile } = useProfile();

  useEffect(() => {
    if (selectedDate || (dateRange.startDate && dateRange.endDate)) {
      loadProfits();
    }
  }, [selectedDate, dateRange]);

  const loadProfits = async () => {
    try {
      setIsLoading(true);
      let data;
      if (isRangeMode && dateRange.startDate && dateRange.endDate) {
        data = await reportsService.getProfits(undefined, dateRange);
      } else if (!isRangeMode && selectedDate) {
        data = await reportsService.getProfits(selectedDate);
      }
      if (data) {
        setProfitsData(data);
      }
    } catch (error) {
      console.error('Error loading profits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (isRangeMode) {
      setDateRange(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setSelectedDate(value);
    }
  };

  const generatePDF = () => {
    if (!profitsData) return;

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text('Reporte de Ganancias', 14, 20);
    
    // Add metadata
    doc.setFontSize(10);
    const today = format(new Date(), 'dd/MM/yyyy');
    doc.text(`Fecha de generación: ${today}`, 14, 30);
    doc.text(`Usuario: ${profile?.nombre || 'N/A'}`, 14, 35);
    
    if (isRangeMode) {
      doc.text(`Período: ${format(new Date(dateRange.startDate), 'dd/MM/yyyy')} - ${format(new Date(dateRange.endDate), 'dd/MM/yyyy')}`, 14, 40);
    } else {
      doc.text(`Fecha: ${format(new Date(selectedDate), 'dd/MM/yyyy')}`, 14, 40);
    }

    // Add summary
    doc.text('Resumen:', 14, 50);
    doc.text(`Total Ventas: C$${profitsData.total_ventas.toFixed(2)}`, 14, 55);
    doc.text(`Total Costos: C$${profitsData.total_costos.toFixed(2)}`, 14, 60);
    doc.text(`Ganancias: C$${profitsData.ganancias.toFixed(2)}`, 14, 65);

    // Add sales table
    const tableData = profitsData.ventas.map(venta => [
      venta.id.toString(),
      venta.cliente.nombre,
      `C$${venta.total_venta.toFixed(2)}`,
      format(new Date(venta.fecha_venta), 'dd/MM/yyyy')
    ]);

    (doc as any).autoTable({
      startY: 75,
      head: [['ID', 'Cliente', 'Total', 'Fecha']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [63, 81, 181] }
    });

    doc.save('reporte-ganancias.pdf');
  };

  const columns = [
    { header: 'ID', accessor: 'id' as const },
    { 
      header: 'Cliente', 
      accessor: 'cliente' as const,
      render: (value: any) => value.nombre
    },
    { 
      header: 'Total', 
      accessor: 'total_venta' as const,
      render: (value: number) => `C$${value.toFixed(2)}`
    },
    { 
      header: 'Fecha', 
      accessor: 'fecha_venta' as const,
      render: (value: string) => format(new Date(value), 'dd/MM/yyyy')
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Reporte de Ganancias" />
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6 mb-6">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">
              Tipo de Fecha:
            </label>
            <select
              value={isRangeMode ? 'range' : 'single'}
              onChange={(e) => {
                setIsRangeMode(e.target.value === 'range');
                setSelectedDate('');
                setDateRange({ startDate: '', endDate: '' });
                setProfitsData(null);
              }}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="single">Fecha única</option>
              <option value="range">Rango de fechas</option>
            </select>
          </div>

          {isRangeMode ? (
            <div className="flex space-x-4">
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          ) : (
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          )}

          <button
            onClick={generatePDF}
            disabled={!profitsData}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileDown className="h-5 w-5 mr-2" />
            Exportar PDF
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-4">Cargando...</div>
        ) : profitsData ? (
          <div className="space-y-6">
            {/* Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-green-800">Total Ventas</h3>
                <p className="mt-2 text-2xl font-semibold text-green-900">
                  C${profitsData.total_ventas.toFixed(2)}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-red-800">Total Costos</h3>
                <p className="mt-2 text-2xl font-semibold text-red-900">
                  C${profitsData.total_costos.toFixed(2)}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800">Ganancias</h3>
                <p className="mt-2 text-2xl font-semibold text-blue-900">
                  C${profitsData.ganancias.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Tabla de ventas */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Detalle de Ventas</h3>
              <Table
                data={profitsData.ventas}
                columns={columns}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            Seleccione una fecha para ver el reporte de ganancias
          </div>
        )}
      </div>
    </div>
  );
}