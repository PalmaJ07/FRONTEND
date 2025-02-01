import { PageHeader } from '../../components/layout/PageHeader';

export function ProfitsReport() {
  return (
    <div className="p-6">
      <PageHeader title="Reporte de Ganancias" />
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          Aquí podrás ver el reporte detallado de las ganancias generadas.
        </p>
      </div>
    </div>
  );
}