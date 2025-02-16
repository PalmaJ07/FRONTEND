import React, { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { FileDown, Calendar } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { PageHeader } from '../../components/layout/PageHeader';
import { Table } from '../../components/common/Table';
import { Movement, DateRange } from '../../types/reports';
import { reportsService } from '../../services/reports';
import { useProfile } from '../../hooks/useProfile';
import { toZonedTime } from 'date-fns-tz';

export function MovementsReport() {
  const getCurrentDate = () => {
    const now = new Date();
    const managua = toZonedTime(now, 'America/Managua');
    return format(managua, 'yyyy-MM-dd');
  };

  const [movements, setMovements] = useState<Movement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(getCurrentDate());
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: '',
    endDate: ''
  });
  const [isRangeMode, setIsRangeMode] = useState(false);
  const { profile } = useProfile();

  useEffect(() => {
    loadMovements();
  }, [selectedDate, dateRange]);

  const loadMovements = async () => {
    try {
      setIsLoading(true);
      let data;
      if (isRangeMode && dateRange.startDate && dateRange.endDate) {
        data = await reportsService.getMovements(undefined, dateRange);
      } else if (!isRangeMode && selectedDate) {
        data = await reportsService.getMovements(selectedDate);
      }
      if (data) {
        setMovements(data);
      }
    } catch (error) {
      console.error('Error loading movements:', error);
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
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text('Reporte de Movimientos', 14, 20);
    
    // Add date and user info
    doc.setFontSize(10);
    const today = format(new Date(), 'dd/MM/yyyy');
    doc.text(`Fecha de generación: ${today}`, 14, 30);
    doc.text(`Usuario: ${profile?.nombre || 'N/A'}`, 14, 35);
    
    if (isRangeMode) {
      doc.text(`Período: ${format(new Date(dateRange.startDate), 'dd/MM/yyyy')} - ${format(new Date(dateRange.endDate), 'dd/MM/yyyy')}`, 14, 40);
    } else {
      doc.text(`Fecha: ${format(new Date(selectedDate), 'dd/MM/yyyy')}`, 14, 40);
    }

    // Add table
    const tableData = movements.map(movement => [
      movement.producto,
      movement.producto_detalle_origen,
      movement.producto_detalle_destino,
      movement.cantidad_por_presentacion.toString(),
      movement.unidades_por_presentacion.toString(),
      format(addDays(new Date(movement.fecha), 1), 'dd/MM/yyyy'),
      format(addDays(new Date(movement.fecha_expiracion), 1), 'dd/MM/yyyy')
    ]);

    (doc as any).autoTable({
      startY: 45,
      head: [['Producto', 'Origen', 'Destino', 'Cant. Present.', 'Unid. Present.', 'Fecha', 'Fecha Exp.']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [63, 81, 181] }
    });

    doc.save('reporte-movimientos.pdf');
  };

  const columns = [
    { header: 'Producto', accessor: 'producto' as keyof Movement },
    { header: 'Origen', accessor: 'producto_detalle_origen' as keyof Movement },
    { header: 'Destino', accessor: 'producto_detalle_destino' as keyof Movement },
    { header: 'Cant. Present.', accessor: 'cantidad_por_presentacion' as keyof Movement },
    { header: 'Unid. Present.', accessor: 'unidades_por_presentacion' as keyof Movement },
    { 
      header: 'Fecha', 
      accessor: 'fecha' as keyof Movement,
      render: (value: string) => format(addDays(new Date(value), 1), 'dd/MM/yyyy')
    },
    { 
      header: 'Fecha Exp.', 
      accessor: 'fecha_expiracion' as keyof Movement,
      render: (value: string) => format(addDays(new Date(value), 1), 'dd/MM/yyyy')
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Reporte de Movimientos" />
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">
              Tipo de Fecha:
            </label>
            <select
              value={isRangeMode ? 'range' : 'single'}
              onChange={(e) => {
                setIsRangeMode(e.target.value === 'range');
                setSelectedDate(getCurrentDate());
                setDateRange({ startDate: '', endDate: '' });
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
            disabled={movements.length === 0}
            className="ml-auto flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileDown className="h-5 w-5 mr-2" />
            Descargar PDF
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-4">Cargando...</div>
        ) : movements.length > 0 ? (
          <Table
            data={movements}
            columns={columns}
          />
        ) : (
          <div className="text-center py-4 text-gray-500">
            No hay datos para mostrar. Selecciona una fecha para ver los movimientos.
          </div>
        )}
      </div>
    </div>
  );
}