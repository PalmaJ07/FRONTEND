import { PageHeader } from '../../components/layout/PageHeader';

export function SalesReport() {
  return (
    <div className="p-6">
      <PageHeader title="Reporte de Ventas" />
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          Aquí podrás ver el reporte detallado de todas las ventas realizadas.
        </p>
      </div>
    </div>
  );
}